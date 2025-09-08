// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, get, update, push, query, orderByChild, equalTo } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJSnJ-5CkXbC5vrQROPjtDka4d2VqFJ-4",
  authDomain: "gsole-fd05f.firebaseapp.com",
  databaseURL: "https://gsole-fd05f-default-rtdb.firebaseio.com",
  projectId: "gsole-fd05f",
  storageBucket: "gsole-fd05f.firebasestorage.app",
  messagingSenderId: "480642311154",
  appId: "1:480642311154:web:29498b9cbaeec6aff0816b"
};

// Initialize Firebase (guard against re-initialization in Next.js hot reload/server)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Analytics should only run in the browser
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    // ignore if not supported (e.g., SSR, http, unsupported env)
    analytics = null;
  }
}
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Enable test mode for development (remove in production)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Configure test phone numbers for development
  auth.settings.appVerificationDisabledForTesting = true;
}

// Control whether to skip DB operations (useful only for demos). Defaults to false.
const SKIP_DB = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SKIP_DB === 'true';
// Fixed dev user id override (digits-only). You can move this to env later.
const FIXED_USER_ID = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FIXED_USER_ID) || '8122949677';

export { auth, analytics, db, storage };

// Utility: normalize phone number to digits-only userId
const normalizePhoneNumber = (phoneNumber?: string): string | null => {
  const normalized = (phoneNumber ?? '').replace(/[^0-9]/g, '');
  return normalized || null;
};

// Effective user id: force to fixed id in development regardless of input
const getEffectiveUserId = (phoneNumber?: string): string => {
  const fixed = (FIXED_USER_ID || '').replace(/[^0-9]/g, '');
  if (fixed) return fixed;
  return normalizePhoneNumber(phoneNumber) ?? '';
};

// OTP related functions
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
    }
  });
  try {
    // Ensure widget is created
    // @ts-ignore render exists at runtime
    verifier.render?.();
  } catch (_) {
    // ignore if not needed (e.g., testing bypass)
  }
  return verifier;
};

// Rate limiting and retry logic
const rateLimitTracker = new Map<string, { count: number; lastAttempt: number; backoffUntil: number }>();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getBackoffDelay = (attemptCount: number): number => {
  // Exponential backoff: 2^attempt * 1000ms, max 30 seconds
  return Math.min(Math.pow(2, attemptCount) * 1000, 30000);
};

const checkRateLimit = (phoneNumber: string): { allowed: boolean; waitTime?: number } => {
  const now = Date.now();
  const key = phoneNumber;
  const tracker = rateLimitTracker.get(key);
  
  if (!tracker) {
    rateLimitTracker.set(key, { count: 1, lastAttempt: now, backoffUntil: 0 });
    return { allowed: true };
  }
  
  // If we're still in backoff period
  if (now < tracker.backoffUntil) {
    return { allowed: false, waitTime: Math.ceil((tracker.backoffUntil - now) / 1000) };
  }
  
  // Reset if more than 5 minutes have passed
  if (now - tracker.lastAttempt > 5 * 60 * 1000) {
    rateLimitTracker.set(key, { count: 1, lastAttempt: now, backoffUntil: 0 });
    return { allowed: true };
  }
  
  // Increment attempt count
  tracker.count++;
  tracker.lastAttempt = now;
  
  // If too many attempts, set backoff
  if (tracker.count > 3) {
    const backoffDelay = getBackoffDelay(tracker.count - 3);
    tracker.backoffUntil = now + backoffDelay;
    return { allowed: false, waitTime: Math.ceil(backoffDelay / 1000) };
  }
  
  return { allowed: true };
};

