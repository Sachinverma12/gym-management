/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  membershipPlan?: string;
  feeStatus?: string;
  nextDueDate?: string;
}

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching members:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex-1 py-2 px-4 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-600 transition-colors"
            >
              Dashboard
            </Link>
            <button
              className="py-2 px-4 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/auth";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-2xl font-bold text-green-600">{members.length}</p>
            <p className="text-sm text-gray-500">Total Members</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">Active Today</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Pending Payments</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-2xl font-bold text-orange-600">0</p>
            <p className="text-sm text-gray-500">New Referrals</p>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-font-semibold text-lg text-gray-800">Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Email</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Plan</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">{member.name}</td>
                    <td className="p-3">{member.email}</td>
                    <td className="p-3">{member.membershipPlan || "N/A"}</td>
                    <td className="p-3">{member.feeStatus || "N/A"}</td>
                    <td className="p-3">
                      <button className="text-green-600 hover:underline">View</button>
                      <button className="text-blue-600 hover:underline">Edit</button>
                      <button className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-font-semibold text-lg text-gray-800">Recent Activity</h2>
          </div>
          <p className="text-sm text-gray-500">Activity data will appear here</p>
        </div>
      </div>
    </div>
  );
}