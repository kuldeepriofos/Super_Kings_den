'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
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
  Save,
  RotateCcw,
  Settings2,
} from 'lucide-react';

export const ACCESS_MODULE_GROUPS = [
  {
    id: 'master',
    title: 'MASTER / CONTENT & CMS',
    items: [
      { id: 'articles', label: 'Articles CMS', actions: ['view', 'edit', 'delete'] },
      { id: 'categories', label: 'Categories Master', actions: ['view', 'edit', 'delete'] },
      { id: 'pages', label: 'Pages Master', actions: ['view', 'edit', 'delete'] },
      { id: 'media', label: 'Media Library', actions: ['view', 'edit', 'delete'] },
    ],
  },
  {
    id: 'cricket',
    title: 'CRICKET & SQUAD',
    items: [
      { id: 'players', label: 'Players & Squad Master', actions: ['view', 'edit', 'delete'] },
      { id: 'matches', label: 'Match Center & Fixtures', actions: ['view', 'edit', 'delete'] },
      { id: 'standings', label: 'Standings & Points Table', actions: ['view', 'edit', 'delete'] },
      { id: 'stats', label: 'Franchise Stats & Records', actions: ['view', 'edit', 'delete'] },
    ],
  },
  {
    id: 'crm',
    title: 'CRM & FAN DESK',
    items: [
      { id: 'leads', label: 'Fan Inquiries & Leads', actions: ['view', 'edit', 'delete'] },
      { id: 'contact', label: 'Contact Info & Desk Hours', actions: ['view', 'edit'] },
      { id: 'social', label: 'Social Media Links', actions: ['view', 'edit'] },
    ],
  },
  {
    id: 'system',
    title: 'SYSTEM & ACCESS CONTROL',
    items: [
      { id: 'users', label: 'User Master & Credentials', actions: ['view', 'edit', 'delete'] },
      { id: 'redirects', label: '301/302 SEO Redirects', actions: ['view', 'edit', 'delete'] },
      { id: 'code', label: 'Header & Footer Custom Code', actions: ['view', 'edit'] },
      { id: 'dashboard', label: 'Overview & Analytics Dashboard', actions: ['view'] },
    ],
  },
];

export const PERMISSION_MODULES = [
  {
    key: 'managePosts',
    label: 'Articles & Content',
    icon: FileText,
    desc: 'Create, edit, draft & publish articles, news and categories',
  },
  {
    key: 'managePlayers',
    label: 'Squad & Players',
    icon: Users,
    desc: 'Add team roster, player profiles, stats & franchise legends',
  },
  {
    key: 'manageMatches',
    label: 'Match Center',
    icon: Calendar,
    desc: 'Schedule fixtures, update live match scores & tournament standings',
  },
  {
    key: 'manageMedia',
    label: 'Media Library',
    icon: ImageIcon,
    desc: 'Upload, delete & organize match photos, team media and assets',
  },
  {
    key: 'manageRedirects',
    label: '301/302 Redirects',
    icon: ArrowRightLeft,
    desc: 'Manage SEO redirect rules, old URL aliases & link mapping',
  },
  {
    key: 'manageUsers',
    label: 'User Control',
    icon: UserCheck,
    desc: 'Manage user accounts, assign roles & configure role permissions',
  },
];

export const DEFAULT_ROLE_PRESETS = {
  superadmin: {
    role: 'superadmin',
    label: 'Super Admin',
    badgeColor: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    description: 'Full unrestricted root access to all modules, backups, settings & user management.',
    isSystem: true,
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
    role: 'admin',
    label: 'Admin',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: 'Manage all website content, squad, match center, media, and redirects.',
    isSystem: false,
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
    role: 'editor',
    label: 'Editor',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Create, publish & update articles, players, match center fixtures, and media.',
    isSystem: false,
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
    role: 'author',
    label: 'Author',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'Write, draft & manage blog articles and upload media. Listed in author dropdown.',
    isSystem: false,
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
    role: 'viewer',
    label: 'Viewer',
    badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    description: 'Read-only analytics and overview monitoring. No edit or publish permissions.',
    isSystem: false,
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

/**
 * Generate default granular permissions according to role
 */
export function generateGranularPresetsForRole(roleKey) {
  const perms = {};
  const isSuper = roleKey === 'superadmin';
  const isAdmin = roleKey === 'admin' || isSuper;
  const isEditor = roleKey === 'editor' || isAdmin;
  const isAuthor = roleKey === 'author';

  ACCESS_MODULE_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      item.actions.forEach((action) => {
        const key = `${item.id}_${action}`;
        if (isSuper) {
          perms[key] = true;
        } else if (isAdmin) {
          if (item.id === 'users' && (action === 'edit' || action === 'delete')) {
            perms[key] = false;
          } else {
            perms[key] = true;
          }
        } else if (isEditor) {
          if (['articles', 'categories', 'pages', 'media', 'players', 'matches', 'standings', 'stats'].includes(item.id)) {
            perms[key] = true;
          } else if (action === 'view') {
            perms[key] = true;
          } else {
            perms[key] = false;
          }
        } else if (isAuthor) {
          if (['articles', 'media'].includes(item.id)) {
            perms[key] = action === 'view' || action === 'edit';
          } else if (action === 'view') {
            perms[key] = true;
          } else {
            perms[key] = false;
          }
        } else {
          // viewer: view only
          perms[key] = action === 'view';
        }
      });
    });
  });

  return perms;
}

