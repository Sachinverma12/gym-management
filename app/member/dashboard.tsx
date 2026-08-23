import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Calendar, CheckClock, Clock, Shield, ShieldCheck, Users, Mail, MessageCircle, Bell, TrendingUp, DollarSign, FileText, Folder, LogOut } from "lucide-react";

// @ts-nocheck
export default function MemberDashboard() {
  const [profile, setProfile] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [feeStatus, setFeeStatus] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch profile and data from API
    fetch("/api/member/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("gym_token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user);
        setFeeStatus(data.feeStatus);
        setNextDueDate(data.nextDueDate ? new Date(data.nextDueDate).toLocaleDateString() : "N/A");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setIsLoading(false);
      });

    // Fetch attendance history
    fetch("/api/attendance/history/:userId", {
      headers: { Authorization: `Bearer ${localStorage.getItem("gym_token")}` }
    })
      .then((res) => res.json())
      .then((data) => setAttendanceHistory(data))
      .catch((err) => console.error("Error fetching attendance:", err));
  }, []);

  // Handle WhatsApp keyword commands
  const handleKeyword = async (keyword) => {
    setMessage(`Sending "${keyword}"...`);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("gym_token")}`,
        },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      setMessage(data.message || "Command sent");
    } catch (err) {
      setMessage("Error sending command");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow">
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="stroke-2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m0 0v6l-4 2m4-4v4l-4-2m0 0v-6l4-2m-4 4v-4l4 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Member Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Welcome, {profile?.name || "Member"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">My Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{profile?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profile?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profile?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Join Date</p>
              <p className="font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Fee Status Card */}
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Fee Status</h3>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded ${feeStatus === "PAID" ? "bg-green-100 text-green-800" : feeStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
              {feeStatus === "PAID" ? "✓" : feeStatus === "PENDING" ? "⏳" : "⚠️"}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-800">Status: {feeStatus}</p>
              <p className="text-sm text-gray-500">Next Due: {nextDueDate}</p>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance History</h3>
          <div className="space-y-3">
            {attendanceHistory.length === 0 ? (
              <p className="text-gray-500">No attendance records found. Your first check-in is waiting!</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {attendanceHistory.map((record, index) => (
                  <div key={index} className="p-3 rounded bg-gray-50">
                    <p className="text-xs text-gray-500">{new Date(record.checkInAt).toLocaleDateString()}</p>
                    <p className="font-medium">{record.status === "CHECKED_IN" ? "Checked In" : "Checked Out"}</p>
                    {record.checkOutAt && (
                      <p className="text-xs text-gray-500">Time: {Math.round((new Date(record.checkOutAt) - new Date(record.checkInAt)) / 60000)} min</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Commands */}
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Commands (WhatsApp)</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleKeyword("balance")}
              className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
              title="Check Fee Status"
            >
              Balance
            </button>
            <button
              onClick={() => handleKeyword("status")}
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors"
              title="Last Check-in"
            >
              Status
            </button>
            <button
              onClick={() => handleKeyword("history")}
              className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium transition-colors"
              title="Attendance History"
            >
              History
            </button>
            <button
              onClick={() => handleKeyword("pay")}
              className="py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium transition-colors"
              title="Make Payment"
            >
              Pay
            </button>
          </div>
          {message && (
            <p className="mt-3 text-sm {message.includes("Error") ? "text-red-600" : "text-green-600"}">
              {message}
            </p>
          )}
        </div>

        {/* Logout */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/auth";
            }}
            className="w-full py-3 text-lg text-red-600 font-medium hover:text-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}