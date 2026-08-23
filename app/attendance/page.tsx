/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";

interface AttendanceRecord {
  id: string;
  userId: string;
  checkInAt: Date;
  checkOutAt?: Date;
  status: "CHECKED_IN" | "CHECKED_OUT";
  timeSpentMinutes?: number;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetch("/api/attendance/history/1")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
        setAttendanceCount(data.length);
      })
      .catch((err) => console.error("Error fetching attendance:", err));
  }, []);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "1",
          branchId: "default-branch",
        }),
      });
      const result = await response.json();
      setIsCheckingIn(false);
      if (response.ok) {
        setAttendanceCount((prev) => prev + 1);
        fetch("/api/attendance/history/1").then((r) => r.json()).then((d) => setRecords(d));
      }
    } catch (err) {
      setIsCheckingIn(false);
      console.error("Check-in error:", err);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "1" }),
      });
      const result = await response.json();
      setIsCheckingOut(false);
      if (response.ok) {
        fetch("/api/attendance/history/1").then((r) => r.json()).then((d) => setRecords(d));
      }
    } catch (err) {
      setIsCheckingOut(false);
      console.error("Check-out error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow mb-8 p-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Tracking</h1>
        
        {/* Check-in Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">Check In</h2>
          <div className="border-2 dashed border-gray-300 rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path className="stroke-2" strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Position your phone over the QR code</p>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className="w-full py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCheckingIn ? (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
              >
                <path className="stroke-2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v5h.582m0 0m-15.356-2A8.001 8.001 0 004.582 15m0 0H9m11-11v5h.582m-1.618-5.407a8.001 8.001 0 01-2.038-.728 8.001 8.001 0 00-2.038.728 8.001 8.001 0 01-2.038-.728m0 0a8.003 8.003 0 01-2.038.728 8.003 8.003 0 00-2.038-.728m0 0a8.003 8.003 0 01-2.038-.728 8.003 8.003 0 00-2.038.728" />
              </svg>
            ) : (
              "Check In"
            )}
          </button>
        </div>

        {/* Check-out Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Check Out</h2>
          <button
            onClick={handleCheckOut}
            disabled={isCheckingOut}
            className="w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCheckingOut ? (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
              >
                <path className="stroke-2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v5h.582m0 0m-15.356-2A8.001 8.001 0 004.582 15m0 0H9m11-11v5h.582m-1.618-5.407a8.001 8.001 0 01-2.038-.728 8.001 8.001 0 00-2.038.728 8.001 8.001 0 01-2.038-.728m0 0a8.003 8.003 0 01-2.038.728 8.003 8.003 0 00-2.038-.728m0 0a8.003 8.003 0 01-2.038-.728 8.003 8.003 0 00-2.038-.728" />
              </svg>
            ) : (
              "Check Out"
            )}
          </button>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-2xl font-bold text-green-600">{attendanceCount}</p>
            <p className="text-sm text-gray-500">Check-ins This Month</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-2xl text-gray-600">---</p>
            <p className="text-sm text-gray-500">Peak Hours</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-2xl text-gray-600">---</p>
            <p className="text-sm text-gray-500">Monthly Trend</p>
          </div>
        </div>
      </div>
    </div>
  );
}