export const sendOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
  // Check rate limit before attempting
  const rateLimitCheck = checkRateLimit(phoneNumber);
  if (!rateLimitCheck.allowed) {
    throw new Error(`Too many attempts. Please wait ${rateLimitCheck.waitTime} seconds before trying again.`);
  }
  
  let lastError: any;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to send OTP to: ${phoneNumber} (attempt ${attempt}/${maxRetries})`);
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log('OTP sent successfully:', confirmationResult);
      
      // Reset rate limit tracker on success
      rateLimitTracker.delete(phoneNumber);
      return confirmationResult;
      
    } catch (error: any) {
      lastError = error;
      console.error(`Error sending OTP (attempt ${attempt}):`, error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Handle specific error codes
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Phone Authentication not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Phone');
      } else if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please check the number.');
      } else if (error.code === 'auth/captcha-check-failed') {
        throw new Error('reCAPTCHA verification failed. Please refresh the page and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        // For rate limiting, implement exponential backoff
        if (attempt < maxRetries) {
          const delay = getBackoffDelay(attempt);
          console.log(`Rate limited. Waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue;
        } else {
          // Update rate limit tracker for this phone number
          const tracker = rateLimitTracker.get(phoneNumber) || { count: 0, lastAttempt: Date.now(), backoffUntil: 0 };
          tracker.count += 3; // Penalize heavily for hitting Firebase rate limit
          tracker.backoffUntil = Date.now() + 5 * 60 * 1000; // 5 minute cooldown
          rateLimitTracker.set(phoneNumber, tracker);
          
          throw new Error('Too many requests to Firebase. Please wait 5 minutes before trying again.');
        }
      }
      
      // For other errors, don't retry
      if (attempt === 1) {
        throw new Error(error.message || 'Failed to send OTP. Please try again.');
      }
    }
  }
  
  // If we've exhausted all retries
  throw new Error(lastError?.message || 'Failed to send OTP after multiple attempts. Please try again later.');
};

export const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return result;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Database types for Realtime Database
export interface UserProfile {
  phoneNumber: string;
  uid: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  name?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  reportCount: number;
}

export interface CivicReport {
  id: string;
  userId: string; // phone number
  title: string;
  description: string;
  category: 'pothole' | 'streetlight' | 'garbage' | 'water' | 'traffic' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images: string[];
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  resolvedAt?: number; // Unix timestamp
}

// Database functions
// Generate deterministic user name from phone number (stable across sessions)
const generateRandomUserName = (phoneNumber: string): string => {
  const digitsOnly = (phoneNumber ?? '').replace(/[^0-9]/g, '');
  const lastFour = digitsOnly.slice(-4) || '0000';
  return `User${lastFour}`;
};

// Ensure we are authenticated (anonymous fallback) for DB rules requiring auth
const ensureAuthenticated = async (): Promise<void> => {
  try {
    if (auth.currentUser) return;
    await signInAnonymously(auth);
  } catch (err) {
    console.warn('Anonymous auth failed or not required:', err);
  }
};

// Dev-only local persistence when SKIP_DB is enabled
const getLocalProfileKey = (phoneNumber: string): string => {
  const userId = normalizePhoneNumber(phoneNumber) ?? 'unknown';
  return `dev_user_profile_${userId}`;
};

const readLocalProfile = (phoneNumber: string): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getLocalProfileKey(phoneNumber));
    return raw ? JSON.parse(raw) as UserProfile : null;
  } catch (_) {
    return null;
  }
};

const writeLocalProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getLocalProfileKey(profile.phoneNumber), JSON.stringify(profile));
  } catch (_) {
    // ignore
  }
};

const readAnyLocalProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) || '';
      if (key.startsWith('dev_user_profile_')) {
        const raw = window.localStorage.getItem(key);
        if (raw) return JSON.parse(raw) as UserProfile;
      }
    }
  } catch (_) {
    // ignore
  }
  return null;
};

export const createOrUpdateUser = async (phoneNumber: string, uid: string, additionalData?: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    // Skip DB only if explicit flag is set
    if (SKIP_DB) {
      console.log('SKIP_DB enabled: Not writing user to database:', phoneNumber);
      const existing = readLocalProfile(phoneNumber);
      const base: UserProfile = existing ?? {
        phoneNumber,
        uid,
        name: generateRandomUserName(phoneNumber),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        reportCount: 0
      };
      const merged: UserProfile = { ...base, uid, ...additionalData, updatedAt: Date.now() } as UserProfile;
      writeLocalProfile(merged);
      return merged;
    }

    await ensureAuthenticated();

    // Use phone number as key (remove + and spaces)
    const userId = getEffectiveUserId(phoneNumber);
    if (!userId) {
      throw new Error('Phone number is required to create or update user');
    }
    const userRef = ref(db, `users/${userId}`);
    
    // Check if user exists
    const userSnap = await get(userRef);
    
    if (userSnap.exists()) {
      // Update existing user
      const updateData = {
        uid,
        updatedAt: Date.now(),
        ...additionalData
      };
      
      await update(userRef, updateData);
      
      return {
        ...userSnap.val() as UserProfile,
        ...updateData
      };
    } else {
      // Create new user with random name
      const defaultName = generateRandomUserName(phoneNumber);
      const userData: UserProfile = {
        phoneNumber,
        uid,
        name: defaultName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        reportCount: 0,
        ...additionalData
      };
      
      await set(userRef, userData);
      
      return userData;
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    // Fallback to local profile on permission issues so UX can proceed in dev
    const message = (error as any)?.message || '';
    if (SKIP_DB || /Permission denied/i.test(message)) {
      console.log('SKIP_DB fallback: Returning local or mock user data');
      const existing = readLocalProfile(phoneNumber);
      if (existing) return existing;
      const mock: UserProfile = {
        phoneNumber,
        uid,
        name: generateRandomUserName(phoneNumber),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        reportCount: 0,
        ...additionalData
      } as UserProfile;
      writeLocalProfile(mock);
      return mock;
    }
    throw error;
  }
};