export default function AdminUsersMasterPage() {
  // Navigation tab: 'users' or 'roles'
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Roles & Permissions state
  const [roles, setRoles] = useState(Object.values(DEFAULT_ROLE_PRESETS));
  const [rolesLoading, setRolesLoading] = useState(false);
  const [editableRoles, setEditableRoles] = useState({});
  const [savingRoleKey, setSavingRoleKey] = useState(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  // ──────── MANAGE ACCESS FOR USER MODAL (POPUP) ────────
  const [accessModalUser, setAccessModalUser] = useState(null);
  const [userAccessPerms, setUserAccessPerms] = useState({});
  const [savingAccess, setSavingAccess] = useState(false);

  // Form states for Create User
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('editor');
  const [newStatus, setNewStatus] = useState('active');
  const [newBio, setNewBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Password Reset state
  const [resetPassValue, setResetPassValue] = useState('');
  const [resettingPass, setResettingPass] = useState(false);

  // Edit User state
  const [editSaving, setEditSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4500);
  };

  // Fetch users from /api/admin/users
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
        if (data.currentUser) setCurrentUser(data.currentUser);
      } else {
        showToast('error', data.error || 'Failed to load users');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles from /api/admin/roles
  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (data.success && Array.isArray(data.roles)) {
        setRoles(data.roles);
        const initialEditable = {};
        for (const r of data.roles) {
          initialEditable[r.role] = { ...r.permissions };
        }
        setEditableRoles(initialEditable);
      }
    } catch (err) {
      console.warn('Failed to load roles from API:', err.message);
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [roleFilter, statusFilter]);

  // Debounced search for users
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Open Manage Access Modal for a specific user
  const handleOpenAccessModal = (user) => {
    setAccessModalUser(user);
    const defaults = generateGranularPresetsForRole(user.role || 'editor');
    const existing = user.permissions || {};
    setUserAccessPerms({
      ...defaults,
      ...existing,
    });
  };

  // Toggle single granular permission
  const handleToggleSinglePerm = (permKey) => {
    setUserAccessPerms((prev) => ({
      ...prev,
      [permKey]: !prev[permKey],
    }));
  };

  // Toggle group Select All
  const handleToggleGroupSelectAll = (group) => {
    const allGroupKeys = group.items.flatMap((item) =>
      item.actions.map((act) => `${item.id}_${act}`)
    );
    const allChecked = allGroupKeys.every((k) => Boolean(userAccessPerms[k]));
    const nextVal = !allChecked;

    setUserAccessPerms((prev) => {
      const updated = { ...prev };
      allGroupKeys.forEach((k) => {
        updated[k] = nextVal;
      });
      return updated;
    });
  };

  // Apply role preset inside access modal
  const handleApplyRolePreset = (roleKey) => {
    const presetPerms = generateGranularPresetsForRole(roleKey);
    setUserAccessPerms(presetPerms);
    showToast('info', `Applied "${roleKey.toUpperCase()}" permissions preset. Click "Save Access" to apply.`);
  };

  // Save granular access for user
  const handleSaveAccess = async () => {
    if (!accessModalUser) return;
    setSavingAccess(true);

    try {
      const res = await fetch(`/api/admin/users/${accessModalUser._id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: userAccessPerms,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          'success',
          `Access permissions for "${accessModalUser.name || accessModalUser.username}" saved successfully!`
        );
        setAccessModalUser(null);
        fetchUsers();
      } else {
        showToast('error', data.error || 'Failed to save access permissions');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSavingAccess(false);
    }
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || `User "${newUsername}" created with role "${newRole}"!`);
        setCreateModalOpen(false);
        setNewUsername('');
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('editor');
        setNewStatus('active');
        setNewBio('');
        fetchUsers();
        fetchRoles();
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || `User updated with role "${editModalUser.role}"!`);
        setEditModalUser(null);
        fetchUsers();
        fetchRoles();
      } else {
        showToast('error', data.error || 'Failed to update user');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // Toggle user account status
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
        fetchRoles();
      } else {
        showToast('error', data.error || 'Failed to delete user');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Toggle permission checkmark for a role in Role Editor
  const handleToggleRolePermission = (roleKey, permKey) => {
    if (roleKey === 'superadmin') return;
    setEditableRoles((prev) => {
      const rolePerms = prev[roleKey] || {};
      return {
        ...prev,
        [roleKey]: {
          ...rolePerms,
          [permKey]: !rolePerms[permKey],
        },
      };
    });
  };

  // Save role permissions via PUT /api/admin/roles
  const handleSaveRolePermissions = async (roleKey) => {
    if (roleKey === 'superadmin') return;
    const permissionsToSave = editableRoles[roleKey];
    if (!permissionsToSave) return;

    setSavingRoleKey(roleKey);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: roleKey,
          permissions: permissionsToSave,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || `Permissions for "${roleKey}" saved! All assigned users updated.`);
        fetchRoles();
        fetchUsers();
      } else {
        showToast('error', data.error || 'Failed to save role permissions');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSavingRoleKey(null);
    }
  };

  // Reset role permissions back to system defaults
  const handleResetRoleDefaults = (roleKey) => {
    const defaultDef = DEFAULT_ROLE_PRESETS[roleKey];
    if (!defaultDef) return;
    setEditableRoles((prev) => ({
      ...prev,
      [roleKey]: { ...defaultDef.permissions },
    }));
    showToast('info', `Reset ${defaultDef.label} checkmarks to defaults. Click "Save Rights" to apply.`);
  };

  // Render role badge helper
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
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1">
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
              : actionMessage.type === 'info'
              ? 'bg-blue-950/95 border-blue-500/50 text-blue-200'
              : 'bg-red-950/95 border-red-500/50 text-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : actionMessage.type === 'info' ? (
            <Info className="w-5 h-5 text-blue-400" />
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

      {/* 1. TOP HEADER & NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Role &amp; User Control</span>
                <span className="px-2 py-0.5 rounded-lg bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-xs font-bold">
                  {users.length} {users.length === 1 ? 'User' : 'Users'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Roles define module rights with simple checkmarks; users simply inherit their assigned role&apos;s access.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users Directory</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Role Permissions Editor</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchUsers();
              fetchRoles();
            }}
            title="Refresh Data"
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading || rolesLoading ? 'animate-spin text-yellow-400' : ''}`} />
          </button>

          {activeTab === 'users' && (
            <button
              type="button"
              onClick={() => {
                setNewRole('editor');
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New User</span>
            </button>
          )}
        </div>
      </div>

      {/* ──────── TAB 2: ROLE PERMISSIONS EDITOR ──────── */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-yellow-400 block mb-0.5">Role-Based Access Control (RBAC):</strong>
              Yahan aap har Role ke rights par checkmarks set kar sakte hain. Jab aap kisi user ko ye Role assign karenge, toh us user ko wahi rights milenge. Kisi specific user ko custom access dena ho toh Users Directory me &quot;Manage Access&quot; popup se kar sakte hain!
            </div>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {roles.map((roleDef) => {
              const roleKey = roleDef.role;
              const isSuper = roleKey === 'superadmin';
              const currentPerms = editableRoles[roleKey] || roleDef.permissions || {};
              const userCount = users.filter((u) => u.role === roleKey).length;
              const isSaving = savingRoleKey === roleKey;

              return (
                <div
                  key={roleKey}
                  className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                    isSuper
                      ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-yellow-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Role Header */}
                  <div className="p-5 border-b border-slate-800/80 bg-slate-950/50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                              roleDef.badgeColor || DEFAULT_ROLE_PRESETS[roleKey]?.badgeColor
                            }`}
                          >
                            {roleDef.label || DEFAULT_ROLE_PRESETS[roleKey]?.label}
                          </span>
                          {isSuper && (
                            <span className="px-2 py-0.5 rounded-lg bg-yellow-400/20 text-yellow-300 text-[10px] font-bold">
                              Root System Role
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {roleDef.description || DEFAULT_ROLE_PRESETS[roleKey]?.description}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-bold flex-shrink-0">
                        {userCount} {userCount === 1 ? 'User' : 'Users'} Assigned
                      </span>
                    </div>
                  </div>

                  {/* Permissions Checkmarks List */}
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                      Module Access Rights (Toggle Checkmarks):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PERMISSION_MODULES.map((mod) => {
                        const Icon = mod.icon;
                        const isChecked = isSuper ? true : Boolean(currentPerms[mod.key]);

                        return (
                          <div
                            key={mod.key}
                            onClick={() => !isSuper && handleToggleRolePermission(roleKey, mod.key)}
                            className={`p-3 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                              isSuper
                                ? 'bg-yellow-400/5 border-yellow-400/20 opacity-80 cursor-not-allowed'
                                : isChecked
                                ? 'bg-slate-950 border-emerald-500/40 hover:border-emerald-400/60 cursor-pointer shadow-sm'
                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 cursor-pointer'
                            }`}
                          >
                            {/* Custom Checkbox Pill */}
                            <div
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                isChecked
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                  : 'border-slate-700 bg-slate-900 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-yellow-400' : 'text-slate-500'}`} />
                                <span className={`text-xs font-bold truncate ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                                  {mod.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                                {mod.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Role Card Footer */}
                  <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
                    {isSuper ? (
                      <span className="text-[11px] text-yellow-400/80 font-medium">
                        All privileges locked on Super Admin for system security.
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleResetRoleDefaults(roleKey)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Defaults</span>
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSaveRolePermissions(roleKey)}
                          className="px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-md shadow-yellow-400/10"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Saving...' : `Save ${roleDef.label} Rights`}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────── TAB 1: USERS DIRECTORY ──────── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
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

          {/* USER DATA TABLE */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">User / Identity</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Access Rights</th>
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

                      // Resolve permissions from role
                      const roleDef = roles.find((r) => r.role === user.role);
                      const userPerms = roleDef?.permissions || user.permissions || {};

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

                          {/* Assigned Role */}
                          <td className="p-4">{renderRoleBadge(user.role)}</td>

                          {/* Role Privileges with Quick Access Popup Button */}
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleOpenAccessModal(user)}
                              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-yellow-400/50 border border-slate-700 text-slate-200 text-[11px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm group/btn"
                              title="Click to view & customize granular access permissions for this user"
                            >
                              <Shield className="w-3.5 h-3.5 text-yellow-400 group-hover/btn:scale-110 transition-transform" />
                              <span>Manage Access</span>
                            </button>
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
                              {/* Manage Access Popup Icon */}
                              <button
                                type="button"
                                onClick={() => handleOpenAccessModal(user)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-800 transition cursor-pointer"
                                title="Manage Access (View/Edit/Delete Matrix)"
                              >
                                <Settings2 className="w-4 h-4" />
                              </button>

                              {/* Edit User Button */}
                              <button
                                type="button"
                                onClick={() => setEditModalUser({ ...user })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                                title="Edit User Role & Profile"
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
                                className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-slate-800 transition cursor-pointer"
                                title="Reset Password"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Toggle Suspend/Active Button */}
                              {!isYou && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(user)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
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
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
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
        </div>
      )}

      {/* ──────── POPUP MODAL: MANAGE ACCESS FOR USER (MATCHING USER SCREENSHOT) ──────── */}
      {accessModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setAccessModalUser(null)}
        >
          <div
            className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Manage Access for {accessModalUser.name || accessModalUser.username}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={savingAccess}
                  onClick={handleSaveAccess}
                  className="px-5 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {savingAccess ? 'Saving Access...' : 'Save Access'}
                </button>
                <button
                  type="button"
                  onClick={() => setAccessModalUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Presets Subheader */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Quick Preset:</span>
                {['superadmin', 'admin', 'editor', 'author', 'viewer'].map((roleKey) => (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleApplyRolePreset(roleKey)}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-semibold text-[11px] capitalize transition cursor-pointer shadow-2xs"
                  >
                    {roleKey}
                  </button>
                ))}
              </div>
              <span className="text-slate-400 text-[11px]">
                Role: <strong className="text-slate-800 capitalize">{accessModalUser.role}</strong>
              </span>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs bg-slate-50/50">
              {ACCESS_MODULE_GROUPS.map((group) => {
                const allGroupKeys = group.items.flatMap((item) =>
                  item.actions.map((act) => `${item.id}_${act}`)
                );
                const isAllSelected = allGroupKeys.every((k) => Boolean(userAccessPerms[k]));
                const isSomeSelected = !isAllSelected && allGroupKeys.some((k) => Boolean(userAccessPerms[k]));

                return (
                  <div
                    key={group.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                  >
                    {/* Category Header */}
                    <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        {group.title}
                      </span>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isSomeSelected;
                          }}
                          onChange={() => handleToggleGroupSelectAll(group)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-600 hover:text-slate-900">
                          Select All
                        </span>
                      </label>
                    </div>

                    {/* Category Item Rows */}
                    <div className="divide-y divide-slate-100">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 transition-colors"
                        >
                          <span className="text-xs font-semibold text-slate-800">
                            {item.label}
                          </span>

                          {/* Action Checkboxes (View, Edit, Delete) */}
                          <div className="flex items-center gap-6 sm:min-w-[220px] justify-start sm:justify-end">
                            {['view', 'edit', 'delete'].map((action) => {
                              const applies = item.actions.includes(action);
                              if (!applies) {
                                return (
                                  <div
                                    key={action}
                                    className="hidden sm:block w-14"
                                  />
                                );
                              }
                              const permKey = `${item.id}_${action}`;
                              const isChecked = Boolean(userAccessPerms[permKey]);

                              return (
                                <label
                                  key={action}
                                  className="flex items-center gap-1.5 cursor-pointer select-none group/check"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleSinglePerm(permKey)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span
                                    className={`text-xs capitalize font-medium ${
                                      isChecked ? 'text-slate-900 font-bold' : 'text-slate-500'
                                    }`}
                                  >
                                    {action}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-white">
              <span className="text-xs text-slate-500 font-medium">
                Changes take effect immediately upon saving.
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setAccessModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingAccess}
                  onClick={handleSaveAccess}
                  className="px-5 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {savingAccess ? 'Saving...' : 'Save Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────── MODAL 1: CREATE NEW USER ──────── */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New User</h3>
                  <p className="text-xs text-slate-400">Assign a role; permissions are inherited automatically.</p>
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
                  <label className="block text-slate-300 font-bold mb-1">
                    Assign Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 cursor-pointer font-bold"
                  >
                    <option value="editor">Editor</option>
                    <option value="author">Author</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Account Status</label>
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

              {/* Informative Box: Privileges inherited from the selected role */}
              {(() => {
                const selectedRoleDef = roles.find((r) => r.role === newRole) || DEFAULT_ROLE_PRESETS[newRole];
                const activePerms = editableRoles[newRole] || selectedRoleDef?.permissions || {};

                return (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                          Rights inherited from &ldquo;{selectedRoleDef?.label || newRole}&rdquo;
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Configured in Role Editor
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {PERMISSION_MODULES.map((perm) => {
                        const allowed = newRole === 'superadmin' ? true : Boolean(activePerms[perm.key]);
                        return (
                          <span
                            key={perm.key}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                              allowed
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            <span>{allowed ? '✓' : '—'}</span>
                            <span>{perm.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Author Bio (Optional)</label>
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
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black transition disabled:opacity-50 cursor-pointer shadow-md shadow-yellow-400/10"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────── MODAL 2: EDIT USER ROLE & PROFILE ──────── */}
      {editModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setEditModalUser(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
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
                  <p className="text-xs text-slate-400">Re-assign role or update account profile.</p>
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
                  <label className="block text-slate-300 font-bold mb-1">
                    Assign Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editModalUser.role || 'editor'}
                    onChange={(e) =>
                      setEditModalUser({
                        ...editModalUser,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-yellow-400 cursor-pointer font-bold"
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="author">Author</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Account Status</label>
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

              {/* Quick shortcut to open Manage Access modal */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Granular Access Matrix</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Configure View / Edit / Delete rights per module for this user.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const target = { ...editModalUser };
                    setEditModalUser(null);
                    handleOpenAccessModal(target);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Manage Access &rarr;
                </button>
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
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black transition disabled:opacity-50 cursor-pointer shadow-md shadow-yellow-400/10"
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
                  placeholder="Enter new password (min 6 chars)..."
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
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPass}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black transition disabled:opacity-50 cursor-pointer shadow-md shadow-yellow-400/10"
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
