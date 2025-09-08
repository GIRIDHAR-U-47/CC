"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Shield } from "lucide-react"
import { setupRecaptcha, sendOTP } from "@/lib/firebase"
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth"

interface PhoneInputProps {
  onSubmit: (phone: string, confirmationResult: ConfirmationResult) => void
}

export function PhoneInput({ onSubmit }: PhoneInputProps) {
  const [countryCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)
  const [error, setError] = useState("")
  const [cooldownTime, setCooldownTime] = useState(0)

  useEffect(() => {
    // Setup reCAPTCHA when component mounts
    if (typeof window !== 'undefined') {
      // Clean previous container if hot-reloaded
      const container = document.getElementById('recaptcha-container')
      if (container) container.innerHTML = ''
      const verifier = setupRecaptcha('recaptcha-container')
      setRecaptchaVerifier(verifier)
    }
  }, [])

  useEffect(() => {
    // Countdown timer for cooldown
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return

    setIsLoading(true)
    setError("")
    
    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`
      
      // Test authentication bypass for development
      if (process.env.NODE_ENV === 'development' && phoneNumber === '8122949677') {
        console.log('Using test authentication bypass for phone:', fullPhoneNumber)
        // Create a mock confirmation result for test number
        const mockConfirmationResult = {
          verificationId: 'test-verification-id',
          confirm: async (code: string) => {
            if (code === '123456') {
              return { user: { uid: 'test-user-id', phoneNumber: fullPhoneNumber } }
            } else {
              throw new Error('Invalid verification code')
            }
          }
        } as any
        
        onSubmit(fullPhoneNumber, mockConfirmationResult)
        return
      }
      
      // Normal Firebase authentication flow
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized. Please refresh the page.')
      }
      
      const confirmationResult = await sendOTP(fullPhoneNumber, recaptchaVerifier)
      onSubmit(fullPhoneNumber, confirmationResult)
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      const errorMessage = error.message || 'Failed to send OTP. Please try again.'
      setError(errorMessage)
      
      // Extract cooldown time from error message if present
      const waitTimeMatch = errorMessage.match(/wait (\d+) seconds/)
      if (waitTimeMatch) {
        setCooldownTime(parseInt(waitTimeMatch[1]))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-balance">Civic Connect</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Enter your mobile number to start reporting civic issues in your area
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2 border rounded-md bg-muted text-muted-foreground min-w-fit">
                  🇮🇳 +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="flex-1"
                  maxLength={10}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">We'll send an OTP to verify your mobile number</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-blue-500 mt-1">
                  Dev Mode: Use test number 8122949677 with OTP 123456
                </p>
              )}
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || phoneNumber.length !== 10 || cooldownTime > 0}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending OTP...
                </div>
              ) : cooldownTime > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Wait {cooldownTime}s
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Send OTP
                </div>
              )}
            </Button>
          </form>
          <div id="recaptcha-container"></div>
        </CardContent>
      </Card>
    </div>
  )
}
