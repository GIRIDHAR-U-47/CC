"use client"

import { useState } from "react"
import { PhoneInput } from "./phone-input"
import { OTPVerification } from "./otp-verification"
import { UserDashboard } from "./user-dashboard"
import { Dashboard } from "./dashboard"
import { ConfirmationResult } from "firebase/auth"

interface AuthFlowProps {
  onAuthComplete?: () => void
}

export function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [step, setStep] = useState<"phone" | "otp" | "dashboard">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  const handlePhoneSubmit = (phone: string, confirmation: ConfirmationResult) => {
    setPhoneNumber(phone)
    setConfirmationResult(confirmation)
    setStep("otp")
  }

  const handleOTPVerified = () => {
    setStep("dashboard")
    onAuthComplete?.()
  }

  const handleBack = () => {
    setStep("phone")
  }

  const handleLogout = () => {
    setStep("phone")
    setPhoneNumber("")
    setConfirmationResult(null)
  }

  if (step === "phone") {
    return <PhoneInput onSubmit={handlePhoneSubmit} />
  }

  if (step === "otp" && confirmationResult) {
    return (
      <OTPVerification
        phoneNumber={phoneNumber}
        confirmationResult={confirmationResult}
        onVerified={handleOTPVerified}
        onBack={handleBack}
      />
    )
  }

  if (step === "dashboard") {
    return <Dashboard phoneNumber={phoneNumber} />
  }

  return null
}
