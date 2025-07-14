'use client';

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import BgCurves from "@/app/components/asset/images/loginBg.png";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LoginAnimation from "@/app/components/animations/loginAnimation";
import VerifyOtp from "./OtpVerification";
import { useUserInformation } from "@/components/context-api/save-user-context";
import { useCheckUserExists } from "@/components/hooks/useCheckExistingUsers";
import { v4 as uuidv4 } from 'uuid';

const Page = () => {
  const router = useRouter();
  const { setUser } = useUserInformation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [currentAuthPayload, setCurrentAuthPayload] = useState<{ email: string; password: string } | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const { isExistingUser } = useCheckUserExists(email);
  const [userVerified, setUserVerified] = useState(false);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError("Email is required");
      return false;
    }
    if (!isValidEmail(emailValue)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  useEffect(() => {
    setUserVerified(isExistingUser);
  }, [isExistingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) return;
    if (userVerified && !password) return alert("Please enter your password");
    if (!userVerified && !confirmPassword) return alert("Please confirm your password");
    if (!userVerified && password !== confirmPassword) return alert("Passwords do not match");

    setButtonLoading(true);

    try {
      if (!userVerified) {
        const response = await fetch("/api/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name: email.split("@")[0],
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Signup failed");
        }
      } else {
        const response = await fetch("/api/authentication", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }
      }

      setCurrentAuthPayload({ email, password });
      setShowOtpVerification(true);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
        console.error(err);
      } else {
        alert("An unknown error occurred.");
        console.error(err);
      }
    } finally {
      setButtonLoading(false);
    }
  };

  const handleVerifyOtp = async (otpValue: string) => {
    if (!otpValue || !currentAuthPayload?.email) return;

    if (otpValue === "123456") {
      try {
        const response = await fetch("/api/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentAuthPayload.email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Token setup failed");
        }

      setUser({
  name: currentAuthPayload.email.split("@")[0],
  email: currentAuthPayload.email,
  id: uuidv4(),
});

        router.push(`/user`);
      } catch (err) {
        alert("Token setup failed");
        console.error(err);
      }
    } else {
      alert("Incorrect OTP");
    }
  };

  const regenerateOtp = () => {
    alert("OTP Sent Successfully");
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-[#FDFDFD] overflow-hidden">
      {/* Left Section with Animation */}
      <div
        className="w-full lg:w-1/2 h-full flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${BgCurves.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <LoginAnimation />
      </div>

      {/* Right Section with Form or OTP */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-4 overflow-hidden">
        {showOtpVerification ? (
          <VerifyOtp onVerifyComplete={handleVerifyOtp} regenerateOtp={regenerateOtp} />
        ) : (
          <div className="text-center w-full max-w-md max-h-[95vh] overflow-auto">
            <p className="font-semibold mt-4">Please login to continue</p>
            <form onSubmit={handleSubmit} className="flex flex-col text-left mt-6">
              <label className="text-base my-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                placeholder="Enter your email"
                className="h-12 w-full"
              />
              {emailError && (
                <p role="alert" className="text-xs text-destructive">
                  {emailError}
                </p>
              )}

              {userVerified ? (
                <>
                  <label className="my-2">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full text-muted-foreground"
                    placeholder="Enter your password"
                  />
                </>
              ) : (
                <>
                  <label className="my-2">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full text-muted-foreground"
                    placeholder="Create password"
                  />
                  <label className="my-2">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 w-full text-muted-foreground"
                    placeholder="Confirm password"
                  />
                </>
              )}

              <Button
                className="bg-primary px-4 py-3 border rounded-lg my-4 w-full sm:w-[180px]"
                disabled={buttonLoading}
                type="submit"
              >
                {buttonLoading ? "Loading..." : "Submit"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
