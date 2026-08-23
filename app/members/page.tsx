/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Users, Calendar, Settings, LogOut, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, FileText, Folder, Shield, Mail, MessageCircle, Bell, BarChart2, LayoutDashboard, RefreshCw, Loader2, Loader3 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  membershipPlan?: string;
  feeStatus?: string;
  nextDueDate?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error("Error fetching members:", err));
  }, []);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlanFilter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow mb-8 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Member Management</h1>
        
        {/* Status Filter */}
        <div className="mb-4">
          <select
            value={statusFilter || "All"}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="fee due">Fee Due</option>
          </select>
        </div>
        
        {/* Plan Filter */}
        <div className="mb-4">
          <select
            value={planFilter || "All"}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Plans</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        
        {/* Add Member Button */}
        <div className="mb-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Add New Member
          </button>
        </div>
      </div>
      
      {/* Members Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="p-3 text-left text-sm font-medium text-gray-600">Phone</th>
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
                <td className="p-3">{member.phone}</td>
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
  );
}