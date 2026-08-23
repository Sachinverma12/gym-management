/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("enter-phone");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (status === "enter-phone") {
      // Send OTP
      await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      setStatus("enter-otp");
      setMessage("OTP sent successfully! Enter the code you received.");
    } else {
      // Verify OTP and login
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const data = await response.json();
      
      if (data.token) {
        // Store token and redirect
        const token = data.token;
        localStorage.setItem("gym_token", token);
        window.location.href = "/";
      } else {
        setMessage(data.message || "Invalid OTP");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Gym QR Attendance</h1>
          <p className="text-gray-600">Sign in with your phone number</p>
        </div>
        
        {message && (
          <div className="mb-4 p-3 rounded" style={{
            marginBottom: "1.5rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            background:
              status === "enter-otp"
                ? "rgba(34, 197, 74, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
              color:
                status === "enter-otp"
                  ? "#16a34a"
                  : "#dc2626",
          }}
          className="mb-4 p-3 rounded"
        >
          {message}
        </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "enter-phone" && (
            <div>
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full p-3 border rounded focus:outline-none focus:border-green-500"
              />
            </div>
          )}
          
          {status === "enter-otp" && (
            <div>
              <input
                type="number"
                placeholder="OTP code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength="6"
                className="w-full p-3 border rounded focus:outline-none focus:border-green-500"
              />
            </div>
          )}
        </form>
        
        <div className="text-center mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Processing..." : status === "enter-phone" ? "Send OTP" : "Verify & Login"}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <Link
            href="/admin"
            className="text-sm text-green-600 hover underline"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}