"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Edit3, MapPin, FileText, Settings } from "lucide-react"
import { getUserProfile, UserProfile } from "@/lib/firebase"
import { ProfileEditor } from "./profile-editor"

interface UserDashboardProps {
  phoneNumber: string
  onLogout?: () => void
}

export function UserDashboard({ phoneNumber, onLogout }: UserDashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadProfile()
  }, [phoneNumber])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const userProfile = await getUserProfile(phoneNumber)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    setShowProfileEditor(false)
  }

  if (showProfileEditor) {
    return (
      <ProfileEditor
        phoneNumber={phoneNumber}
        onProfileUpdated={handleProfileUpdated}
        onCancel={() => setShowProfileEditor(false)}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading dashboard...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {profile?.name || 'User'}!
                </h1>
                <p className="text-gray-600">{phoneNumber}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowProfileEditor(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {profile?.reportCount || 0}
              </div>
              <p className="text-sm text-gray-600">Civic issues reported</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {profile?.name || 'Not set'}</p>
                <p><strong>Email:</strong> {profile?.email || 'Not set'}</p>
                <p><strong>Address:</strong> {profile?.address || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p><strong>Status:</strong> {profile?.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Joined:</strong> {profile?.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              What would you like to do today?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="h-20 flex-col gap-2" variant="outline">
                <MapPin className="w-6 h-6" />
                <span>Report Civic Issue</span>
              </Button>
              <Button className="h-20 flex-col gap-2" variant="outline">
                <FileText className="w-6 h-6" />
                <span>View My Reports</span>
              </Button>
              <Button 
                className="h-20 flex-col gap-2" 
                variant="outline"
                onClick={() => setShowProfileEditor(true)}
              >
                <Edit3 className="w-6 h-6" />
                <span>Edit Profile</span>
              </Button>
              <Button 
                className="h-20 flex-col gap-2" 
                variant="outline"
                onClick={onLogout}
              >
                <Settings className="w-6 h-6" />
                <span>Logout</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
