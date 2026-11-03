'use client';

import React, { useState, useEffect } from 'react';
import {
  Code,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Layers,
  FileCode,
  ExternalLink,
  Eye,
  Terminal,
  Info,
} from 'lucide-react';

export default function AdminCodeSnippetsPage() {
  const [config, setConfig] = useState({
    isEnabled: true,
    headCode: '',
    headEnabled: true,
    bodyOpenCode: '',
    bodyOpenEnabled: true,
    bodyCloseCode: '',
    bodyCloseEnabled: true,
    updatedAt: '',
    updatedBy: '',
  });

  const [activeTab, setActiveTab] = useState('head'); // 'head' | 'bodyOpen' | 'bodyClose'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Load configuration from API
  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/code-snippets/');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setConfig(json.data);
          }
        }
      } catch (err) {
        setActionMessage({ type: 'error', text: 'Failed to load custom code settings' });
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const showToast = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Save changes to API & JSON
  const handleSave = async (overrideConfig = null) => {
    const payload = overrideConfig || config;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/code-snippets/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setConfig(json.data);
        showToast('success', json.message || 'Custom code settings saved successfully!');
      } else {
        showToast('error', json.error || 'Failed to save changes');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Copy code snippet to clipboard
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Clear single section
  const handleClearSection = (field) => {
    if (confirm(`Are you sure you want to clear all code in this section?`)) {
      setConfig((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto pb-16">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-semibold animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/95 border-red-500/50 text-red-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* HEADER BANNER WITH MASTER TOGGLE */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 shadow-inner">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Head, Body &amp; Footer Code Manager</span>
                <span className="px-2 py-0.5 rounded-lg bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-xs font-bold">
                  Scripts
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Insert Google Tag Manager, Analytics (GA4), AdSense, Meta Pixel, tracking codes, and custom scripts.
              </p>
            </div>
          </div>
        </div>

        {/* Master Active Switch & Save Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">Global Script Injection:</span>
            <button
              type="button"
              onClick={() => {
                const nextState = !config.isEnabled;
                const updated = { ...config, isEnabled: nextState };
                setConfig(updated);
                handleSave(updated);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                config.isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              title="Turn all custom code snippets ON or OFF across the website"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                config.isEnabled ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {config.isEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* CODE SECTIONS TABS & EDITORS */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/70 overflow-x-auto">
          <button
            onClick={() => setActiveTab('head')}
            className={`px-5 py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'head'
                ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>Header Scripts</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              &lt;head&gt;
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bodyOpen')}
            className={`px-5 py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'bodyOpen'
                ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Body Open Scripts</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              &lt;body&gt;
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bodyClose')}
            className={`px-5 py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'bodyClose'
                ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Footer / Body Closing</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              &lt;/body&gt;
            </span>
          </button>
        </div>

        {/* Tab 1: Header Scripts (<head>) */}
        {activeTab === 'head' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Scripts in &lt;head&gt;
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recommended for Google Tag Manager, Google Analytics 4 (GA4), AdSense tags, Search Console verification, and custom &lt;style&gt; CSS.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <span>Enable &lt;head&gt; Injection:</span>
                  <input
                    type="checkbox"
                    checked={config.headEnabled}
                    onChange={(e) => setConfig({ ...config, headEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                </label>

                {config.headCode && (
                  <>
                    <button
                      onClick={() => handleCopy(config.headCode, 'head')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                      title="Copy code to clipboard"
                    >
                      {copiedKey === 'head' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'head' ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleClearSection('headCode')}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-xs text-red-400 flex items-center gap-1.5 transition cursor-pointer"
                      title="Clear code"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <textarea
              value={config.headCode}
              onChange={(e) => setConfig({ ...config, headCode: e.target.value })}
              rows={14}
              placeholder="<!-- Paste your <head> tracking scripts, verification tags, or styles here -->"
              className="w-full p-4 rounded-2xl bg-[#070d19] border border-slate-800 font-mono text-xs sm:text-sm text-yellow-300 placeholder-slate-600 outline-none focus:border-yellow-400/50 leading-relaxed resize-y selection:bg-yellow-400 selection:text-slate-950 transition-colors shadow-inner"
              spellCheck={false}
            />
          </div>
        )}

        {/* Tab 2: Body Open Scripts (<body>) */}
        {activeTab === 'bodyOpen' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Scripts immediately after &lt;body&gt; opening
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Best for Google Tag Manager &lt;noscript&gt; fallback iframe and tracking tags that must render as soon as the body opens.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <span>Enable &lt;body&gt; Injection:</span>
                  <input
                    type="checkbox"
                    checked={config.bodyOpenEnabled}
                    onChange={(e) => setConfig({ ...config, bodyOpenEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                </label>

                {config.bodyOpenCode && (
                  <>
                    <button
                      onClick={() => handleCopy(config.bodyOpenCode, 'bodyOpen')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedKey === 'bodyOpen' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'bodyOpen' ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleClearSection('bodyOpenCode')}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-xs text-red-400 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <textarea
              value={config.bodyOpenCode}
              onChange={(e) => setConfig({ ...config, bodyOpenCode: e.target.value })}
              rows={12}
              placeholder="<!-- Paste your <body> opening code, such as GTM (noscript) fallback here -->"
              className="w-full p-4 rounded-2xl bg-[#070d19] border border-slate-800 font-mono text-xs sm:text-sm text-sky-300 placeholder-slate-600 outline-none focus:border-sky-400/50 leading-relaxed resize-y selection:bg-sky-400 selection:text-slate-950 transition-colors shadow-inner"
              spellCheck={false}
            />
          </div>
        )}

        {/* Tab 3: Footer Scripts (</body>) */}
        {activeTab === 'bodyClose' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Scripts before &lt;/body&gt; closing
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Best for Live Chat widgets (Tawk.to, WhatsApp, Crisp, Intercom), asynchronous analytics trackers, and custom JavaScript plugins.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <span>Enable &lt;/body&gt; Injection:</span>
                  <input
                    type="checkbox"
                    checked={config.bodyCloseEnabled}
                    onChange={(e) => setConfig({ ...config, bodyCloseEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                </label>

                {config.bodyCloseCode && (
                  <>
                    <button
                      onClick={() => handleCopy(config.bodyCloseCode, 'bodyClose')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedKey === 'bodyClose' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'bodyClose' ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleClearSection('bodyCloseCode')}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-xs text-red-400 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <textarea
              value={config.bodyCloseCode}
              onChange={(e) => setConfig({ ...config, bodyCloseCode: e.target.value })}
              rows={12}
              placeholder="<!-- Paste your live chat scripts or footer trackers here -->"
              className="w-full p-4 rounded-2xl bg-[#070d19] border border-slate-800 font-mono text-xs sm:text-sm text-emerald-300 placeholder-slate-600 outline-none focus:border-emerald-400/50 leading-relaxed resize-y selection:bg-emerald-400 selection:text-slate-950 transition-colors shadow-inner"
              spellCheck={false}
            />
          </div>
        )}

        {/* Footer info & Save prompt */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span>
              All snippets are automatically synchronized with MongoDB and cached locally for ultra-fast, zero-delay SSR rendering on the public site.
            </span>
          </div>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save All Snippets</span>
          </button>
        </div>
      </div>
    </div>
  );
}
