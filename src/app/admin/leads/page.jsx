'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  Phone,
  MessageSquare,
  User,
  Calendar,
  Globe,
  Plus,
  Send,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import { COUNTRY_DIAL_CODES } from '../../../data/countryCodes';

function getCountryFlagByPhone(phoneStr) {
  if (!phoneStr) return null;
  const cleaned = phoneStr.trim();
  return COUNTRY_DIAL_CODES.find((c) => cleaned.startsWith(c.code)) || null;
}

const STATUS_CONFIG = {
  new: {
    label: 'New Inquiry',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    icon: SparkleIcon,
  },
  contacted: {
    label: 'Contacted',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
    icon: Phone,
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
    icon: Clock,
  },
  resolved: {
    label: 'Resolved',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    icon: CheckCircle2,
  },
  archived: {
    label: 'Archived',
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-400',
    icon: Archive,
  },
};

function SparkleIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

const TOPIC_CONFIG = {
  general: { label: 'General Inquiry', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  editorial: { label: 'Editorial & News', color: 'bg-amber-950/60 text-amber-300 border-amber-700/50' },
  partnership: { label: 'Partnership / Ads', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50' },
  correction: { label: 'Content Correction', color: 'bg-orange-950/60 text-orange-300 border-orange-700/50' },
  technical: { label: 'Technical Bug', color: 'bg-rose-950/60 text-rose-300 border-rose-700/50' },
  other: { label: 'Other Topic', color: 'bg-slate-800 text-slate-400 border-slate-700' },
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    in_progress: 0,
    resolved: 0,
    archived: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals & Actions
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteConfirmLead, setDeleteConfirmLead] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('inquiryType', typeFilter);
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

      const res = await fetch(`/api/admin/leads/?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();

      setLeads(data.leads || []);
      if (data.counts) setCounts(data.counts);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Flash action message
  const showFlash = (msg, type = 'success') => {
    setActionMessage({ text: msg, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Status transition
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      const data = await res.json();

      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead((prev) => ({ ...prev, status: newStatus }));
      }
      showFlash(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      fetchLeads();
    } catch (err) {
      showFlash('Failed to update status', 'error');
    }
  };

  // Add internal note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedLead) return;
    try {
      setIsSavingNote(true);
      const res = await fetch(`/api/admin/leads/${selectedLead._id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNoteText.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      const data = await res.json();
      setSelectedLead(data.lead);
      setLeads((prev) =>
        prev.map((l) => (l._id === selectedLead._id ? data.lead : l))
      );
      setNewNoteText('');
      showFlash('Internal note logged to lead timeline');
    } catch (err) {
      showFlash('Failed to save note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Delete lead
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmLead) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/leads/${deleteConfirmLead._id}/`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete lead');

      setLeads((prev) => prev.filter((l) => l._id !== deleteConfirmLead._id));
      if (selectedLead && selectedLead._id === deleteConfirmLead._id) {
        setSelectedLead(null);
      }
      setDeleteConfirmLead(null);
      showFlash('Lead inquiry permanently deleted');
      fetchLeads();
    } catch (err) {
      showFlash('Failed to delete lead', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (leads.length === 0) {
      showFlash('No leads to export', 'error');
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Topic', 'Subject', 'Message', 'Status', 'Date', 'IP'];
    const rows = leads.map((l) => [
      `"${l._id}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${l.inquiryType || ''}"`,
      `"${(l.subject || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${l.status || ''}"`,
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${l.ip || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `superkingsden_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFlash(`Exported ${leads.length} leads as CSV`);
  };

  const statusTabs = [
    { key: 'all', label: 'All Inquiries', count: counts.total },
    { key: 'new', label: 'New', count: counts.new, color: 'text-amber-400' },
    { key: 'contacted', label: 'Contacted', count: counts.contacted, color: 'text-blue-400' },
    { key: 'in_progress', label: 'In Progress', count: counts.in_progress, color: 'text-purple-400' },
    { key: 'resolved', label: 'Resolved', count: counts.resolved, color: 'text-emerald-400' },
    { key: 'archived', label: 'Archived', count: counts.archived, color: 'text-slate-400' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Flash Alert Banner */}
      {actionMessage && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between animate-in fade-in duration-200 ${
            actionMessage.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-slate-950 shadow-lg shadow-yellow-500/10">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
                Leads &amp; Fan Inquiries
                {counts.new > 0 && (
                  <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                    {counts.new} New
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400">
                Capture, track, follow up, and manage fan correspondence and commercial leads submitted via the Contact Desk.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLeads()}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Leads</div>
          <div className="text-2xl font-black text-white mt-1">{counts.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" /> From Contact Us
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">🟡 New / Unread</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{counts.new}</div>
          <div className="text-[10px] text-amber-300/80 mt-0.5">Needs Response</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">🔵 Contacted</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{counts.contacted}</div>
          <div className="text-[10px] text-blue-300/80 mt-0.5">First Reply Sent</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300">🟣 In Progress</div>
          <div className="text-2xl font-black text-purple-400 mt-1">{counts.in_progress}</div>
          <div className="text-[10px] text-purple-300/80 mt-0.5">Under Review</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">🟢 Resolved</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{counts.resolved}</div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5">Successfully Closed</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">⚪ Archived</div>
          <div className="text-2xl font-black text-slate-400 mt-1">{counts.archived}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Stored For Record</div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by fan name, email, phone number, subject..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Inquiry Type Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-400/60"
          >
            <option value="all">All Inquiry Types</option>
            <option value="general">General Inquiry</option>
            <option value="editorial">Editorial &amp; News</option>
            <option value="partnership">Partnership &amp; Ads</option>
            <option value="correction">Content Correction</option>
            <option value="technical">Technical Bug</option>
            <option value="other">Other Topic</option>
          </select>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">Loading fan inquiries &amp; commercial leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3">
              <Inbox className="w-7 h-7 text-slate-500" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No leads found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              {debouncedSearch || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No inquiries match your current search and filter criteria. Try resetting filters.'
                : 'Your contact form inbox is currently clear. When fans or sponsors submit inquiries, they will appear here.'}
            </p>
            {(debouncedSearch || statusFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Topic &amp; Subject</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {leads.map((lead) => {
                  const statusInfo = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                  const topicInfo = TOPIC_CONFIG[lead.inquiryType] || TOPIC_CONFIG.other;
                  const formattedDate = new Date(lead.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={lead._id}
                      className={`hover:bg-slate-800/40 transition group ${
                        lead.status === 'new' ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Contact Info */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 shrink-0 text-xs">
                            {(lead.name || 'F').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{lead.name}</span>
                              {lead.status === 'new' && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              )}
                            </div>
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-slate-400 hover:text-amber-400 transition text-[11px] block truncate max-w-[180px]"
                              title={lead.email}
                            >
                              {lead.email}
                            </a>
                            {lead.phone && (() => {
                              const country = getCountryFlagByPhone(lead.phone);
                              return (
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="text-slate-400 hover:text-slate-200 transition text-[10px] inline-flex items-center gap-1.5 mt-0.5"
                                  title={`Call ${lead.phone}`}
                                >
                                  {country && (
                                    <span className="w-4 h-2.5 rounded-2xs overflow-hidden shrink-0 inline-block shadow-2xs border border-white/10">
                                      <img
                                        src={`/flags/${country.iso}.png`}
                                        alt={country.country}
                                        width={16}
                                        height={10}
                                        className="w-full h-full object-cover"
                                      />
                                    </span>
                                  )}
                                  <span>{lead.phone}</span>
                                </a>
                              );
                            })()}
                          </div>
                        </div>
                      </td>

                      {/* Topic & Subject */}
                      <td className="py-3.5 px-4 align-top max-w-[220px]">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mb-1 ${topicInfo.color}`}
                        >
                          {topicInfo.label}
                        </span>
                        <div className="font-semibold text-slate-200 line-clamp-1" title={lead.subject}>
                          {lead.subject}
                        </div>
                      </td>

                      {/* Message Snippet */}
                      <td className="py-3.5 px-4 align-top max-w-[260px]">
                        <p
                          onClick={() => setSelectedLead(lead)}
                          className="text-slate-400 line-clamp-2 cursor-pointer hover:text-slate-200 transition text-[11px]"
                          title="Click to view full message"
                        >
                          {lead.message}
                        </p>
                        {lead.notes && lead.notes.length > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-300/80">
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>{lead.notes.length} internal note{lead.notes.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${statusInfo.badge}`}
                        >
                          <option value="new" className="bg-slate-900 text-amber-300">🟡 New</option>
                          <option value="contacted" className="bg-slate-900 text-blue-300">🔵 Contacted</option>
                          <option value="in_progress" className="bg-slate-900 text-purple-300">🟣 In Progress</option>
                          <option value="resolved" className="bg-slate-900 text-emerald-300">🟢 Resolved</option>
                          <option value="archived" className="bg-slate-900 text-slate-400">⚪ Archived</option>
                        </select>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 align-top text-slate-400 text-[11px] whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View Full Inquiry Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmLead(lead)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
              <span className="font-bold text-white">{pagination.pages}</span> ({pagination.total} total)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail & Notes Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{selectedLead.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        STATUS_CONFIG[selectedLead.status]?.badge
                      }`}
                    >
                      {STATUS_CONFIG[selectedLead.status]?.label}
                    </span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-400" />
                      <a href={`mailto:${selectedLead.email}`} className="hover:underline">
                        {selectedLead.email}
                      </a>
                    </span>
                    {selectedLead.phone && (() => {
                      const country = getCountryFlagByPhone(selectedLead.phone);
                      return (
                        <span className="flex items-center gap-1.5">
                          {country ? (
                            <span className="w-4 h-2.5 rounded-2xs overflow-hidden shrink-0 inline-block shadow-2xs border border-white/10">
                              <img
                                src={`/flags/${country.iso}.png`}
                                alt={country.country}
                                width={16}
                                height={10}
                                className="w-full h-full object-cover"
                              />
                            </span>
                          ) : (
                            <Phone className="w-3 h-3 text-emerald-400" />
                          )}
                          <a href={`tel:${selectedLead.phone}`} className="hover:underline">
                            {selectedLead.phone}
                          </a>
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions (Email, Call, WhatsApp) */}
            <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-800">
              <a
                href={`mailto:${selectedLead.email}?subject=Re: ${encodeURIComponent(selectedLead.subject)}`}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Reply by Email</span>
              </a>
              {selectedLead.phone ? (
                <>
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Call Phone</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                </>
              ) : (
                <div className="col-span-2 py-2 text-center text-xs text-slate-500 italic">
                  No phone number provided
                </div>
              )}
            </div>

            {/* Inquiry Details Body */}
            <div className="space-y-4 py-4 max-h-[55vh] overflow-y-auto pr-1">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subject &amp; Topic
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      TOPIC_CONFIG[selectedLead.inquiryType]?.color
                    }`}
                  >
                    {TOPIC_CONFIG[selectedLead.inquiryType]?.label}
                  </span>
                  <h3 className="text-sm font-bold text-white">{selectedLead.subject}</h3>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Message
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-amber-400 selection:text-slate-950">
                  {selectedLead.message}
                </div>
              </div>

              {/* Status Changer */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Change Status:</span>
                <div className="flex items-center gap-1.5">
                  {['new', 'contacted', 'in_progress', 'resolved', 'archived'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedLead._id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition capitalize ${
                        selectedLead.status === st
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes Thread */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Internal Admin Notes &amp; Follow-up History</span>
                </div>

                {selectedLead.notes && selectedLead.notes.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {selectedLead.notes.map((note, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                        <div className="text-slate-200">{note.text}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mb-3">
                    No notes logged yet. Use the box below to log team notes, follow-up dates, or call outcomes.
                  </p>
                )}

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add an internal follow-up note (e.g. 'Sent sponsorship deck via email')..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={isSavingNote || !newNoteText.trim()}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Note</span>
                  </button>
                </form>
              </div>

              {/* Audit Metadata */}
              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex flex-wrap gap-4">
                <span>Created: {new Date(selectedLead.createdAt).toLocaleString()}</span>
                {selectedLead.ip && <span>IP: {selectedLead.ip}</span>}
                {selectedLead.source && <span>Source: {selectedLead.source}</span>}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setDeleteConfirmLead(selectedLead);
                  setSelectedLead(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Delete Lead Inquiry?</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to permanently delete the inquiry from{' '}
              <strong className="text-white">{deleteConfirmLead.name}</strong> ({deleteConfirmLead.email})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmLead(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
