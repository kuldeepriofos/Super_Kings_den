'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultSettings from '../data/defaultSiteSettings.json';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [selectedFranchise, setSelectedFranchise] = useState('ALL');
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [siteSettings, setSiteSettings] = useState(defaultSettings);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings/');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSiteSettings(data.settings);
        }
      }
    } catch (err) {
      // silently fallback to defaultSettings
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    setMounted(true);
    // Default is always Light Mode unless user explicitly toggled to dark
    const savedTheme = localStorage.getItem('skd-theme-v2');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    // Instant synchronous DOM class mutation for immediate 0ms color switch
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextDark = !isCurrentlyDark;
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('skd-theme-v2', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('skd-theme-v2', 'light');
    }
    setDarkMode(nextDark);
  };

  return (
    <AppContext.Provider
      value={{
        selectedFranchise,
        setSelectedFranchise,
        searchOpen,
        setSearchOpen,
        darkMode,
        toggleDarkMode,
        mounted,
        siteSettings,
        setSiteSettings,
        refreshSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
