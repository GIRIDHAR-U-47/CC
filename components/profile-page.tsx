"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, User, MapPin, Settings, LogOut, Edit, Camera } from "lucide-react"
import { getUserProfile, updateUserProfile, getReportsByUser, type UserProfile, type CivicReport } from "@/lib/firebase"

interface ProfilePageProps {
  onBack: () => void
  phoneNumber: string
}

export function ProfilePage({ onBack, phoneNumber }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editedProfile, setEditedProfile] = useState<{ name: string; email: string; address: string }>({ name: "", email: "", address: "" })
  const [userReports, setUserReports] = useState<CivicReport[]>([])
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailUpdates: false,
    smsAlerts: true,
  })

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const data = await getUserProfile(phoneNumber)
        if (!isMounted) return
        if (data) {
          setProfile(data)
          setEditedProfile({ name: data.name ?? "", email: data.email ?? "", address: data.address ?? "" })
        } else {
          // If user profile doesn't exist yet, create a default one
          const defaultName = `User${Math.floor(Math.random() * 9000) + 1000}`
          const created: UserProfile = {
            phoneNumber,
            uid: 'temp-uid',
            name: defaultName,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: true,
            reportCount: 0,
          }
          try {
            // Persist default profile; uid will be updated on next auth cycle
            await updateUserProfile(phoneNumber, created)
          } catch (e) {
            console.warn('Could not create default profile yet:', e)
          }
          setProfile(created)
          setEditedProfile({ name: created.name ?? "", email: created.email ?? "", address: created.address ?? "" })
        }

        // Load user reports for statistics
        try {
          const userId = phoneNumber.replace(/[^0-9]/g, '')
          const reports = await getReportsByUser(userId)
          if (isMounted) {
            setUserReports(reports)
          }
        } catch (e) {
          console.warn('Could not load user reports:', e)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [phoneNumber])

  const handleSave = async () => {
    if (!profile) return
    await updateUserProfile(phoneNumber, {
      name: editedProfile.name,
      email: editedProfile.email || undefined,
      address: editedProfile.address || undefined,
    })
    setProfile({
      ...profile,
      name: editedProfile.name,
      email: editedProfile.email,
      address: editedProfile.address,
      updatedAt: Date.now(),
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (profile) {
      setEditedProfile({ 
        name: profile.name ?? "", 
        email: profile.email ?? "", 
        address: profile.address ?? "" 
      })
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    // In a real app, this would clear auth tokens and redirect to login
    window.location.reload()
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Profile Picture & Basic Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                {isEditing && (
                  <Button size="icon" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full">
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profile.name || "User"}</h2>
                <p className="text-muted-foreground">{profile.phoneNumber}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>Member since Jan 2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <p className="text-sm text-muted-foreground">{profile.phoneNumber}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email || ""}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.email || ""}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={editedProfile.address || ""}
                  onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.address || ""}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Manage how you receive updates about your reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Updates</p>
                <p className="text-sm text-muted-foreground">Get status updates via email</p>
              </div>
              <Switch
                checked={notifications.emailUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailUpdates: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Alerts</p>
                <p className="text-sm text-muted-foreground">Receive urgent updates via text</p>
              </div>
              <Switch
                checked={notifications.smsAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Impact</CardTitle>
            <CardDescription>Your contribution to the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{userReports.length}</div>
                <div className="text-sm text-muted-foreground">Reports Submitted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{userReports.filter(r => r.status === 'resolved').length}</div>
                <div className="text-sm text-muted-foreground">Issues Resolved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{userReports.filter(r => r.status === 'in-progress').length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="p-4">
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
