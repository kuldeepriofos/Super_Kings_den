'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
  Send,
  Building2,
  Sparkles,
  HelpCircle,
  Shield,
  FileText,
} from 'lucide-react';
import defaultSettings from '../../../data/defaultSiteSettings.json';
import { useApp } from '../../../context/AppContext';

export default function AdminSettingsPage() {
  const { setSiteSettings } = useApp() || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'social' | 'office' | 'brand'
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState(defaultSettings);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch current settings
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings/');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        if (data.settings) {
          setFormData({
            ...defaultSettings,
            ...data.settings,
            social: { ...defaultSettings.social, ...(data.settings.social || {}) },
            franchiseContacts: { ...defaultSettings.franchiseContacts, ...(data.settings.franchiseContacts || {}) },
            footer: { ...defaultSettings.footer, ...(data.settings.footer || {}) },
          });
        }
      } catch (err) {
        showToast('error', 'Could not load existing settings, loaded defaults');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }
      showToast('success', 'Contact details & social channels updated successfully!');
      if (setSiteSettings) {
        setSiteSettings(data.settings);
      }
    } catch (err) {
      showToast('error', err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all contact details and social links back to Super Kings Den defaults?')) {
      setFormData(defaultSettings);
      showToast('info', 'Reset to defaults. Remember to click "Save Changes".');
    }
  };

  if (loading) {
    return (
      <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Loading Site Contact &amp; Social Settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/50 text-rose-200'
              : toast.type === 'info'
              ? 'bg-blue-950/95 border-blue-500/50 text-blue-200'
              : 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/10">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display tracking-tight">
                Site Contact &amp; Social Channels
              </h1>
              <p className="text-xs text-slate-400">
                Manage all official emails, phone numbers, WhatsApp, physical HQ address, and social links displayed across the portal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form (8 cols) + Live Preview (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tabbed Form Inputs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
            {[
              { id: 'contact', label: 'Official Email', icon: Mail },
              { id: 'office', label: 'Phone & Physical HQ', icon: Building2 },
              { id: 'social', label: 'Social Channels', icon: Share2 },
              { id: 'brand', label: 'Brand & Footer', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* ─── TAB 1: OFFICIAL CONTACT EMAIL ─── */}
            {activeTab === 'contact' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Official Contact Email</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter your single official email address. This email will appear across the entire portal (Contact Us page, website footer, and for fan inquiries).
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>Official Email Address <span className="text-amber-500">*</span></span>
                      <span className="text-[10px] text-slate-500 font-normal">Active across website</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={formData.email || formData.primaryEmail || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                            primaryEmail: e.target.value,
                            editorialEmail: e.target.value,
                            partnershipsEmail: e.target.value,
                            supportEmail: e.target.value,
                          })
                        }
                        placeholder="e.g. contact@superkingsden.com or your-email@gmail.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-700/80 focus:border-amber-400 text-white placeholder-slate-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Only this single email address is required. All visitor messages and public contact details on the portal will point directly to this email.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 2: PHONE & OFFICE HQ ─── */}
            {activeTab === 'office' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Phone Numbers &amp; Headquarters</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Physical location, operating desk hours, and direct calling / WhatsApp channels.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Primary Contact Phone</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:border-amber-400 text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Official WhatsApp Number</span>
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:border-amber-400 text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editorial HQ &amp; Physical Address</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Chepauk Media Enclave, Chennai, Tamil Nadu 600005, India"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:border-amber-400 text-white placeholder-slate-500 outline-none transition"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Rendered on Contact Us page sidebar card.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Desk Operating Hours</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deskHours}
                    onChange={(e) => setFormData({ ...formData, deskHours: e.target.value })}
                    placeholder="Mon - Sat, 9:00 AM - 7:00 PM IST"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:border-amber-400 text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 3: SOCIAL MEDIA CHANNELS ─── */}
            {activeTab === 'social' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Official Social Media Channels</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    These links power the top navigation bar, footer brand links, and sharing dialogs across all pages.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* X (Twitter) */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black border border-slate-700 flex items-center justify-center text-white shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-bold text-slate-300 mb-0.5">X (formerly Twitter)</label>
                      <input
                        type="url"
                        value={formData.social?.twitter || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            social: { ...formData.social, twitter: e.target.value },
                          })
                        }
                        placeholder="https://x.com/superkingsden"
                        className="w-full text-xs bg-transparent border-0 outline-none text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                    {formData.social?.twitter && (
                      <a
                        href={formData.social.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                    >
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-bold text-slate-300 mb-0.5">Instagram</label>
                      <input
                        type="url"
                        value={formData.social?.instagram || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            social: { ...formData.social, instagram: e.target.value },
                          })
                        }
                        placeholder="https://www.instagram.com/superkingsden/"
                        className="w-full text-xs bg-transparent border-0 outline-none text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                    {formData.social?.instagram && (
                      <a
                        href={formData.social.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* YouTube */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-bold text-slate-300 mb-0.5">YouTube</label>
                      <input
                        type="url"
                        value={formData.social?.youtube || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            social: { ...formData.social, youtube: e.target.value },
                          })
                        }
                        placeholder="https://www.youtube.com/@SuperKingsDen"
                        className="w-full text-xs bg-transparent border-0 outline-none text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                    {formData.social?.youtube && (
                      <a
                        href={formData.social.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Facebook */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Facebook className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-bold text-slate-300 mb-0.5">Facebook</label>
                      <input
                        type="url"
                        value={formData.social?.facebook || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            social: { ...formData.social, facebook: e.target.value },
                          })
                        }
                        placeholder="https://www.facebook.com/people/Super-Kings-Den/61561343112284/"
                        className="w-full text-xs bg-transparent border-0 outline-none text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                    {formData.social?.facebook && (
                      <a
                        href={formData.social.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* WhatsApp Community / Channel Link */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-bold text-slate-300 mb-0.5">WhatsApp Direct Chat / Group Link</label>
                      <input
                        type="url"
                        value={formData.social?.whatsapp || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            social: { ...formData.social, whatsapp: e.target.value },
                          })
                        }
                        placeholder="https://wa.me/919876543210"
                        className="w-full text-xs bg-transparent border-0 outline-none text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                    {formData.social?.whatsapp && (
                      <a
                        href={formData.social.whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Telegram (Optional) */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#229ED9] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-bold text-slate-300 mb-0.5">Telegram Channel (Optional)</label>
                      <input
                        type="url"
                        value={formData.social?.telegram || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            social: { ...formData.social, telegram: e.target.value },
                          })
                        }
                        placeholder="https://t.me/superkingsden"
                        className="w-full text-xs bg-transparent border-0 outline-none text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 4: BRAND & FOOTER ─── */}
            {activeTab === 'brand' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Brand Name &amp; Footer Text</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls brand name, slogan, and the description paragraphs shown in the global footer.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Portal Title</label>
                    <input
                      type="text"
                      value={formData.siteName}
                      onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Portal Tagline</label>
                    <input
                      type="text"
                      value={formData.siteTagline}
                      onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Footer Description Blurb</label>
                  <textarea
                    rows={3}
                    value={formData.footer?.aboutText || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, aboutText: e.target.value },
                      })
                    }
                    className="w-full p-3.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Copyright Statement</label>
                  <input
                    type="text"
                    value={formData.footer?.copyrightText || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, copyrightText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Bottom Save Button Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview Widget (4 cols) */}
        <div className="lg:col-span-4 space-y-5 sticky top-24">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Website Preview</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Auto-Synced
              </span>
            </div>

            {/* Preview 1: Contact Desk Sidebar Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Contact Desk Card (Frontend)
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Editorial Desk &amp; HQ</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {formData.address || 'Address goes here'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-900 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Official Email:</span>
                  <span className="font-bold text-amber-400 truncate max-w-[170px]" title={formData.email || formData.primaryEmail}>
                    {formData.email || formData.primaryEmail || 'contact@superkingsden.com'}
                  </span>
                </div>
                {formData.phone && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Phone:</span>
                    <span className="font-bold text-slate-200">{formData.phone}</span>
                  </div>
                )}
                {formData.deskHours && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Hours:</span>
                    <span className="text-slate-300 text-[10px]">{formData.deskHours}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Preview 2: Navbar Top Strip Social Buttons */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Top Strip Social Icons</span>
                <span className="text-[10px] text-slate-500">Live Navbar</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {formData.social?.twitter && (
                  <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center text-white shadow-sm" title="X">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                )}
                {formData.social?.instagram && (
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-white shadow-sm" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }} title="Instagram">
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                )}
                {formData.social?.youtube && (
                  <div className="w-7 h-7 rounded-md bg-[#FF0000] flex items-center justify-center text-white shadow-sm" title="YouTube">
                    <Youtube className="w-3.5 h-3.5" />
                  </div>
                )}
                {formData.social?.facebook && (
                  <div className="w-7 h-7 rounded-md bg-[#1877F2] flex items-center justify-center text-white shadow-sm" title="Facebook">
                    <Facebook className="w-3.5 h-3.5" />
                  </div>
                )}
                {formData.social?.whatsapp && (
                  <div className="w-7 h-7 rounded-md bg-[#25D366] flex items-center justify-center text-white shadow-sm" title="WhatsApp">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
              💡 <strong>Instant Reflection:</strong> Any updates made here instantly propagate to the live website header, footer, contact page cards, and WhatsApp quick connect without rebuilding.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
