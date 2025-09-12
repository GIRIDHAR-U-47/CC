"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Navigation, Filter, Home, Map, FileText, User, Bell } from "lucide-react"

interface MapViewProps {
  onBack: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

// Mock data for Chennai T. Nagar area (within 1km radius) - same as dashboard feed
// Base coordinates: T. Nagar (13.0418, 80.2341)
const mockIssues = [
  {
    id: 1,
    title: "Street Light Not Working",
    location: "Anna Salai, T. Nagar, Chennai",
    status: "pending",
    lat: 13.0418,
    lng: 80.2341,
    type: "lighting",
    upvotes: 12,
    comments: 3,
    distance: "0.2 km",
    reportedBy: "Rajesh K.",
  },
  {
    id: 2,
    title: "Large Pothole on Road",
    location: "Pondy Bazaar Main Road, T. Nagar",
    status: "active",
    lat: 13.0425,
    lng: 80.2335,
    type: "road",
    upvotes: 28,
    comments: 7,
    distance: "0.3 km",
    reportedBy: "Priya S.",
  },
  {
    id: 3,
    title: "Overflowing Garbage Bin",
    location: "Ranganathan Street, T. Nagar",
    status: "pending",
    lat: 13.0435,
    lng: 80.2348,
    type: "waste",
    upvotes: 15,
    comments: 2,
    distance: "0.4 km",
    reportedBy: "Kumar M.",
  },
  {
    id: 4,
    title: "Broken Footpath",
    location: "Usman Road, T. Nagar",
    status: "active",
    lat: 13.0408,
    lng: 80.2355,
    type: "road",
    upvotes: 9,
    comments: 1,
    distance: "0.5 km",
    reportedBy: "Lakshmi R.",
  },
  {
    id: 5,
    title: "Illegal Wall Posters",
    location: "GN Chetty Road, T. Nagar",
    status: "resolved",
    lat: 13.0445,
    lng: 80.2325,
    type: "vandalism",
    upvotes: 6,
    comments: 0,
    distance: "0.6 km",
    reportedBy: "Arun V.",
  },
  {
    id: 6,
    title: "Water Logging Issue",
    location: "South Usman Road, T. Nagar",
    status: "pending",
    lat: 13.0395,
    lng: 80.2365,
    type: "drainage",
    upvotes: 22,
    comments: 5,
    distance: "0.7 km",
    reportedBy: "Meera P.",
  },
  {
    id: 7,
    title: "Damaged Traffic Signal",
    location: "Thyagaraya Road Junction, T. Nagar",
    status: "active",
    lat: 13.0385,
    lng: 80.2315,
    type: "traffic",
    upvotes: 35,
    comments: 8,
    distance: "0.8 km",
    reportedBy: "Suresh B.",
  },
  {
    id: 8,
    title: "Stray Dogs Issue",
    location: "Mambalam High Road, T. Nagar",
    status: "pending",
    lat: 13.0455,
    lng: 80.2375,
    type: "other",
    upvotes: 18,
    comments: 4,
    distance: "0.9 km",
    reportedBy: "Divya K.",
  }
]

export function MapView({ onBack, activeTab, setActiveTab }: MapViewProps) {
  const [selectedIssue, setSelectedIssue] = useState<(typeof mockIssues)[0] | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [nearbyReports, setNearbyReports] = useState<any[]>([])
  const [mapError, setMapError] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        if (typeof window === 'undefined') return
        if (!mapContainerRef.current) return
        if (mapRef.current) return // guard against double init
        
        // Clear any existing map error
        setMapError(null)
        
        // Load Leaflet via CDN if not present
        if (!(window as any).L) {
          await new Promise<void>((resolve, reject) => {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            link.onload = () => resolve()
            link.onerror = () => reject(new Error('Failed to load Leaflet CSS'))
            document.head.appendChild(link)
          })
          
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load Leaflet JS'))
            document.body.appendChild(script)
          })
          
          // Wait a bit for Leaflet to fully initialize
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        const L = (window as any).L
        if (!mapContainerRef.current || !L) {
          setMapError('Map library failed to load')
          return
        }

