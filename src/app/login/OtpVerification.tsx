"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OtpVerification from "@/app/components/animations/otpVerification";

interface VerifyOtpProps {
  onVerifyComplete: (otp: string) => void;
  regenerateOtp: () => void;
}

const VerifyOtp: React.FC<VerifyOtpProps> = ({ onVerifyComplete, regenerateOtp }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [displayTimer, setDisplayTimer] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showAnimation, setShowAnimation] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/, "");
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();

    if (newOtp.every((d) => d !== "")) {
      const otpString = newOtp.join("");
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
        onVerifyComplete(otpString);
      }, 3000);
    }
  };

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    const newOtp = [...otp];

    if ((key === "Backspace" || key === "Delete") && !otp[index] && index > 0) {
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
    setOtp(newOtp);

    if (newOtp.every((d) => d !== "")) {
      const otpString = newOtp.join("");
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
        onVerifyComplete(otpString);
      }, 3000);
    }
  };

  useEffect(() => {
    if (!displayTimer) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setDisplayTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [displayTimer]);

  const handleResendOtp = () => {
    regenerateOtp();
    setDisplayTimer(true);
    setTimer(90);
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
      <div className="text-center w-full max-w-md">
      <p className="font-semibold my-4">
  Please enter verification code you&apos;ve received on your email to continue
</p>

        {showAnimation ? (
          <div className="flex justify-center items-center h-64">
            <OtpVerification />
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onVerifyComplete(otp.join("")); }} className="flex flex-col text-left mt-6">
            <label className="text-base mb-2">Verification Code</label>
            <div className="flex flex-wrap gap-3 my-4">
              {otp.map((digit, i) => (
        <Input
  key={i}
  ref={(el) => {
    inputsRef.current[i] = el;
  }}
  value={digit}
  onChange={handleInputChange(i)}
  onKeyDown={handleKeyDown(i)}
  onPaste={handlePaste}
  maxLength={1}
  inputMode="numeric"
  className="w-10 h-10 text-center text-lg"
  placeholder="X"
/>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
             <p>Haven&apos;t received the verification code?</p>
              {displayTimer ? (
                <p className="font-medium">
                  Resend OTP in: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </p>
              ) : (
                <Button type="button" onClick={handleResendOtp} variant="outline">
                  Resend Code
                </Button>
              )}
            </div>

            <Button
              type="submit"
              disabled={otp.some((d) => !d)}
              className="bg-primary px-4 py-3 border rounded my-2 w-full"
            >
              Verify & Login
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyOtp;
