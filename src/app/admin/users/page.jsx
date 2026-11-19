'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Mail,
  User,
  Clock,
  Check,
  X,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  Calendar,
  Image as ImageIcon,
  ArrowRightLeft,
  UserCheck,
  Info,
} from 'lucide-react';

export const ROLE_PERMISSIONS_PRESETS = {
  superadmin: {
    key: 'superadmin',
    label: 'Super Admin',
    badgeColor: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    description: 'Full unrestricted root access to all modules, backups, settings & user management.',
    permissions: {
      managePosts: true,
      managePlayers: true,
      manageMatches: true,
      manageMedia: true,
      manageRedirects: true,
      manageUsers: true,
    },
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: 'Manage all website content, squad, match center, media, and redirects.',
    permissions: {
      managePosts: true,
      managePlayers: true,
      manageMatches: true,
      manageMedia: true,
      manageRedirects: true,
      manageUsers: false,
    },
  },
  editor: {
    key: 'editor',
    label: 'Editor',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Create, publish & update articles, players, match center fixtures, and media.',
    permissions: {
      managePosts: true,
      managePlayers: true,
      manageMatches: true,
      manageMedia: true,
      manageRedirects: false,
      manageUsers: false,
    },
  },
  author: {
    key: 'author',
    label: 'Author',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'Write, draft & manage blog articles and upload media. Listed in author dropdown.',
    permissions: {
      managePosts: true,
      managePlayers: false,
      manageMatches: false,
      manageMedia: true,
      manageRedirects: false,
      manageUsers: false,
    },
  },
  viewer: {
    key: 'viewer',
    label: 'Viewer',
    badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    description: 'Read-only analytics and overview monitoring. No edit or publish permissions.',
    permissions: {
      managePosts: false,
      managePlayers: false,
      manageMatches: false,
      manageMedia: false,
      manageRedirects: false,
      manageUsers: false,
    },
  },
};

export const PERMISSION_MODULES = [
  { key: 'managePosts', label: 'Articles & Content', icon: FileText, desc: 'Create, edit, draft & publish articles and categories' },
  { key: 'managePlayers', label: 'Squad & Players', icon: Users, desc: 'Add team roster, player profiles, stats & legends' },
  { key: 'manageMatches', label: 'Match Center', icon: Calendar, desc: 'Schedule fixtures, update live scores & standings' },
  { key: 'manageMedia', label: 'Media Library', icon: ImageIcon, desc: 'Upload, delete & organize media files and photos' },
  { key: 'manageRedirects', label: '301/302 Redirects', icon: ArrowRightLeft, desc: 'Create & manage SEO redirect rules & aliases' },
  { key: 'manageUsers', label: 'User Control', icon: UserCheck, desc: 'Manage user accounts, assign roles & reset passwords' },
];

