"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  User,
  Plus,
  MapPin,
  Clock,
  Camera,
  ArrowLeft,
  Map,
  Home,
  FileText,
  Mic,
  MicOff,
  Navigation,
  ChevronUp,
  MessageCircle,
  Share2,
} from "lucide-react"
import { MapView } from "@/components/map-view"
import { MyReports } from "@/components/my-reports"
import { ProfilePage } from "@/components/profile-page"
import { NotificationsPage } from "@/components/notifications-page"
import { ReportDetailView } from "@/components/report-detail-view"

// Mock data for Chennai T. Nagar area (within 1km radius)
// Base coordinates: T. Nagar (13.0418, 80.2341)
const mockComments: Record<number, Array<{id: number, author: string, time: string, text: string}>> = {
  1: [
    { id: 1, author: "Priya M.", time: "1 hour ago", text: "Same problem near my house also da. Corporation people are not responding at all!" },
    { id: 2, author: "Karthik R.", time: "2 hours ago", text: "Enna koduma sir idhu! Every night walking here is so dangerous. Please fix pannunga!" },
    { id: 3, author: "Meera S.", time: "3 hours ago", text: "I also complained about this last month. Still no action taken. Very frustrating!" }
  ],
  2: [
    { id: 4, author: "Ravi K.", time: "30 minutes ago", text: "Aiyo! My bike got damaged because of this pothole yesterday. When will they fix this?" },
    { id: 5, author: "Lakshmi P.", time: "1 hour ago", text: "Same issue near Pondy Bazaar signal also. Roads ellam romba kevalama irukku!" },
    { id: 6, author: "Suresh B.", time: "2 hours ago", text: "Corporation should take immediate action. This is becoming worse day by day." },
    { id: 7, author: "Divya R.", time: "4 hours ago", text: "Very dangerous for two wheelers. Please do something fast!" },
    { id: 8, author: "Arun V.", time: "5 hours ago", text: "I fell down here last week because of this pothole. Hospital bill 2000 rupees!" },
    { id: 9, author: "Geetha K.", time: "6 hours ago", text: "Auto drivers are also complaining about this. Road condition romba bad!" },
    { id: 10, author: "Muthu S.", time: "1 day ago", text: "Rainy season la this will become even worse. Please fix before monsoon!" }
  ],
  3: [
    { id: 11, author: "Kumar M.", time: "45 minutes ago", text: "Smell is unbearable! Especially in the morning time. Corporation should clear this immediately." },
    { id: 12, author: "Sita R.", time: "2 hours ago", text: "Dogs are spreading garbage everywhere. Very unhygienic conditions here!" }
  ],
  4: [
    { id: 13, author: "Raj P.", time: "1 hour ago", text: "Walking here is very difficult. Especially for elderly people and kids." }
  ],
  5: [],
  6: [
    { id: 14, author: "Vani K.", time: "2 hours ago", text: "Water stagnation problem during rain time. Mosquito breeding ground aagidhu!" },
    { id: 15, author: "Babu R.", time: "4 hours ago", text: "Drainage system needs complete overhaul in this area." },
    { id: 16, author: "Shanti M.", time: "6 hours ago", text: "Health department should also look into this matter." },
    { id: 17, author: "Ganesh S.", time: "8 hours ago", text: "Same problem near my office also. Water logging everywhere during monsoon!" },
    { id: 18, author: "Prema L.", time: "1 day ago", text: "Children are getting sick because of this stagnant water. Please take action!" }
  ],
  7: [
    { id: 19, author: "Mohan K.", time: "1 hour ago", text: "Traffic jam daily because of this signal problem. Office late aagidhu!" },
    { id: 20, author: "Radha P.", time: "3 hours ago", text: "Very dangerous for pedestrians. Signal timing is completely off!" },
    { id: 21, author: "Vijay R.", time: "5 hours ago", text: "Accidents happening frequently here. Police should also monitor this junction." },
    { id: 22, author: "Kamala S.", time: "7 hours ago", text: "School children cross here daily. Safety is major concern!" },
    { id: 23, author: "Raman M.", time: "10 hours ago", text: "Traffic police manually controlling signal. But not always available." },
    { id: 24, author: "Deepa K.", time: "12 hours ago", text: "Emergency vehicles also getting stuck here. Very serious issue!" },
    { id: 25, author: "Senthil R.", time: "1 day ago", text: "Corporation should fix this on priority basis. High traffic area idhu!" },
    { id: 26, author: "Malathi P.", time: "1 day ago", text: "Auto and bus drivers are very frustrated with this signal problem." }
  ],
  8: [
    { id: 27, author: "Arjun K.", time: "2 hours ago", text: "Stray dogs are becoming aggressive. Especially during night time very scary!" },
    { id: 28, author: "Nisha R.", time: "4 hours ago", text: "Children are afraid to play outside because of this. Animal control needed!" },
    { id: 29, author: "Prakash M.", time: "6 hours ago", text: "Food vendors are feeding them, so population is increasing daily." },
    { id: 30, author: "Kavitha S.", time: "8 hours ago", text: "Some dogs have skin disease also. Health hazard for residents!" }
  ]
}

