import React, { useState, useEffect, useCallback } from 'react';
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
  Activity,
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'categories'

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatColor, setNewCatColor] = useState('#DC2626');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

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

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await getAdminUsersAPI({ page: userPage, search: userSearch });
      if (res && res.success) {
        setUsers(res.data);
        if (res.pagination) setUserPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load users', err);
      setError('Could not load user list');
    } finally {
      setUsersLoading(false);
    }
  }, [userPage, userSearch]);

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

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Admin Control Panel"
        subtitle="System-wide statistics, user management, and category administration."
        icon={Lock}
        badge="Admin"
        action={
          <div className="flex items-center space-x-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'bg-white text-[#DC2626] border border-[#FECACA] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'categories'
                  ? 'bg-white text-[#DC2626] border border-[#FECACA] shadow-xs'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-[#DC2626]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F172A]">
            {statsLoading ? '...' : stats?.totalUsers || 0}
          </div>
          <p className="text-[11px] text-[#64748B]">Registered platform accounts</p>
        </div>

        {/* Active Users */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Users</span>
            <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-extrabold text-[#16A34A]">
            {statsLoading ? '...' : stats?.activeUsersCount || 0}
          </div>
          <p className="text-[11px] text-[#64748B]">Accounts in good standing</p>
        </div>

        {/* Blocked Users */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Blocked Users</span>
            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-extrabold text-[#EF4444]">
            {statsLoading ? '...' : stats?.blockedUsersCount || 0}
          </div>
          <p className="text-[11px] text-[#64748B]">Suspended user accounts</p>
        </div>

        {/* Total Platform Volume */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Volume</span>
            <DollarSign className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div className="text-2xl font-extrabold text-[#7C3AED]">
            {statsLoading ? '...' : formatCurrency(stats?.totalVolume)}
          </div>
          <p className="text-[11px] text-[#64748B]">
            {stats?.totalTransactions || 0} total transactions logged
          </p>
        </div>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Search Bar */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex items-center justify-between">
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
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* User Data Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden">
            {usersLoading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
                <p className="text-xs text-[#64748B]">Fetching users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#94A3B8]">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center font-bold text-xs">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-[#0F172A]">{u.name}</p>
                              <p className="text-[11px] text-[#64748B]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                              u.role === 'admin'
                                ? 'bg-[#FAF5FF] text-[#7C3AED] border-[#E9D5FF]'
                                : 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.isBlocked ? (
                            <span className="px-2.5 py-1 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-bold text-[11px] inline-flex items-center space-x-1">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Blocked</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] font-bold text-[11px] inline-flex items-center space-x-1">
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
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Category Management */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Form */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#DC2626]" />
              <span>Create System Category</span>
            </h3>

            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#64748B] uppercase">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Investment, Freelance, Subscriptions"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#64748B] uppercase">
                  Type
                </label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] text-xs focus:outline-none"
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
                className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full border border-current/20"
                    style={{ backgroundColor: cat.color || '#DC2626' }}
                  />
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">{cat.name}</p>
                    <p className="text-[10px] text-[#64748B] capitalize">{cat.type}</p>
                  </div>
                </div>

                {!cat.isDefault && (
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
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
