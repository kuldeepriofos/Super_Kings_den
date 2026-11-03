'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { COUNTRY_DIAL_CODES } from '../data/countryCodes';

export default function CountryCodeSelector({
  selectedCode = '+91',
  selectedIso = 'in',
  onSelect,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find currently selected country
  const currentCountry =
    COUNTRY_DIAL_CODES.find((c) => c.iso === selectedIso) ||
    COUNTRY_DIAL_CODES.find((c) => c.code === selectedCode) ||
    COUNTRY_DIAL_CODES[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter countries by search query
  const filteredCountries = COUNTRY_DIAL_CODES.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      c.country.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  const handleSelect = (country) => {
    if (onSelect) {
      onSelect(country);
    }
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select country code, currently ${currentCountry.country} (${currentCountry.code})`}
        className="flex items-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border-r border-slate-200 dark:border-white/10 transition cursor-pointer select-none"
      >
        <span className="w-5 h-3.5 rounded-xs overflow-hidden shadow-xs border border-black/10 dark:border-white/10 flex items-center justify-center bg-slate-200 shrink-0">
          <img
            src={`/flags/${currentCountry.iso}.png`}
            alt={`${currentCountry.country} Flag`}
            width={20}
            height={14}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to FlagCDN if local image fails
              e.target.onerror = null;
              e.target.src = `https://flagcdn.com/w40/${currentCountry.iso}.png`;
            }}
          />
        </span>
        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
          {currentCountry.code}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-500' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0c172e] border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header & Search */}
          <div className="p-2.5 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country name or code..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-csk-yellow text-slate-900 dark:text-white placeholder-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-white/5 space-y-0.5">
            {filteredCountries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching country found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.iso === currentCountry.iso;
                return (
                  <button
                    key={`${c.iso}-${c.code}`}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-csk-yellow/15 text-amber-800 dark:text-csk-yellow font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-3.5 rounded-xs overflow-hidden shadow-2xs border border-black/10 dark:border-white/10 flex items-center justify-center bg-slate-200 shrink-0">
                        <img
                          src={`/flags/${c.iso}.png`}
                          alt={`${c.country} Flag`}
                          width={20}
                          height={14}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://flagcdn.com/w40/${c.iso}.png`;
                          }}
                        />
                      </span>
                      <span className="truncate">{c.country}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                      {c.code}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note for Super Kings franchises */}
          <div className="p-2 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 text-[10px] text-slate-400 text-center font-medium">
            🟡 CSK (India) &bull; 🟢 JSK (South Africa) &bull; 🔴 TSK (USA)
          </div>
        </div>
      )}
    </div>
  );
}