const mockReports = [
  {
    id: 1,
    title: "Street Light Not Working",
    location: "Anna Salai, T. Nagar, Chennai",
    coordinates: { lat: 13.0418, lng: 80.2341 },
    time: "2 hours ago",
    status: "pending",
    image: "/broken-street-light.png",
    upvotes: 12,
    comments: 3,
    distance: "0.2 km",
    reportedBy: "Rajesh K.",
  },
  {
    id: 2,
    title: "Large Pothole on Road",
    location: "Pondy Bazaar Main Road, T. Nagar",
    coordinates: { lat: 13.0425, lng: 80.2335 },
    time: "4 hours ago",
    status: "active",
    image: "/pothole-on-road.jpg",
    upvotes: 28,
    comments: 7,
    distance: "0.3 km",
    reportedBy: "Priya S.",
  },
  {
    id: 3,
    title: "Overflowing Garbage Bin",
    location: "Ranganathan Street, T. Nagar",
    coordinates: { lat: 13.0435, lng: 80.2348 },
    time: "6 hours ago",
    status: "pending",
    image: "/overflowing-trash-can.jpg",
    upvotes: 15,
    comments: 2,
    distance: "0.4 km",
    reportedBy: "Kumar M.",
  },
  {
    id: 4,
    title: "Broken Footpath",
    location: "Usman Road, T. Nagar",
    coordinates: { lat: 13.0408, lng: 80.2355 },
    time: "8 hours ago",
    status: "active",
    image: "/cracked-sidewalk.jpg",
    upvotes: 9,
    comments: 1,
    distance: "0.5 km",
    reportedBy: "Lakshmi R.",
  },
  {
    id: 5,
    title: "Illegal Wall Posters",
    location: "GN Chetty Road, T. Nagar",
    coordinates: { lat: 13.0445, lng: 80.2325 },
    time: "12 hours ago",
    status: "resolved",
    image: "/graffiti-on-wall.jpg",
    upvotes: 6,
    comments: 0,
    distance: "0.6 km",
    reportedBy: "Arun V.",
  },
  {
    id: 6,
    title: "Water Logging Issue",
    location: "South Usman Road, T. Nagar",
    coordinates: { lat: 13.0395, lng: 80.2365 },
    time: "1 day ago",
    status: "pending",
    image: "/pothole-on-road.jpg",
    upvotes: 22,
    comments: 5,
    distance: "0.7 km",
    reportedBy: "Meera P.",
  },
  {
    id: 7,
    title: "Damaged Traffic Signal",
    location: "Thyagaraya Road Junction, T. Nagar",
    coordinates: { lat: 13.0385, lng: 80.2315 },
    time: "1 day ago",
    status: "active",
    image: "/broken-street-light.png",
    upvotes: 35,
    comments: 8,
    distance: "0.8 km",
    reportedBy: "Suresh B.",
  },
  {
    id: 8,
    title: "Stray Dogs Issue",
    location: "Mambalam High Road, T. Nagar",
    coordinates: { lat: 13.0455, lng: 80.2375 },
    time: "2 days ago",
    status: "pending",
    image: "/overflowing-trash-can.jpg",
    upvotes: 18,
    comments: 4,
    distance: "0.9 km",
    reportedBy: "Divya K.",
  }
]


