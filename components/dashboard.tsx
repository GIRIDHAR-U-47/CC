"use client"

import type React from "react"

import { useState } from "react"
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
  AlertTriangle,
  CheckCircle,
  ClockIcon,
  Mic,
  MicOff,
  Navigation,
} from "lucide-react"
import { MapView } from "@/components/map-view"
import { MyReports } from "@/components/my-reports"
import { ProfilePage } from "@/components/profile-page"
import { NotificationsPage } from "@/components/notifications-page"

const mockReports = [
  {
    id: 1,
    title: "Street Light Not Working",
    location: "Anna Salai, T. Nagar, Chennai",
    time: "2 hours ago",
    status: "pending",
    image: "/broken-street-light.png",
  },
  {
    id: 2,
    title: "Large Pothole on Road",
    location: "OMR, Thoraipakkam, Chennai",
    time: "1 day ago",
    status: "active",
    image: "/pothole-on-road.jpg",
  },
  {
    id: 3,
    title: "Illegal Wall Posters",
    location: "Pondy Bazaar, T. Nagar, Chennai",
    time: "3 days ago",
    status: "resolved",
    image: "/graffiti-on-wall.jpg",
  },
]

const stats = [
  {
    label: "Active Issues",
    value: 12,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
  },
  {
    label: "Resolved",
    value: 45,
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  {
    label: "Pending",
    value: 8,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: ClockIcon,
    iconColor: "text-blue-600",
  },
]

export function Dashboard({ phoneNumber }: { phoneNumber: string }) {
  const [activeTab, setActiveTab] = useState("dashboard")

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
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon
            return (
              <Card
                key={stat.label}
                className={`text-center border ${stat.color.includes("border") ? stat.color.split(" ").find((c) => c.includes("border")) : "border-border"}`}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex justify-center mb-2">
                    <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.iconColor}`} />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-tight">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

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

        {/* Recent Reports */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {mockReports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={report.image || "/placeholder.svg"}
                      alt={report.title}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base leading-tight mb-2">{report.title}</h3>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{report.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{report.time}</span>
                        </div>
                        <Badge className={`${getStatusColor(report.status)} text-xs border`}>{report.status}</Badge>
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
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [isCapturingLocation, setIsCapturingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // In a real app, you'd reverse geocode to get the address
          setLocation({
            lat: latitude,
            lng: longitude,
            address: "Current Location, Chennai, Tamil Nadu",
          })
          setIsCapturingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsCapturingLocation(false)
        },
      )
    }
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
              <Button
                variant="outline"
                className="w-full h-12 flex items-center gap-2 bg-transparent"
                onClick={captureLocation}
                disabled={isCapturingLocation}
              >
                <Navigation className="w-5 h-5" />
                {isCapturingLocation ? "Getting Location..." : "Capture Location"}
              </Button>
              {location && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Location Captured</p>
                  <p className="text-xs text-muted-foreground">{location.address}</p>
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