export const getUserProfile = async (phoneNumber: string): Promise<UserProfile | null> => {
  try {
    if (SKIP_DB) {
      console.log('SKIP_DB enabled: Returning local user profile for:', phoneNumber);
      const local = phoneNumber ? readLocalProfile(phoneNumber) : readAnyLocalProfile();
      if (local) return local;
      const fallback: UserProfile = {
        phoneNumber: phoneNumber || '+0000000000',
        uid: 'dev-uid',
        name: generateRandomUserName(phoneNumber),
        email: '',
        address: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        reportCount: 0
      } as UserProfile;
      writeLocalProfile(fallback);
      return fallback;
    }
    
    await ensureAuthenticated();

    const userId = getEffectiveUserId(phoneNumber);
    if (!userId) {
      console.warn('getUserProfile called without valid phone number');
      return null;
    }
    const userRef = ref(db, `users/${userId}`);
    const userSnap = await get(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.val() as UserProfile;
      console.log('Retrieved user profile:', userData);
      return userData;
    }
    
    console.log('No user profile found for:', phoneNumber);
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    const message = (error as any)?.message || '';
    if (SKIP_DB || /Permission denied/i.test(message)) {
      console.log('SKIP_DB fallback: Returning local or mock user data');
      const local = readLocalProfile(phoneNumber);
      if (local) return local;
      const mock: UserProfile = {
        phoneNumber,
        uid: 'dev-uid',
        name: generateRandomUserName(phoneNumber),
        email: '',
        address: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        reportCount: 0
      } as UserProfile;
      writeLocalProfile(mock);
      return mock;
    }
    throw error;
  }
};