export default function AdminUsersMasterPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    superadmin: 0,
    admin: 0,
    editor: 0,
    author: 0,
    viewer: 0,
    active: 0,
    suspended: 0,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [roleMatrixModalOpen, setRoleMatrixModalOpen] = useState(false);
  const [selectedMatrixRole, setSelectedMatrixRole] = useState('editor');

  // Form states for Create User
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('editor');
  const [newStatus, setNewStatus] = useState('active');
  const [newBio, setNewBio] = useState('');
  const [newPermissions, setNewPermissions] = useState({ ...ROLE_PERMISSIONS_PRESETS.editor.permissions });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Password Reset state
  const [resetPassValue, setResetPassValue] = useState('');
  const [resettingPass, setResettingPass] = useState(false);

  // Edit User state
  const [editSaving, setEditSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/users/?${params.toString()}`);
      if (res.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
        if (data.currentUser) setCurrentUser(data.currentUser);
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to load users' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4500);
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      showToast('error', 'Username and password are required');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          status: newStatus,
          bio: newBio,
          permissions: newPermissions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || `User "${newUsername}" created successfully!`);
        setCreateModalOpen(false);
        setNewUsername('');
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('editor');
        setNewPermissions({ ...ROLE_PERMISSIONS_PRESETS.editor.permissions });
        setNewStatus('active');
        setNewBio('');
        fetchUsers();
      } else {
        showToast('error', data.error || 'Failed to create user');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setCreating(false);
    }
  };

  // Update User Handler
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editModalUser) return;

    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editModalUser._id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editModalUser.name,
          email: editModalUser.email,
          role: editModalUser.role,
          status: editModalUser.status,
          bio: editModalUser.bio,
          permissions: editModalUser.permissions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || `User updated successfully!`);
        setEditModalUser(null);
        fetchUsers();
      } else {
        showToast('error', data.error || 'Failed to update user');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // Toggle Status directly (Active <-> Suspended)
  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/admin/users/${user._id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          'success',
          `User "${user.username}" is now ${nextStatus === 'active' ? 'Active' : 'Suspended'}.`
        );
        fetchUsers();
      } else {
        showToast('error', data.error || 'Failed to change status');
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !resetPassValue.trim() || resetPassValue.trim().length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }

    setResettingPass(true);
    try {
      const res = await fetch(`/api/admin/users/${passwordModalUser._id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassValue.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Password for "${passwordModalUser.username}" changed successfully!`);
        setPasswordModalUser(null);
        setResetPassValue('');
      } else {
        showToast('error', data.error || 'Failed to change password');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setResettingPass(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteConfirmUser._id}/`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || `User deleted successfully!`);
        setDeleteConfirmUser(null);
        fetchUsers();
      } else {
        showToast('error', data.error || 'Failed to delete user');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Role Badges
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 inline-flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3" />
            <span>Super Admin</span>
          </span>
        );
      case 'admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </span>
        );
      case 'editor':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            <span>Editor</span>
          </span>
        );
      case 'author':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>Author</span>
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 inline-flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>Viewer</span>
          </span>
        );
    }
  };

  if (accessDenied) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You do not have administrative privileges to manage user accounts. Please contact your Super Administrator.
        </p>
        <div className="pt-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto pb-16">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-semibold animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/95 border-red-500/50 text-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>User Control &amp; Access</span>
                <span className="px-2 py-0.5 rounded-lg bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-xs font-bold">
                  {users.length} {users.length === 1 ? 'User' : 'Users'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage administrators, assign roles, configure editorial privileges, and handle user credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsers}
            title="Refresh List"
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setRoleMatrixModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-yellow-400/40 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
            title="View and manage role access details"
          >
            <Shield className="w-4 h-4 text-yellow-400" />
            <span>Role Access Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewRole('editor');
              setNewPermissions({ ...ROLE_PERMISSIONS_PRESETS.editor.permissions });
              setCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, full name, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 outline-none text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold text-[11px]">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 outline-none text-slate-200 font-semibold cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="author">Author</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-400 outline-none text-slate-200 font-semibold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* 4. USER DATA TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">User / Identity</th>
                <th className="p-4">Email</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Permissions</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-400" />
                    <span>Loading users from database...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-300">No users found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Try adjusting your search criteria or add a new user.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isYou =
                    currentUser &&
                    currentUser.username?.toLowerCase() === user.username?.toLowerCase();
                  const initials = (user.name || user.username || 'U')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-800/40 transition-colors group/tr"
                    >
                      {/* Name & Username */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border border-yellow-400/30 text-yellow-400 font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{user.name || user.username}</span>
                              {isYou && (
                                <span className="px-1.5 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 text-[10px] font-black uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4">
                        {user.email ? (
                          <a
                            href={`mailto:${user.email}`}
                            className="text-slate-300 hover:text-yellow-400 flex items-center gap-1 transition"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{user.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 italic">No email set</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="p-4">{renderRoleBadge(user.role)}</td>

                      {/* Permissions Pills */}
                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {user.permissions?.managePosts && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                              Posts
                            </span>
                          )}
                          {user.permissions?.managePlayers && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                              Players
                            </span>
                          )}
                          {user.permissions?.manageMatches && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                              Matches
                            </span>
                          )}
                          {user.permissions?.manageMedia && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                              Media
                            </span>
                          )}
                          {user.permissions?.manageRedirects && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-yellow-400 font-semibold">
                              Redirects
                            </span>
                          )}
                          {user.permissions?.manageUsers && (
                            <span className="px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 text-[10px] font-bold">
                              User Control
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {user.status === 'suspended' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="p-4 text-slate-400">
                        {user.lastLogin ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {new Date(user.lastLogin).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => setEditModalUser({ ...user })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Edit User Details & Permissions"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordModalUser(user);
                              setResetPassValue('');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-800 transition"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Toggle Suspend/Active Button */}
                          {!isYou && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded-lg transition ${
                                user.status === 'suspended'
                                  ? 'text-emerald-400 hover:bg-emerald-950/40'
                                  : 'text-amber-400 hover:bg-amber-950/40'
                              }`}
                              title={
                                user.status === 'suspended'
                                  ? 'Activate Account'
                                  : 'Suspend Account'
                              }
                            >
                              {user.status === 'suspended' ? (
                                <Unlock className="w-4 h-4" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Delete Button */}
                          {!isYou && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────── MODAL 1: CREATE NEW USER ──────── */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New User Account</h3>
                  <p className="text-xs text-slate-400">Add an administrator, editor, or author.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. suresh_raina"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Suresh Raina"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@superkingsden.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      const nextRole = e.target.value;
                      setNewRole(nextRole);
                      if (ROLE_PERMISSIONS_PRESETS[nextRole]) {
                        setNewPermissions({ ...ROLE_PERMISSIONS_PRESETS[nextRole].permissions });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 cursor-pointer"
                  >
                    <option value="editor">Editor (Create &amp; Publish Posts)</option>
                    <option value="author">Author (Draft Articles &amp; Upload Media)</option>
                    <option value="admin">Admin (Manage Content &amp; Squad)</option>
                    <option value="superadmin">Super Admin (Full Root Access)</option>
                    <option value="viewer">Viewer (Read-Only Analytics)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 cursor-pointer"
                  >
                    <option value="active">Active (Can Login)</option>
                    <option value="suspended">Suspended (Blocked)</option>
                  </select>
                </div>
              </div>

              {/* Granular Module Permissions with Role Auto-sync */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Module Access for {ROLE_PERMISSIONS_PRESETS[newRole]?.label || newRole}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (ROLE_PERMISSIONS_PRESETS[newRole]) {
                        setNewPermissions({ ...ROLE_PERMISSIONS_PRESETS[newRole].permissions });
                      }
                    }}
                    className="text-[10px] text-yellow-400 hover:underline cursor-pointer"
                  >
                    Reset to {ROLE_PERMISSIONS_PRESETS[newRole]?.label || 'Role'} Defaults
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PERMISSION_MODULES.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white cursor-pointer select-none transition-colors"
                      title={perm.desc}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(newPermissions[perm.key])}
                        onChange={(e) =>
                          setNewPermissions({
                            ...newPermissions,
                            [perm.key]: e.target.checked,
                          })
                        }
                        className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Author Bio</label>
                <textarea
                  rows={2}
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Short author biography displayed on blog post footers..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────── MODAL 2: EDIT USER DETAILS & PERMISSIONS ──────── */}
      {editModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setEditModalUser(null)}
        >
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Edit User: @{editModalUser.username}
                  </h3>
                  <p className="text-xs text-slate-400">Modify profile, roles, and granular privileges.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editModalUser.name || ''}
                    onChange={(e) =>
                      setEditModalUser({ ...editModalUser, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editModalUser.email || ''}
                    onChange={(e) =>
                      setEditModalUser({ ...editModalUser, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role</label>
                  <select
                    value={editModalUser.role || 'editor'}
                    onChange={(e) => {
                      const nextRole = e.target.value;
                      const defaults = ROLE_PERMISSIONS_PRESETS[nextRole]?.permissions || {};
                      setEditModalUser({
                        ...editModalUser,
                        role: nextRole,
                        permissions: { ...defaults },
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 cursor-pointer"
                  >
                    <option value="superadmin">Super Admin (Full Root Access)</option>
                    <option value="admin">Admin (Manage Content &amp; Squad)</option>
                    <option value="editor">Editor (Create &amp; Publish Posts)</option>
                    <option value="author">Author (Draft Articles &amp; Upload Media)</option>
                    <option value="viewer">Viewer (Read-Only Analytics)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={editModalUser.status || 'active'}
                    onChange={(e) =>
                      setEditModalUser({ ...editModalUser, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 cursor-pointer"
                  >
                    <option value="active">Active (Access Allowed)</option>
                    <option value="suspended">Suspended (Access Blocked)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Module Access for {ROLE_PERMISSIONS_PRESETS[editModalUser.role]?.label || editModalUser.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const defaults = ROLE_PERMISSIONS_PRESETS[editModalUser.role]?.permissions || {};
                      setEditModalUser({
                        ...editModalUser,
                        permissions: { ...defaults },
                      });
                    }}
                    className="text-[10px] text-yellow-400 hover:underline cursor-pointer"
                  >
                    Reset to {ROLE_PERMISSIONS_PRESETS[editModalUser.role]?.label || 'Role'} Defaults
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PERMISSION_MODULES.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white cursor-pointer select-none transition-colors"
                      title={perm.desc}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(editModalUser.permissions?.[perm.key])}
                        onChange={(e) =>
                          setEditModalUser({
                            ...editModalUser,
                            permissions: {
                              ...editModalUser.permissions,
                              [perm.key]: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Author Bio</label>
                <textarea
                  rows={2}
                  value={editModalUser.bio || ''}
                  onChange={(e) =>
                    setEditModalUser({ ...editModalUser, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black transition disabled:opacity-50"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────── MODAL 3: RESET PASSWORD ──────── */}
      {passwordModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPasswordModalUser(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset Password</h3>
                  <p className="text-xs text-slate-400">
                    For @{passwordModalUser.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  New Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={resetPassValue}
                  onChange={(e) => setResetPassValue(e.target.value)}
                  placeholder="Enter new strong password..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 font-mono text-sm"
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  The user will immediately need this new password to log in.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPass}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black transition disabled:opacity-50"
                >
                  {resettingPass ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────── MODAL 4: DELETE CONFIRMATION ──────── */}
      {deleteConfirmUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setDeleteConfirmUser(null)}
        >
          <div
            className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete User Account?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete{' '}
                <strong className="text-white">@{deleteConfirmUser.username}</strong>? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────── MODAL 5: ROLE ACCESS & PERMISSIONS DETAILS ──────── */}
      {roleMatrixModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setRoleMatrixModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Role Access &amp; Permissions Guide</span>
                    <span className="px-2 py-0.5 rounded-lg bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-[10px] font-bold">
                      Master Matrix
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kis role me kya-kya access hoga aur kaun se modules open rahenge.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleMatrixModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Role Cards Breakdown */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2.5">
                  1. Available System Roles &amp; Responsibilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {Object.values(ROLE_PERMISSIONS_PRESETS).map((r) => {
                    const isSelected = selectedMatrixRole === r.key;
                    return (
                      <div
                        key={r.key}
                        onClick={() => setSelectedMatrixRole(r.key)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 border-yellow-400/60 shadow-lg shadow-yellow-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${r.badgeColor}`}>
                            {r.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] text-yellow-400 font-bold">Selected</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                          {r.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Matrix Table */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2.5">
                  2. Detailed Permissions Breakdown By Role
                </span>
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="py-2.5 px-3.5">Module / Privilege</th>
                          <th className="py-2.5 px-2 text-center text-yellow-400">Super Admin</th>
                          <th className="py-2.5 px-2 text-center text-blue-400">Admin</th>
                          <th className="py-2.5 px-2 text-center text-emerald-400">Editor</th>
                          <th className="py-2.5 px-2 text-center text-purple-400">Author</th>
                          <th className="py-2.5 px-2 text-center text-slate-400">Viewer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {PERMISSION_MODULES.map((perm) => (
                          <tr key={perm.key} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-white text-xs">{perm.label}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{perm.desc}</div>
                            </td>
                            {['superadmin', 'admin', 'editor', 'author', 'viewer'].map((roleKey) => {
                              const allowed = Boolean(ROLE_PERMISSIONS_PRESETS[roleKey]?.permissions?.[perm.key]);
                              return (
                                <td key={roleKey} className="py-3 px-2 text-center">
                                  {allowed ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs" title="Access Allowed">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 text-red-400/50 font-bold text-xs" title="Access Blocked">
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Helpful Tip */}
              <div className="p-3.5 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-[11px] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-yellow-400 block mb-0.5">Custom Overrides Support:</strong>
                  Jab aap "Add New User" ya "Edit User" par click karte hain, toh Role change karne par ye permissions automatically pre-fill ho jati hain. Aap kisi bhi user ke liye individual checkboxes ko check ya uncheck karke custom permissions bhi de sakte hain.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <span className="text-[11px] text-slate-400">
                Logged in as <strong className="text-white capitalize">{currentUser?.username || 'Super Admin'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setRoleMatrixModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
