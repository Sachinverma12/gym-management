import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Calendar, TrendingUp, DollarSign, 
  Settings, Shield, Folder, FileText, 
  LogOut, CheckCircle, XClock, Clock,
  Mail, MessageCircle, Bell, 
  BarChart2, LayoutDashboard, 
  Star, ShieldCheck, 
  RefreshCw, 
  Loader2,
  Loader3
} from "lucide-react";

// @ts-nocheck
export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [editMember, setEditMember] = useState<null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Analytics state
  const [dailyFootfall, setDailyFootfall] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<number[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingDues, setPendingDues] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch members
      const membersRes = await fetch("/api/members", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("gym_token")}` }
      });
      const membersData = await membersRes.json();
      setMembers(membersData);
      setFilteredMembers(membersData);
      
      // Fetch plans
      const plansRes = await fetch("/api/plans");
      const plansData = await plansRes.json();
      setPlans(plansData);
      
      // Fetch notifications
      const notifRes = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("gym_token")}` }
      });
      const notifData = await notifRes.json();
      setNotifications(notifData);
      
      // Fetch analytics
      const analyticsRes = await fetch("/api/analytics", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("gym_token")}` }
      });
      const analyticsData = await analyticsRes.json();
      setDailyFootfall(analyticsData.dailyFootfall || []);
      setPeakHours(analyticsData.peakHours || []);
      setMonthlyTrends(analyticsData.monthlyTrends || []);
      setTotalRevenue(analyticsData.totalRevenue || 0);
      setPendingDues(analyticsData.pendingDues || 0);
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter members
  useEffect(() => {
    let filtered = members;
    
    if (statusFilter) {
      filtered = filtered.filter((m: any) => m.feeStatus === statusFilter);
    }
    
    if (planFilter) {
      filtered = filtered.filter((m: any) => m.membershipPlan === planFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m: any) => 
        m.name.toLowerCase().includes(query) || 
        m.phone.includes(query)
      );
    }
    
    setFilteredMembers(filtered);
  }, [members, searchQuery, statusFilter, planFilter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("gym_token")}`
        },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      
      if (data.message) {
        setMessage("Member added successfully");
        setShowAddModal(false);
        setNewMember({ name: "", phone: "", email: "" });
        fetchData();
      } else {
        setMessage(data.message || "Error adding member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      setMessage("Error adding member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditMember(members.find((m: any) => m.id === id) || null);
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteMemberId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteMemberId) return;
    
    setIsLoading(true);
    try {
      await fetch(`/api/members/${deleteMemberId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("gym_token")}`
        }
      });
      setMessage("Member deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting member:", error);
      setMessage("Error deleting member");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteMemberId(null);
    }
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    // Mock analytics data for now
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Daily footfall for last 30 days
    const dailyFootfall = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dayCheckIns = Math.floor(Math.random() * 20) + 10; // Mock data
      dailyFootfall.push({
        date: date.toLocaleDateString(),
        checkIns: dayCheckIns
      });
    }
    
    // Peak hours (mock: typically 6-10 PM)
    const peakHours = [18, 19, 20, 21];
    
    // Monthly trends (mock)
    const monthlyTrends = [
      { month: "Jan", revenue: 5000 },
      { month: "Feb", revenue: 4800 },
      { month: "Mar", revenue: 5200 },
      { month: "Apr", revenue: 5500 }
    ];
    
    return { dailyFootfall, peakHours, monthlyTrends };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-white shadow border-r border-gray-200 flex h-screen">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="stroke-2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m0 0v6l-4 2m4-4v4l-4-2m0 0v-6l4-2m-4 4v-4l4 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Gym Management</h2>
          </div>
          <div className="hidden md:block">
            <span className="text-gray-600">Welcome, Admin</span>
          </div>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/members" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                <Users className="w-5 h-5" />
                Members ({members.length})
              </Link>
            </li>
            <li>
              <Link 
                "/attendance" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                <Calendar className="w-5 h-5" />
                Attendance
              </Link>
            </li>
            <li>
              <Link 
                "/plans" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                <Settings className="w-5 h-5" />
                Plans
              </Link>
            </li>
            <li>
              <Link 
                "/payments" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                <DollarSign className="w-5 h-5" />
                Payments
              </Link>
            </li>
            <li>
              <Link 
                "/reports" 
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                <TrendingUp className="w-5 h-5" />
                Reports
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="mt-auto border-t border-gray-200">
          <button
            onClick={() => localStorage.clear(); window.location.href = "/auth"}
            className="w-full py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
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
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Today</span>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="stroke-2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m0 0v6l-4 2m4-4v4l-4-2m0 0v-6l4-2m-4 4v-4l4-2m-4 4v-4l4 2" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {/* Total Members Card */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{members.length}</p>
                <p className="text-sm text-gray-500">Total Members</p>
              </div>
            </div>
          </div>
          
          {/* Active Members Card */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">128</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
          
          {/* Pending Dues Card */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">${pendingDues}</p>
                <p className="text-sm text-gray-500">Pending Dues</p>
              </div>
            </div>
          </div>
          
          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">${totalRevenue}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
          
          {/* Attendance This Month Card */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{members.reduce((sum: number, m: any) => sum + (m.attendanceCountThisMonth || 0), 0)}</p>
                <p className="text-sm text-gray-500">Total Check-ins</p>
              </div>
            </div>
          </div>
          
          {/* Peak Hours Card */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">6-9 PM</p>
                <p className="text-sm text-gray-500">Peak Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <section className="bg-white rounded-xl shadow mb-6">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">All Members</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors text-sm"
            >
              + Add Member
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Phone</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Plan</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Fee Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Last Check-in</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Attendance This Month</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      No members found
                    </td>
                  </tr>
                )}
                {filteredMembers.map((member: any) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium">{member.name}</td>
                    <td className="p-3 text-sm text-gray-600">{member.phone}</td>
                    <td className="p-3">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${member.membershipPlan === "MONTHLY" ? "bg-blue-100 text-blue-800" : member.membershipPlan === "QUARTERLY" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}
                      >
                        {member.membershipPlan || "No plan"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${member.feeStatus === "PAID" ? "bg-green-100 text-green-800" : member.feeStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                      >
                        {member.feeStatus || "Pending"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{member.lastCheckIn ? new Date(member.lastCheckIn).toLocaleDateString() : "Never"}</td>
                    <td className="p-3 text-sm text-gray-500">{member.attendanceCountThisMonth || 0}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Link 
                          href={`/members/${member.id}`} 
                          className="text-blue-600 hover underline text-sm"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleEdit(member.id)}
                          className="text-yellow-600 hover underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="bg-white rounded-xl shadow mb-6">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter || "All"}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="fee due">Fee Due</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                <select
                  value={planFilter || "All"}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Plans</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Members Management Modals */}
        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
              <h3 className="text-2xl font-bold text-green-800 mb-6">Add New Member</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+1234567890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="example@gym.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Membership Plan</label>
                  <select
                    value={newMember.membershipPlan || ""}
                    onChange={(e) => setNewMember({ ...newMember, membershipPlan: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select plan</option>
                    <option value="MONTHLY">Monthly - $50</option>
                    <option value="QUARTERLY">Quarterly - $130</option>
                    <option value="YEARLY">Yearly - $500</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {editMember && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
              <h3 className="text-2xl font-bold text-green-800 mb-6">Edit Member</h3>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  // Handle update
                  setShowAddModal(false);
                }}
              >
                <input type="hidden" value={editMember!.id} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editMember!.name}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editMember!.phone}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditMember(null)}
                    className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && deleteMemberId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg w-max p-8 text-center">
              <h3 className="text-xl font-bold text-red-600 mb-4">Delete Member</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this member? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}