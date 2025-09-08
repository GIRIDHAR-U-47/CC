"use client"

import { useState } from "react"
import { PhoneInput } from "@/components/phone-input"
import { OTPVerification } from "@/components/otp-verification"
import { Dashboard } from "@/components/dashboard"

type AuthStep = "phone" | "otp" | "dashboard"

export default function Home() {
  const [authStep, setAuthStep] = useState<AuthStep>("phone")
  const [phoneNumber, setPhoneNumber] = useState("")

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone)
    setAuthStep("otp")
  }

  const handleOTPVerified = () => {
    setAuthStep("dashboard")
  }

  const handleBackToPhone = () => {
    setAuthStep("phone")
  }

  return (
    <main className="min-h-screen bg-background">
      {authStep === "phone" && <PhoneInput onSubmit={handlePhoneSubmit} />}
      {authStep === "otp" && (
        <OTPVerification phoneNumber={phoneNumber} onVerified={handleOTPVerified} onBack={handleBackToPhone} />
      )}
      {authStep === "dashboard" && <Dashboard />}
    </main>
  )
}
