'use client';

import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  HelpCircle, 
  MessageSquare, 
  Loader2, 
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { COUNTRY_DIAL_CODES } from '../data/countryCodes';
import CountryCodeSelector from './CountryCodeSelector';
import { useApp } from '../context/AppContext';

export default function ContactForm({ initialSettings }) {
  const context = useApp ? useApp() : {};
  const siteSettings = initialSettings || context.siteSettings || {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    subject: '',
    message: '',
    website_url: '', // Honeypot spam trap
  });

  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_DIAL_CODES[0] || { code: '+91', country: 'India', iso: 'in', placeholder: '98765 43210' }
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inquiryTypes = [
    { value: 'general', label: 'General Fan Inquiry' },
    { value: 'editorial', label: 'Breaking News / Editorial Tip' },
    { value: 'partnership', label: 'Brand Partnership / Sponsor' },
    { value: 'correction', label: 'Score or Stat Correction' },
    { value: 'technical', label: 'Website / App Technical Issue' },
    { value: 'other', label: 'Other Request' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side quick check
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage('Please write a message of at least 10 characters.');
      return;
    }

    setLoading(true);

    const fullPhone = phoneNumber.trim() ? `${selectedCountry.code} ${phoneNumber.trim()}` : '';
    const payload = {
      ...formData,
      phone: fullPhone,
    };

    try {
      const res = await fetch('/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setSubmitted(true);
      setPhoneNumber('');
      setSelectedCountry(COUNTRY_DIAL_CODES[0]);
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'general',
        subject: '',
        message: '',
        website_url: '',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ─── Contact Form Card (7 Cols) ─── */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-700 dark:text-csk-yellow mb-2 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-csk-yellow" />
          <span>Direct Contact Desk &bull; We Reply Within 24h</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display mb-2">
          Send Us a Message
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          Whether you have breaking Super Kings news, a sponsorship proposal, or a question for the editorial team, reach out below.
        </p>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                Message Received!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1">
                Thank you for reaching out to Super Kings Den. Our editorial desk has logged your inquiry and will review it promptly.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="px-5 py-2.5 rounded-xl bg-csk-yellow text-csk-darkNavy font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition cursor-pointer"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Honeypot for Bots */}
            <input
              type="text"
              name="website_url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ruturaj Gaikwad"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-hidden focus:border-csk-yellow text-slate-900 dark:text-white placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="fan@superkingsden.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-hidden focus:border-csk-yellow text-slate-900 dark:text-white placeholder-slate-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Phone & Inquiry Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Phone Number (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Flag &amp; Dial Code</span>
                </label>
                <div className="flex rounded-xl overflow-visible border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 focus-within:border-csk-yellow focus-within:ring-1 focus-within:ring-csk-yellow/30 transition">
                  {/* Flag & Country Code Custom Selector */}
                  <CountryCodeSelector
                    selectedCode={selectedCountry.code}
                    selectedIso={selectedCountry.iso}
                    onSelect={(country) => setSelectedCountry(country)}
                  />

                  {/* Phone Input */}
                  <div className="relative flex-1 flex items-center min-w-0">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s-]/g, ''))}
                      placeholder={selectedCountry.placeholder || '98765 43210'}
                      className="w-full px-3 py-2.5 text-xs bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Inquiry Topic
                </label>
                <div className="relative">
                  <HelpCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-hidden focus:border-csk-yellow text-slate-900 dark:text-white cursor-pointer transition"
                  >
                    {inquiryTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Media inquiry regarding CSK 2026 auction squad"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-hidden focus:border-csk-yellow text-slate-900 dark:text-white placeholder-slate-400 transition"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Message Content <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details, questions, scoop, or collaboration ideas..."
                  className="w-full p-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:outline-hidden focus:border-csk-yellow text-slate-900 dark:text-white placeholder-slate-400 resize-none transition leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-csk-yellow hover:bg-amber-400 text-csk-darkNavy font-black text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Message...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* ─── Sidebar Contact Details & Office Cards (5 Cols) ─── */}
      <div className="lg:col-span-5 space-y-5">
        {/* Editorial Office Card */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-csk-yellow/20 border border-csk-yellow/30 flex items-center justify-center text-amber-700 dark:text-csk-yellow shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Editorial Desk &amp; HQ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {siteSettings.address || "Chepauk Media Enclave, Chennai, Tamil Nadu, India"}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="font-semibold flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-csk-yellow" />
                Email:
              </span>
              <a
                href={`mailto:${siteSettings.email || siteSettings.primaryEmail || 'contact@superkingsden.com'}`}
                className="text-amber-700 dark:text-csk-yellow hover:underline font-bold"
              >
                {siteSettings.email || siteSettings.primaryEmail || 'contact@superkingsden.com'}
              </a>
            </div>

            {siteSettings.phone && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-csk-yellow" />
                  Phone:
                </span>
                <a href={`tel:${siteSettings.phone}`} className="text-slate-800 dark:text-slate-200 hover:text-csk-yellow font-bold">
                  {siteSettings.phone}
                </a>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="font-semibold flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-csk-yellow" />
                Desk Hours:
              </span>
              <span className="font-medium">
                {siteSettings.deskHours || "Mon - Sat, 9:00 AM - 7:00 PM IST"}
              </span>
            </div>
          </div>
        </div>

        {/* Global Super Kings Coverage Info */}
        <div className="bg-gradient-to-br from-amber-500/10 via-slate-50 dark:via-slate-900 to-amber-500/5 border border-amber-500/30 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase text-amber-700 dark:text-csk-yellow tracking-wider">
            <ShieldCheck className="w-4 h-4 text-csk-yellow" />
            <span>Global Super Kings Fan Network</span>
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Covering Yellow Army Worldwide
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Super Kings Den provides dedicated match coverage, player archives, and fan culture across all three active Super Kings franchises:
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-white/5">
              <span className="font-black text-amber-500 block">CSK</span>
              <span className="text-[10px] text-slate-400">IPL India</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-white/5">
              <span className="font-black text-emerald-500 block">JSK</span>
              <span className="text-[10px] text-slate-400">SA20 South Africa</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-white/5">
              <span className="font-black text-blue-500 block">TSK</span>
              <span className="text-[10px] text-slate-400">MLC United States</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
