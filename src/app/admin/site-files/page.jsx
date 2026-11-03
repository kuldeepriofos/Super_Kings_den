'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Info,
  ExternalLink,
} from 'lucide-react';

const FILE_META = {
  'robots.txt': {
    label: 'robots.txt',
    description: 'Search-engine crawl rules. Served live at /robots.txt.',
    publicUrl: '/robots.txt',
    language: 'Crawler directives',
  },
  'llms.txt': {
    label: 'llms.txt',
    description: 'Guidance for AI / LLM crawlers. Served live at /llms.txt.',
    publicUrl: '/llms.txt',
    language: 'Markdown',
  },
  '.htaccess': {
    label: '.htaccess',
    description:
      'Apache / LiteSpeed server rules. Written to the project root on save; applies only when served behind Apache/LiteSpeed.',
    publicUrl: null,
    language: 'Apache config',
  },
};

const FILE_ORDER = ['robots.txt', 'llms.txt', '.htaccess'];

export default function AdminSiteFilesPage() {
  const [files, setFiles] = useState({}); // name -> { content, updatedAt, updatedBy }
  const [activeTab, setActiveTab] = useState('robots.txt');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/site-files/');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.files)) {
            const map = {};
            json.files.forEach((f) => {
              map[f.name] = { content: f.content || '', updatedAt: f.updatedAt, updatedBy: f.updatedBy };
            });
            setFiles(map);
          }
        } else {
          showToast('error', 'Failed to load site files');
        }
      } catch (err) {
        showToast('error', 'Failed to load site files');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const updateContent = (name, content) => {
    setFiles((prev) => ({ ...prev, [name]: { ...(prev[name] || {}), content } }));
  };

  const handleSave = async (name) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-files/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content: files[name]?.content ?? '' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', json.message || `${name} saved`);
        if (json.file) {
          setFiles((prev) => ({
            ...prev,
            [name]: { ...prev[name], updatedAt: json.file.updatedAt, updatedBy: json.file.updatedBy },
          }));
        }
      } else {
        showToast('error', json.error || 'Save failed');
      }
    } catch (err) {
      showToast('error', 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const meta = FILE_META[activeTab];
  const current = files[activeTab] || { content: '' };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <FileCode2 className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SEO &amp; Server Files</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Edit robots.txt, llms.txt and .htaccess directly from the dashboard.
          </p>
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILE_ORDER.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === name
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {FILE_META[name].label}
          </button>
        ))}
      </div>

      {/* Editor card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{meta.label}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{meta.description}</p>
          </div>
          {meta.publicUrl && (
            <a
              href={meta.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              View live <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {activeTab === '.htaccess' && (
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              .htaccess is written to the project root and only takes effect when the site is served
              behind Apache or LiteSpeed. On a pure Node/Next deployment it is ignored.
            </span>
          </div>
        )}

        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
        ) : (
          <textarea
            value={current.content}
            onChange={(e) => updateContent(activeTab, e.target.value)}
            spellCheck={false}
            className="w-full h-80 font-mono text-xs leading-relaxed rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
            placeholder={`Enter ${meta.label} content…`}
          />
        )}

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            {current.updatedAt
              ? `Last updated ${new Date(current.updatedAt).toLocaleString()}${
                  current.updatedBy ? ` by ${current.updatedBy}` : ''
                }`
              : 'Not saved yet'}
          </p>
          <button
            type="button"
            onClick={() => handleSave(activeTab)}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : `Save ${meta.label}`}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Changes are stored in the database and a JSON fallback, and go live immediately. robots.txt
          and llms.txt are served dynamically; .htaccess is written to disk.
        </span>
      </div>
    </div>
  );
}