        // Ensure container has dimensions before initializing map
        const container = mapContainerRef.current
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          setMapError('Map container has no dimensions')
          return
        }

        // Init map with better error handling
        try {
          mapRef.current = L.map(container, {
            zoomControl: true,
            attributionControl: true
          })
          mapRef.current.setView([13.0418, 80.2341], 14)
          
          const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
            crossOrigin: true
          })
          
          tiles.on('tileerror', (e: any) => {
            console.error('Tile loading error:', e)
            setMapError('Map tiles failed to load. Check your internet connection.')
          })
          
          tiles.addTo(mapRef.current)

          // Invalidate size after mount and on resize so tiles align correctly
          setTimeout(() => { 
            try { 
              if (mapRef.current) {
                mapRef.current.invalidateSize()
                console.log('Map initialized successfully')
              }
            } catch (e) {
              console.error('Error invalidating map size:', e)
            }
          }, 100)
          
          const handleResize = () => {
            try { 
              if (mapRef.current) {
                mapRef.current.invalidateSize()
              }
            } catch (e) {
              console.error('Error on resize:', e)
            }
          }
          
          window.addEventListener('resize', handleResize)
          
          if ('ResizeObserver' in window && mapContainerRef.current) {
            resizeObserverRef.current = new ResizeObserver(handleResize)
            resizeObserverRef.current.observe(mapContainerRef.current)
          }
        } catch (mapInitError) {
          console.error('Map initialization error:', mapInitError)
          setMapError('Failed to initialize map')
          return
        }

        // Find user location
        if (!navigator.geolocation) {
          setMapError('Geolocation not available')
          // continue with default location and nearby markers
        }
        const handleWithCenter = async (latitude: number, longitude: number) => {
          if (!mapRef.current || !mapRef.current.getContainer()) return
          mapRef.current.whenReady(() => {
            try {
              mapRef.current.setView([latitude, longitude], 14)
              // Add user location marker with custom icon
              const userIcon = L.divIcon({
                html: '<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                className: 'user-location-marker',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              })
              L.marker([latitude, longitude], { icon: userIcon }).addTo(mapRef.current).bindPopup('You are here')
            } catch (e) {
              console.warn('Map setView failed', e)
            }
          })

          // Fetch reports and add markers at their exact locations
          try {
            const { getAllReports } = await import("@/lib/firebase")
            const reports = await getAllReports()
            console.log('Fetched reports:', reports)
            
            // Calculate distance for filtering nearby reports
            const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
              const toRad = (d: number) => d * Math.PI / 180
              const R = 6371
              const dLat = toRad(lat2 - lat1)
              const dLon = toRad(lon2 - lon1)
              const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2
              return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            }
            
            // Filter reports within 50km radius (increased for better coverage)
            const nearby = reports.filter(r => {
              if (!r.location || typeof r.location.latitude !== 'number' || typeof r.location.longitude !== 'number') {
                console.warn('Invalid location data for report:', r.id, r.location)
                return false
              }
              return distance(latitude, longitude, r.location.latitude, r.location.longitude) <= 50
            })
            
            console.log('Nearby reports:', nearby.length, 'out of', reports.length)
            setNearbyReports(nearby)

            // Add markers for actual Firebase reports at their exact locations
            nearby.forEach((report) => {
              if (!mapRef.current || !report.location) return
              
              // Validate location data
              const lat = report.location.latitude
              const lng = report.location.longitude
              if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
                console.warn('Invalid coordinates for report:', report.id, lat, lng)
                return
              }
              
              try { 
                const markerColor = getReportMarkerColor(report.status)
                const categoryIcon = getCategoryIcon(report.category)
                
                const reportIcon = L.divIcon({
                  html: `<div style="background: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">${categoryIcon}</div>`,
                  className: 'report-marker',
                  iconSize: [28, 28],
                  iconAnchor: [14, 14]
                })
                
                console.log('Adding marker for report:', report.title, 'at', lat, lng)
                const marker = L.marker([lat, lng], { icon: reportIcon })
                  .addTo(mapRef.current)
                  .bindPopup(`
                    <div style="min-width: 200px;">
                      <h3 style="margin: 0 0 8px 0; font-weight: bold;">${report.title}</h3>
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${report.description}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Category:</strong> ${report.category}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Status:</strong> <span style="color: ${markerColor};">${report.status}</span></p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Priority:</strong> ${report.priority}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Address:</strong> ${report.location.address}</p>
                      <p style="margin: 0; font-size: 12px;"><strong>Reported:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                  `)
                
                // Add click handler to select the issue
                marker.on('click', () => {
                  setSelectedIssue({
                    id: parseInt(report.id) || Date.now(),
                    title: report.title,
                    location: report.location.address,
                    status: report.status,
                    lat: report.location.latitude,
                    lng: report.location.longitude,
                    type: report.category,
                    upvotes: 0,
                    comments: 0,
                    distance: "0 km",
                    reportedBy: "Unknown"
                  })
                })
              } catch (e) {
                console.error('Error adding report marker:', e)
              }
            })
            
            // Always show mock data for demonstration (community feed issues)
            console.log('Adding community feed issues to map')
            mockIssues.forEach((issue) => {
              if (!mapRef.current) return
              try { 
                const markerColor = getMarkerColor(issue.status)
                const categoryIcon = getCategoryIcon(issue.type)
                
                const issueIcon = L.divIcon({
                  html: `<div style="background: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">${categoryIcon}</div>`,
                  className: 'issue-marker',
                  iconSize: [28, 28],
                  iconAnchor: [14, 14]
                })
                
                const marker = L.marker([issue.lat, issue.lng], { icon: issueIcon })
                  .addTo(mapRef.current)
                  .bindPopup(`
                    <div style="min-width: 200px;">
                      <h3 style="margin: 0 0 8px 0; font-weight: bold;">${issue.title}</h3>
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Community reported issue</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Type:</strong> ${issue.type}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Status:</strong> <span style="color: ${markerColor};">${issue.status}</span></p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Upvotes:</strong> ${issue.upvotes}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Distance:</strong> ${issue.distance}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Reported by:</strong> ${issue.reportedBy}</p>
                      <p style="margin: 0; font-size: 12px;"><strong>Location:</strong> ${issue.location}</p>
                    </div>
                  `)
                
                marker.on('click', () => {
                  setSelectedIssue(issue)
                })
              } catch (e) {
                console.error('Error adding community feed marker:', e)
              }
            })
          } catch (firebaseError) {
            console.warn('Firebase error, using community feed data:', firebaseError)
            // Use community feed issues as fallback
            mockIssues.forEach((issue) => {
              if (!mapRef.current) return
              try { 
                const markerColor = getMarkerColor(issue.status)
                const categoryIcon = getCategoryIcon(issue.type)
                
                const issueIcon = L.divIcon({
                  html: `<div style="background: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">${categoryIcon}</div>`,
                  className: 'issue-marker',
                  iconSize: [28, 28],
                  iconAnchor: [14, 14]
                })
                
                const marker = L.marker([issue.lat, issue.lng], { icon: issueIcon })
                  .addTo(mapRef.current)
                  .bindPopup(`
                    <div style="min-width: 200px;">
                      <h3 style="margin: 0 0 8px 0; font-weight: bold;">${issue.title}</h3>
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Community reported issue</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Type:</strong> ${issue.type}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Status:</strong> <span style="color: ${markerColor};">${issue.status}</span></p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Upvotes:</strong> ${issue.upvotes}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Distance:</strong> ${issue.distance}</p>
                      <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Reported by:</strong> ${issue.reportedBy}</p>
                      <p style="margin: 0; font-size: 12px;"><strong>Location:</strong> ${issue.location}</p>
                    </div>
                  `)
                
                marker.on('click', () => {
                  setSelectedIssue(issue)
                })
              } catch (e) {
                console.error('Error adding community feed marker:', e)
              }
            })
          }
        }

        // Enhanced GPS location detection with high accuracy
        const getHighAccuracyLocation = () => {
          const options = {
            enableHighAccuracy: true,
            timeout: 15000, // 15 seconds timeout
            maximumAge: 60000 // Accept cached location up to 1 minute old
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords
              console.log(`GPS Location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`)
              
              // If accuracy is poor (>100m), try to get a better reading
              if (accuracy > 100) {
                console.log('GPS accuracy is poor, attempting to get better reading...')
                // Try once more with stricter settings
                const strictOptions = {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0 // Force fresh reading
                }
                
                navigator.geolocation.getCurrentPosition(
                  (betterPos) => {
                    const { latitude: lat2, longitude: lng2, accuracy: acc2 } = betterPos.coords
                    console.log(`Improved GPS Location: ${lat2}, ${lng2} (accuracy: ${acc2}m)`)
                    handleWithCenter(lat2, lng2)
                  },
                  (err2) => {
                    console.warn('Second GPS attempt failed, using first reading:', err2)
                    handleWithCenter(latitude, longitude)
                  },
                  strictOptions
                )
              } else {
                handleWithCenter(latitude, longitude)
              }
            },
            (error) => {
              console.error('Geolocation error:', error)
              let errorMessage = 'Location access failed'
              
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location access denied. Please enable location services.'
                  setMapError('Location permission denied. Please enable location access in your browser settings.')
                  break
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information unavailable.'
                  setMapError('GPS signal unavailable. Please check if location services are enabled.')
                  break
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out.'
                  setMapError('GPS timeout. Trying to get location took too long.')
                  break
                default:
                  errorMessage = 'Unknown location error.'
                  setMapError('Unknown location error occurred.')
                  break
              }
              
              console.warn(errorMessage)
              // Fall back to default location (T. Nagar, Chennai)
              handleWithCenter(13.0418, 80.2341)
            },
            options
          )
        }

        // Check if geolocation is supported
        if (!navigator.geolocation) {
          console.warn('Geolocation not supported by this browser')
          setMapError('Geolocation not supported by your browser.')
          handleWithCenter(13.0418, 80.2341)
        } else {
          getHighAccuracyLocation()
        }
      } catch (e) {
        console.error('Map loading error:', e)
        setMapError('Failed to initialize map. Please check your internet connection.')
      }
    }
    
    // Delay loading slightly to ensure DOM is ready
    const timeoutId = setTimeout(load, 50)
    
    return () => {
      clearTimeout(timeoutId)
      try { 
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
      } catch (e) {
        console.error('Error cleaning up map:', e)
      }
      try { 
        window.removeEventListener('resize', () => { 
          try { mapRef.current?.invalidateSize() } catch {} 
        }) 
      } catch {}
      try { 
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
          resizeObserverRef.current = null
        }
      } catch {}
    }
  }, [])

  // Re-align map when tab switches back to map
  useEffect(() => {
    if (activeTab === 'map') {
      setTimeout(() => { try { mapRef.current?.invalidateSize() } catch {} }, 50)
    }
  }, [activeTab])

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

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "active":
        return "#eab308"
      case "resolved":
        return "#22c55e"
      case "pending":
        return "#3b82f6"
      default:
        return "#6b7280"
    }
  }

  const getReportMarkerColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "#eab308"
      case "resolved":
        return "#22c55e"
      case "pending":
        return "#3b82f6"
      case "rejected":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pothole":
      case "road":
        return "🛣️"
      case "streetlight":
      case "lighting":
        return "💡"
      case "garbage":
      case "waste":
        return "🗑️"
      case "water":
        return "💧"
      case "traffic":
        return "🚦"
      case "drainage":
        return "🌊"
      case "vandalism":
        return "🎨"
      default:
        return "📍"
    }
  }

  const filteredIssues = filterType === "all" ? mockIssues : mockIssues.filter((issue) => issue.type === filterType)

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-card border-b border-border px-4 sm:px-6 py-4 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-10 h-10" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Issue Map</h1>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
      </header>

      <div className="pt-20 pb-20">
        {/* Map Container - Enhanced for mobile */}
        <div className="relative h-[50vh] sm:h-[60vh] bg-muted border border-border rounded-lg overflow-hidden mx-4 sm:mx-6">
          <div 
            ref={mapContainerRef} 
            className="absolute inset-0 z-10" 
            style={{ 
              width: '100%', 
              height: '100%',
              minHeight: '300px'
            }} 
          />
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/80 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3 p-4 text-center">
                <div className="text-red-500 font-medium">Map Loading Error</div>
                <span className="text-xs">{mapError}</span>
                <Button 
                  size="sm" 
                  onClick={() => { 
                    try { 
                      if (mapRef.current) {
                        mapRef.current.remove()
                        mapRef.current = null
                      }
                    } catch {}
                    setMapError(null)
                    // Trigger re-initialization
                    window.location.reload()
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Note: Markers are now handled by Leaflet in the map initialization */}

          {/* Current Location Button - Better mobile positioning */}
          <Button 
            size="icon" 
            className="absolute bottom-4 right-4 w-12 h-12 sm:w-10 sm:h-10 rounded-full shadow-lg"
            onClick={() => {
              if (!navigator.geolocation) {
                setMapError('Geolocation not supported by your browser.')
                return
              }
              
              // Show loading state
              const button = document.querySelector('.absolute.bottom-4.right-4') as HTMLElement
              if (button) {
                button.style.opacity = '0.5'
                button.style.pointerEvents = 'none'
              }
              
              const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0 // Force fresh reading
              }
              
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude, accuracy } = position.coords
                  console.log(`Manual GPS Location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`)
                  
                  if (mapRef.current) {
                    mapRef.current.setView([latitude, longitude], 16)
                    
                    // Update user location marker
                    const userIcon = (window as any).L?.divIcon({
                      html: '<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                      className: 'user-location-marker',
                      iconSize: [22, 22],
                      iconAnchor: [11, 11]
                    })
                    
                    if (userIcon) {
                      (window as any).L?.marker([latitude, longitude], { icon: userIcon })
                        .addTo(mapRef.current)
                        .bindPopup(`Your current location (accuracy: ${Math.round(accuracy)}m)`)
                        .openPopup()
                    }
                  }
                  
                  // Reset button state
                  if (button) {
                    button.style.opacity = '1'
                    button.style.pointerEvents = 'auto'
                  }
                },
                (error) => {
                  console.error('Manual location error:', error)
                  let errorMsg = 'Failed to get current location'
                  
                  switch (error.code) {
                    case error.PERMISSION_DENIED:
                      errorMsg = 'Location permission denied'
                      break
                    case error.POSITION_UNAVAILABLE:
                      errorMsg = 'GPS signal unavailable'
                      break
                    case error.TIMEOUT:
                      errorMsg = 'Location request timed out'
                      break
                  }
                  
                  setMapError(errorMsg)
                  
                  // Reset button state
                  if (button) {
                    button.style.opacity = '1'
                    button.style.pointerEvents = 'auto'
                  }
                },
                options
              )
            }}
          >
            <Navigation className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Filter Tabs - Mobile optimized */}
        <div className="px-4 sm:px-6 py-3 bg-card border-b border-border">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-md mx-auto">
            {[
              { key: "all", label: "All Issues" },
              { key: "road", label: "Roads" },
              { key: "lighting", label: "Lighting" },
              { key: "waste", label: "Waste" },
              { key: "drainage", label: "Drainage" },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={filterType === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(filter.key)}
                className="whitespace-nowrap text-sm px-4 py-2"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Issue List - Mobile optimized */}
        <div className="px-4 sm:px-6 py-4 space-y-3 max-w-md mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold">Nearby Issues ({nearbyReports.length || filteredIssues.length})</h2>
          {(nearbyReports.length ? nearbyReports : filteredIssues).map((issue: any) => (
            <Card
              key={issue.id}
              className={`cursor-pointer transition-all active:scale-[0.98] ${
                selectedIssue?.id === issue.id ? "ring-2 ring-primary" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedIssue(issue)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base leading-tight">{issue.title}</h3>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{issue.location?.address || issue.location}</span>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(issue.status || 'pending')} text-xs border ml-2`}>{issue.status || 'pending'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Issue Details - Mobile optimized bottom sheet */}
      {selectedIssue && (
        <div className="fixed inset-x-0 bottom-20 bg-card border-t border-border p-4 shadow-lg z-40 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base">{selectedIssue.title}</h3>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setSelectedIssue(null)}>
              ✕
            </Button>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{selectedIssue.location}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 h-10">
              View Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-10 bg-transparent">
              Get Directions
            </Button>
          </div>
        </div>
      )}

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