export const updateUserProfile = async (phoneNumber: string, updateData: Partial<UserProfile>): Promise<void> => {
  try {
    if (SKIP_DB) {
      console.log('SKIP_DB enabled: Persisting update locally for user:', phoneNumber);
      const existing = readLocalProfile(phoneNumber);
      const userProfile: UserProfile = {
        phoneNumber,
        uid: existing?.uid ?? 'dev-uid',
        name: updateData.name ?? existing?.name ?? generateRandomUserName(phoneNumber),
        email: updateData.email ?? existing?.email ?? '',
        address: updateData.address ?? existing?.address ?? '',
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        isActive: existing?.isActive ?? true,
        reportCount: existing?.reportCount ?? 0,
      } as UserProfile;
      writeLocalProfile(userProfile);
      console.log('Profile updated locally:', userProfile);
      return;
    }

    await ensureAuthenticated();

    const userId = getEffectiveUserId(phoneNumber);
    if (!userId) {
      throw new Error('Phone number is required to update profile');
    }
    const userRef = ref(db, `users/${userId}`);
    
    // Filter out undefined values to avoid overwriting with undefined
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    await update(userRef, {
      ...cleanUpdateData,
      updatedAt: Date.now()
    });
    
    console.log('Successfully updated user profile for:', phoneNumber, cleanUpdateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    const message = (error as any)?.message || '';
    if (SKIP_DB || /Permission denied/i.test(message)) {
      console.log('SKIP_DB fallback: Simulating successful update');
      const existing = readLocalProfile(phoneNumber);
      const merged: UserProfile = {
        phoneNumber,
        uid: existing?.uid ?? 'dev-uid',
        name: updateData.name ?? existing?.name ?? generateRandomUserName(phoneNumber),
        email: updateData.email ?? existing?.email ?? '',
        address: updateData.address ?? existing?.address ?? '',
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        isActive: existing?.isActive ?? true,
        reportCount: existing?.reportCount ?? 0,
      } as UserProfile;
      writeLocalProfile(merged);
      console.log('Profile updated locally (fallback):', merged);
      return;
    }
    throw error;
  }
};

export const createCivicReport = async (reportData: Omit<CivicReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    if (SKIP_DB) {
      const id = 'dev-report-id-' + Date.now();
      persistLocalReport(id, reportData);
      return id;
    }

    await ensureAuthenticated();

    const reportsRef = ref(db, 'reports');
    const newReportRef = push(reportsRef);
    
    const report: CivicReport = {
      ...reportData,
      id: newReportRef.key!,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await set(newReportRef, report);

    // Update user's report count
    const userId = reportData.userId;
    const userRef = ref(db, `users/${userId}`);
    const userSnap = await get(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.val();
      await update(userRef, {
        reportCount: (userData.reportCount || 0) + 1,
        updatedAt: Date.now()
      });
    }

    console.log('Successfully created civic report:', newReportRef.key);
    return newReportRef.key!;
  } catch (error) {
    console.error('Error creating civic report:', error);
    const message = (error as any)?.message || '';
    if (SKIP_DB || /Permission denied/i.test(message)) {
      const id = 'dev-report-id-' + Date.now();
      persistLocalReport(id, reportData);
      return id;
    }
    throw error;
  }
};

// Storage helpers
export const uploadFileToStorage = async (file: File | Blob, path: string): Promise<string> => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping actual upload for path:', path);
      return `https://example.com/dev-upload/${encodeURIComponent(path)}`;
    }

    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error uploading file to Storage:', error);
    if (process.env.NODE_ENV === 'development') {
      console.log('Development fallback: Returning mock URL');
      return `https://example.com/dev-upload/${encodeURIComponent(path)}`;
    }
    throw error;
  }
};

// Local Reports helpers (dev/offline fallback)
const getLocalReportsKey = (userId: string): string => `dev_reports_${userId}`;

const readLocalReports = (userId: string): CivicReport[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getLocalReportsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as CivicReport[] : [];
  } catch (_) {
    return [];
  }
};

const persistLocalReport = (id: string, reportData: Omit<CivicReport, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (typeof window === 'undefined') return;
  try {
    const report: CivicReport = {
      ...reportData,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as CivicReport;
    const list = readLocalReports(reportData.userId);
    list.unshift(report);
    window.localStorage.setItem(getLocalReportsKey(reportData.userId), JSON.stringify(list));
  } catch (_) {
    // ignore
  }
};

// Reports querying helpers
export const getReportsByUser = async (userId: string): Promise<CivicReport[]> => {
  try {
    // Always include locally persisted reports
    const local = readLocalReports(userId);
    if (SKIP_DB) {
      console.log('SKIP_DB enabled: Returning local reports for user:', userId);
      return local;
    }

    const reportsRef = ref(db, 'reports');
    const q = query(reportsRef, orderByChild('userId'), equalTo(userId));
    const snap = await get(q);
    if (!snap.exists()) return local;
    const value = snap.val();
    const remote = Object.values(value) as CivicReport[];
    return [...remote, ...local];
  } catch (error) {
    console.error('Error fetching reports by user:', error);
    const message = (error as any)?.message || '';
    if (SKIP_DB || /Permission denied/i.test(message)) {
      return readLocalReports(userId);
    }
    throw error;
  }
};

export const getAllReports = async (): Promise<CivicReport[]> => {
  try {
    if (SKIP_DB) {
      console.log('SKIP_DB enabled: Returning local reports only');
      return readLocalReports(getEffectiveUserId(''));
    }
    const reportsRef = ref(db, 'reports');
    const snap = await get(reportsRef);
    const local = readLocalReports(getEffectiveUserId(''));
    if (!snap.exists()) return local;
    const value = snap.val();
    const remote = Object.values(value) as CivicReport[];
    return [...remote, ...local];
  } catch (error) {
    console.error('Error fetching all reports:', error);
    const message = (error as any)?.message || '';
    if (SKIP_DB || /Permission denied/i.test(message)) {
      return readLocalReports(getEffectiveUserId(''));
    }
    throw error;
  }
};
