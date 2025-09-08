"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Save, Edit3 } from "lucide-react"
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/firebase"

interface ProfileEditorProps {
  phoneNumber: string
  onProfileUpdated?: (profile: UserProfile) => void
  onCancel?: () => void
}

export function ProfileEditor({ phoneNumber, onProfileUpdated, onCancel }: ProfileEditorProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: ""
  })

  useEffect(() => {
    loadProfile()
  }, [phoneNumber])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const userProfile = await getUserProfile(phoneNumber)
      if (userProfile) {
        setProfile(userProfile)
        setFormData({
          name: userProfile.name || "",
          email: userProfile.email || "",
          address: userProfile.address || ""
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError("")

      await updateUserProfile(phoneNumber, {
        name: formData.name.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined
      })

      // Reload profile to get updated data
      await loadProfile()
      
      if (onProfileUpdated && profile) {
        onProfileUpdated({
          ...profile,
          name: formData.name,
          email: formData.email,
          address: formData.address
        })
      }

    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading profile...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Update your personal information
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Phone Number (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            {error && (
              <div className="text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Profile
                  </div>
                )}
              </Button>
            </div>

            {profile && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Current Profile:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
                  <p><strong>Email:</strong> {profile.email || 'Not set'}</p>
                  <p><strong>Address:</strong> {profile.address || 'Not set'}</p>
                  <p><strong>Reports:</strong> {profile.reportCount}</p>
                  <p><strong>Member since:</strong> {profile.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
