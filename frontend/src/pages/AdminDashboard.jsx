import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getAdminStatsAPI,
  getAdminUsersAPI,
  toggleBlockUserAPI,
  deleteUserAPI,
  getCategoriesAPI,
  createCategoryAPI,
  deleteCategoryAPI,
} from '../services/adminService';
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Trash2,
  Plus,
  Search,
  Tag,
  DollarSign,
  Loader2,
  CheckCircle2,
  Lock,
  LayoutDashboard,
  ArrowRight,
  Server,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sync activeTab with current route URL
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === '/admin/categories') return 'categories';
    if (location.pathname === '/admin/users') return 'users';
    return 'overview';
  });

  useEffect(() => {
    if (location.pathname === '/admin/categories') {
      setActiveTab('categories');
    } else if (location.pathname === '/admin/users') {
      setActiveTab('users');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'categories') {
      navigate('/admin/categories');
    } else if (tab === 'users') {
      navigate('/admin/users');
    } else {
      navigate('/admin');
    }
  };

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users State & Pagination
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, pages: 1, total: 0, limit: 5 });
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(5);
  const [usersLoading, setUsersLoading] = useState(true);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatColor, setNewCatColor] = useState('#111827');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await getAdminStatsAPI();
      if (res && res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Users with Search, Page, and Limit
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await getAdminUsersAPI({
        page: userPage,
        limit: userLimit,
        search: userSearch,
      });
      if (res && res.success) {
        setUsers(res.data);
        if (res.pagination) setUserPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setUsersLoading(false);
    }
  }, [userPage, userLimit, userSearch]);

  // Fetch Categories
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await getCategoriesAPI();
      if (res && res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle User Block Status Handler
  const handleToggleBlock = async (userId) => {
    try {
      const res = await toggleBlockUserAPI(userId);
      if (res && res.success) {
        showToast(`User status updated: ${res.isBlocked ? 'Blocked' : 'Active'}`);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Delete User Confirm Handler
  const handleConfirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setDeleteLoading(true);
    try {
      await deleteUserAPI(deleteUserId);
      showToast('User account and associated data removed successfully');
      setDeleteModalOpen(false);
      setDeleteUserId(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await createCategoryAPI({
        name: newCatName.trim(),
        type: newCatType,
        color: newCatColor,
      });
      if (res && res.success) {
        showToast('Category created successfully');
        setNewCatName('');
        fetchCategories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategoryAPI(id);
      showToast('Category deleted');
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  // Header content generator depending on tab
  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'users':
        return {
          title: 'User Management',
          subtitle: 'Search registered accounts, modify access status, and manage user records.',
          icon: Users,
        };
      case 'categories':
        return {
          title: 'Category Administration',
          subtitle: 'Create, inspect, and manage system-wide income and expense categories.',
          icon: Tag,
        };
      case 'overview':
      default:
        return {
          title: 'Admin Dashboard Overview',
          subtitle: 'System-wide statistics, active user analytics, and platform health.',
          icon: Lock,
        };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-2xl shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title={headerMeta.title}
        subtitle={headerMeta.subtitle}
        icon={headerMeta.icon}
        badge="Admin"
        action={
          <div className="flex items-center space-x-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-xs">
            <button
              type="button"
              onClick={() => handleTabChange('overview')}
              className={`px-3.5 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'overview'
                  ? 'bg-[#111827] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('users')}
              className={`px-3.5 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'bg-[#111827] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('categories')}
              className={`px-3.5 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'categories'
                  ? 'bg-[#111827] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Categories</span>
            </button>
          </div>
        }
      />

      {/* Dashboard Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-[#111827]" />
          </div>
          <div className="text-2xl font-semibold text-[#0F172A]">
            {statsLoading ? '...' : stats?.totalUsers || 0}
          </div>
          <p className="text-[11px] text-[#64748B]">Registered platform accounts</p>
        </div>

        {/* Active Users */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
            <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-semibold text-[#16A34A]">
            {statsLoading ? '...' : stats?.activeUsersCount || 0}
          </div>
          <p className="text-[11px] text-[#64748B]">Accounts in good standing</p>
        </div>

        {/* Blocked Users */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Blocked Users</span>
            <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
          </div>
          <div className="text-2xl font-semibold text-[#DC2626]">
            {statsLoading ? '...' : stats?.blockedUsersCount || 0}
          </div>
          <p className="text-[11px] text-[#64748B]">Suspended user accounts</p>
        </div>

        {/* Total Platform Volume */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Volume</span>
            <DollarSign className="w-5 h-5 text-[#111827]" />
          </div>
          <div className="text-2xl font-semibold text-[#0F172A]">
            {statsLoading ? '...' : formatCurrency(stats?.totalVolume)}
          </div>
          <p className="text-[11px] text-[#64748B]">
            {stats?.totalTransactions || 0} total transactions logged
          </p>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW TAB (/admin) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Management Summary Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#F1F5F9] text-[#111827] border border-[#E2E8F0]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A]">User Accounts</h3>
                    <p className="text-xs text-[#64748B]">Quick snapshot of platform members</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('users')}
                  className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold hover:bg-[#E2E8F0] transition-colors flex items-center space-x-1.5"
                >
                  <span>Manage Users</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mini User List */}
              {usersLoading ? (
                <div className="py-8 text-center text-xs text-[#64748B] flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#111827]" />
                  <span>Loading recent accounts...</span>
                </div>
              ) : users.length === 0 ? (
                <p className="text-xs text-[#94A3B8] py-4">No user accounts found.</p>
              ) : (
                <div className="space-y-2.5">
                  {users.slice(0, 4).map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-lg bg-[#111827] text-white font-bold text-xs flex items-center justify-center">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A]">{u.name}</p>
                          <p className="text-[10px] text-[#64748B]">{u.email}</p>
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                      >
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Administration Summary Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#F1F5F9] text-[#111827] border border-[#E2E8F0]">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A]">System Categories</h3>
                    <p className="text-xs text-[#64748B]">Transaction classification categories</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('categories')}
                  className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold hover:bg-[#E2E8F0] transition-colors flex items-center space-x-1.5"
                >
                  <span>Manage Categories</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {catLoading ? (
                <div className="py-8 text-center text-xs text-[#64748B] flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#111827]" />
                  <span>Loading categories...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                      <span className="text-[10px] uppercase font-semibold text-[#64748B]">Total Categories</span>
                      <p className="text-xl font-semibold text-[#0F172A] mt-1">{categories.length}</p>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                      <span className="text-[10px] uppercase font-semibold text-[#64748B]">Default System</span>
                      <p className="text-xl font-semibold text-[#0F172A] mt-1">
                        {categories.filter((c) => c.isDefault).length}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {categories.slice(0, 8).map((cat) => (
                      <span
                        key={cat._id}
                        className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#475569]"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Banner */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#111827]">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#0F172A]">System Operational & Security Active</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  MongoDB cluster connected, JWT guards active, AI endpoints online.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>Backend API Online</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: USERS TAB (/admin/users) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Search Bar */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search users by name or email..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E8F0] focus:border-[#111827] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827]"
              />
            </div>
          </div>

          {/* User Data Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
            {usersLoading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#111827]" />
                <p className="text-xs text-[#64748B]">Fetching registered users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#94A3B8]">
                No users found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] text-[#0F172A]">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-xl bg-[#111827] text-white flex items-center justify-center font-bold text-xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-[#0F172A]">{u.name}</p>
                                <p className="text-[11px] text-[#64748B]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.isBlocked ? (
                              <span className="px-2.5 py-1 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-semibold text-[11px] inline-flex items-center space-x-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Blocked</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] font-semibold text-[11px] inline-flex items-center space-x-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#64748B]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {/* Block/Unblock Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(u._id)}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  u.isBlocked
                                    ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:bg-[#DCFCE7]'
                                    : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] hover:bg-[#FEF3C7]'
                                }`}
                                title={u.isBlocked ? 'Unblock User' : 'Block User'}
                              >
                                <Ban className="w-4 h-4" />
                              </button>

                              {/* Delete User Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteUserId(u._id);
                                  setDeleteUserName(u.name);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
                  <div className="flex items-center space-x-3 font-medium">
                    <span>Rows per page:</span>
                    <select
                      value={userLimit}
                      onChange={(e) => {
                        setUserLimit(Number(e.target.value));
                        setUserPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs font-semibold focus:outline-none"
                    >
                      <option value={2}>2</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                    <span>
                      Showing {((userPagination.page - 1) * (userPagination.limit || userLimit)) + 1} -{' '}
                      {Math.min(
                        userPagination.page * (userPagination.limit || userLimit),
                        userPagination.total || users.length
                      )}{' '}
                      of {userPagination.total || users.length} users
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={userPage <= 1 || usersLoading}
                      onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                      className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-40 transition-all flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <span className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A]">
                      Page {userPagination.page || userPage} of {userPagination.pages || 1}
                    </span>

                    <button
                      type="button"
                      disabled={userPage >= (userPagination.pages || 1) || usersLoading}
                      onClick={() => setUserPage((prev) => Math.min(userPagination.pages || 1, prev + 1))}
                      className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-40 transition-all flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: CATEGORIES TAB (/admin/categories) */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Form */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#0F172A] flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#111827]" />
              <span>Create System Category</span>
            </h3>

            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Investment, Freelance, Subscriptions"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#111827] rounded-xl text-[#0F172A] text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase">
                  Type
                </label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#111827] rounded-xl text-[#0F172A] text-xs focus:outline-none"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full bg-[#111827] shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">{cat.name}</p>
                    <p className="text-[10px] text-[#64748B] capitalize">{cat.type}</p>
                  </div>
                </div>

                {!cat.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete User Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteUser}
        loading={deleteLoading}
        itemTitle={`User: ${deleteUserName}`}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