export function Dashboard({ phoneNumber }: { phoneNumber: string }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [reports, setReports] = useState(mockReports)
  const [userUpvotes, setUserUpvotes] = useState<Set<number>>(new Set())
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const handleUpvote = (reportId: number) => {
    const newUserUpvotes = new Set(userUpvotes)
    const newReports = reports.map(report => {
      if (report.id === reportId) {
        if (userUpvotes.has(reportId)) {
          // Remove upvote
          newUserUpvotes.delete(reportId)
          return { ...report, upvotes: report.upvotes - 1 }
        } else {
          // Add upvote
          newUserUpvotes.add(reportId)
          return { ...report, upvotes: report.upvotes + 1 }
        }
      }
      return report
    })
    
    setUserUpvotes(newUserUpvotes)
    setReports(newReports)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (activeTab === "new-report") {
    return <NewReportForm onBack={() => setActiveTab("dashboard")} activeTab={activeTab} setActiveTab={setActiveTab} phoneNumber={phoneNumber} />
  }

  if (activeTab === "map") {
    return <MapView onBack={() => setActiveTab("dashboard")} activeTab={activeTab} setActiveTab={setActiveTab} />
  }

  if (activeTab === "my-reports") {
    return <MyReports onBack={() => setActiveTab("dashboard")} activeTab={activeTab} setActiveTab={setActiveTab} phoneNumber={phoneNumber} />
  }

  if (activeTab === "profile") {
    return <ProfilePage onBack={() => setActiveTab("dashboard")} activeTab={activeTab} setActiveTab={setActiveTab} phoneNumber={phoneNumber} />
  }

  if (activeTab === "notifications") {
    return (
      <NotificationsPage onBack={() => setActiveTab("dashboard")} activeTab={activeTab} setActiveTab={setActiveTab} />
    )
  }

  if (activeTab === "report-detail" && selectedReport) {
    return (
      <ReportDetailView 
        report={selectedReport} 
        comments={mockComments[selectedReport.id] || []} 
        onBack={() => setActiveTab("dashboard")}
        onUpvote={() => handleUpvote(selectedReport.id)}
        isUpvoted={userUpvotes.has(selectedReport.id)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-card border-b border-border px-4 sm:px-6 py-4 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Civic Reporter</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12"
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-20 px-4 sm:px-6 py-4 space-y-6 max-w-md mx-auto">

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Button
            variant="outline"
            className="h-16 sm:h-20 flex-col gap-2 bg-transparent text-sm sm:text-base"
            onClick={() => setActiveTab("map")}
          >
            <Map className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>View Map</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 sm:h-20 flex-col gap-2 bg-transparent text-sm sm:text-base"
            onClick={() => setActiveTab("my-reports")}
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>My Reports</span>
          </Button>
        </div>

        {/* Community Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Community Feed</h2>
            <Badge variant="outline" className="text-xs">
              Within 1km
            </Badge>
          </div>
          <div className="space-y-3">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => {
                  setSelectedReport(report)
                  setActiveTab("report-detail")
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={report.image || "/placeholder.svg"}
                      alt={report.title}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm sm:text-base leading-tight">{report.title}</h3>
                        <Badge className={`${getStatusColor(report.status)} text-xs border ml-2 flex-shrink-0`}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{report.location}</span>
                        <span className="text-blue-600 font-medium ml-1">• {report.distance}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Clock className="w-3 h-3" />
                        <span>{report.time}</span>
                        <span className="mx-1">•</span>
                        <span>by {report.reportedBy}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-2 gap-1 text-xs ${
                            userUpvotes.has(report.id) 
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                              : 'text-muted-foreground hover:text-blue-600'
                          }`}
                          onClick={() => handleUpvote(report.id)}
                        >
                          <ChevronUp className="w-4 h-4" />
                          <span>{report.upvotes}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-blue-600"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{report.comments}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-blue-600"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setActiveTab("new-report")}
        className="fixed bottom-20 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg z-30 active:scale-95 transition-transform"
        size="icon"
      >
        <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
      </Button>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {[
            { key: "dashboard", icon: Home, label: "Home" },
            { key: "map", icon: Map, label: "Map" },
            { key: "my-reports", icon: FileText, label: "Reports" },
            { key: "profile", icon: User, label: "Profile" },
            { key: "notifications", icon: Bell, label: "Alerts" },
          ].map(({ key, icon: Icon, label }) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "ghost"}
              size="sm"
              className="flex-col gap-1 h-auto py-2 px-2 sm:px-3 min-w-0 flex-1 max-w-[80px]"
              onClick={() => setActiveTab(key)}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-xs leading-none">{label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function NewReportForm({
  onBack,
  activeTab,
  setActiveTab,
  phoneNumber,
}: { onBack: () => void; activeTab: string; setActiveTab: (tab: string) => void; phoneNumber: string }) {
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [voiceNote, setVoiceNote] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; accuracy?: number } | null>(null)
  const [isCapturingLocation, setIsCapturingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cleanup location watching on component unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const handleSubmitReport = async () => {
    try {
      setIsSubmitting(true)
      let userId = '8122949677'
      if (!userId && typeof window !== 'undefined') {
        const last = window.localStorage.getItem('last_phone_number') || ''
        userId = last.replace(/[^0-9]/g, '')
      }
      // Hard fallback for development/testing already set above

      // Ensure a user profile exists for this userId before creating a report
      try {
        const { createOrUpdateUser } = await import("@/lib/firebase")
        // Pass the phone number string (not just digits) – normalize happens in the lib
        await createOrUpdateUser(userId, 'fallback-uid')
      } catch (_) {}

      // Prepare image URLs
      let uploadedUrls: string[] = []
      if (process.env.NODE_ENV === 'development') {
        // In dev, keep data URLs so they render immediately without real storage
        uploadedUrls = [...capturedImages]
      } else {
        // Upload images in production
        for (let i = 0; i < capturedImages.length; i++) {
          const dataUrl = capturedImages[i]
          const blob = await (await fetch(dataUrl)).blob()
          const file = new File([blob], `photo_${Date.now()}_${i}.jpg`, { type: blob.type || 'image/jpeg' })
          const { uploadFileToStorage } = await import("@/lib/firebase")
          const url = await uploadFileToStorage(file, `reports/${userId}/${Date.now()}_${i}.jpg`)
          uploadedUrls.push(url)
        }
      }

      const { createCivicReport } = await import("@/lib/firebase")
      const reportId = await createCivicReport({
        userId,
        title: issueType || 'Civic Issue',
        description: description || 'No description provided',
        category: 'other',
        location: {
          latitude: location?.lat ?? 0,
          longitude: location?.lng ?? 0,
          address: location?.address ?? 'Unknown location',
        },
        images: uploadedUrls,
        status: 'pending',
        priority: 'low',
      })

      console.log('Created report:', reportId)
      setActiveTab("my-reports")
    } catch (e) {
      console.error('Failed to submit report', e)
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && capturedImages.length < 4) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = e.target?.result as string
        setCapturedImages((prev) => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false)
      setVoiceNote("Voice note recorded") // Placeholder
    } else {
      // Start recording logic would go here
      setIsRecording(true)
    }
  }

  const captureLocation = () => {
    setIsCapturingLocation(true)
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      setIsCapturingLocation(false)
      return
    }

    // High accuracy GPS options
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 seconds timeout
      maximumAge: 30000 // Accept cached location up to 30 seconds old
    }

    // Start watching position for continuous updates
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        console.log(`GPS Location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`)
        
        try {
          // Reverse geocode to get accurate address
          const address = await reverseGeocode(latitude, longitude)
          
          setLocation({
            lat: latitude,
            lng: longitude,
            address: address,
            accuracy: Math.round(accuracy)
          })
          
          // If we get good accuracy (< 50m), stop watching
          if (accuracy < 50) {
            navigator.geolocation.clearWatch(id)
            setWatchId(null)
            setIsCapturingLocation(false)
          }
        } catch (geocodeError) {
          console.warn("Reverse geocoding failed:", geocodeError)
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            accuracy: Math.round(accuracy)
          })
          setIsCapturingLocation(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        let errorMessage = "Failed to get location"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS signal unavailable. Please check if location services are enabled."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again."
            break
          default:
            errorMessage = "Unknown location error occurred."
            break
        }
        
        setLocationError(errorMessage)
        setIsCapturingLocation(false)
        
        if (watchId) {
          navigator.geolocation.clearWatch(watchId)
          setWatchId(null)
        }
      },
      options
    )
    
    setWatchId(id)
    
    // Fallback: stop watching after 30 seconds even if accuracy isn't great
    setTimeout(() => {
      if (id && isCapturingLocation) {
        navigator.geolocation.clearWatch(id)
        setWatchId(null)
        setIsCapturingLocation(false)
      }
    }, 30000)
  }

  // Reverse geocoding function using OpenStreetMap Nominatim API
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CivicReporter/1.0'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }
      
      const data = await response.json()
      
      if (data.display_name) {
        return data.display_name
      } else {
        throw new Error('No address found')
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error)
      throw error
    }
  }

  // Stop location watching when component unmounts or user navigates away
  const stopLocationCapture = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsCapturingLocation(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-card border-b border-border px-4 sm:px-6 py-4 z-50">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="w-10 h-10" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">New Report</h1>
        </div>
      </header>

      <div className="pt-20 pb-24 px-4 sm:px-6 py-4 space-y-6 max-w-md mx-auto">
        {/* Camera Capture - Take 4 Images */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Capture Images ({capturedImages.length}/4)</CardTitle>
            <CardDescription className="text-sm">Take up to 4 photos of the issue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="relative aspect-square border-2 border-dashed border-border rounded-lg overflow-hidden"
                >
                  {capturedImages[index] ? (
                    <>
                      <img
                        src={capturedImages[index] || "/placeholder.svg"}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 w-6 h-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {capturedImages.length < 4 && (
              <div className="relative">
                <Button className="w-full h-12 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Capture Image
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Note */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Voice Note</CardTitle>
            <CardDescription className="text-sm">Record additional details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                className="w-full h-12 flex items-center gap-2"
                onClick={handleVoiceRecording}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </>
                )}
              </Button>
              {voiceNote && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Voice note recorded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Capture */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Location</CardTitle>
            <CardDescription className="text-sm">Capture current location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12 flex items-center gap-2 bg-transparent"
                  onClick={captureLocation}
                  disabled={isCapturingLocation}
                >
                  <Navigation className="w-5 h-5" />
                  {isCapturingLocation ? "Getting GPS..." : "Capture Location"}
                </Button>
                {isCapturingLocation && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={stopLocationCapture}
                  >
                    ×
                  </Button>
                )}
              </div>
              
              {locationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Location Error</p>
                  <p className="text-xs text-red-600">{locationError}</p>
                </div>
              )}
              
              {location && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-800">Location Captured</p>
                    {location.accuracy && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        location.accuracy < 10 ? 'bg-green-100 text-green-700' :
                        location.accuracy < 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        ±{location.accuracy}m
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-green-600 leading-relaxed">{location.address}</p>
                  <p className="text-xs text-green-500 mt-1">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issue Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Issue Type</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full p-4 text-base border border-border rounded-lg bg-background appearance-none"
            >
              <option value="">Select issue type</option>
              <option value="roads">Roads & Potholes</option>
              <option value="streetlights">Street Lights</option>
              <option value="water">Water Supply Issues</option>
              <option value="drainage">Drainage & Sewage</option>
              <option value="waste">Garbage Collection</option>
              <option value="electricity">Power Supply</option>
              <option value="traffic">Traffic Signals</option>
              <option value="parks">Parks & Public Spaces</option>
              <option value="illegal-construction">Illegal Construction</option>
              <option value="noise">Noise Pollution</option>
              <option value="other">Other</option>
            </select>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full p-4 text-base border border-border rounded-lg bg-background min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold" size="lg" onClick={handleSubmitReport} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {[
            { key: "dashboard", icon: Home, label: "Home" },
            { key: "map", icon: Map, label: "Map" },
            { key: "my-reports", icon: FileText, label: "Reports" },
            { key: "profile", icon: User, label: "Profile" },
            { key: "notifications", icon: Bell, label: "Alerts" },
          ].map(({ key, icon: Icon, label }) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              className="flex-col gap-1 h-auto py-2 px-2 sm:px-3 min-w-0 flex-1 max-w-[80px]"
              onClick={() => setActiveTab(key)}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-xs leading-none">{label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}
