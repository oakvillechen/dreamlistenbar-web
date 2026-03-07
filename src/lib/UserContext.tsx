'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supabase 配置
const SUPABASE_URL = 'https://cwpxcqutrzzkuyaeweir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cHhjcXV0cnp6a3V5YWV3ZWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTcwNTgsImV4cCI6MjA4ODM3MzA1OH0.PvpM1pEk_B1K5xueePctLlxhpwBm6GGaLhhttwF-334';

// 后端 URL - 用户数据用 Render，音频用本地 ngrok
const RENDER_URL = 'https://dreamlistenbar-backend.onrender.com';
const getBackendUrl = () => RENDER_URL;

interface UserData {
  email: string;
  history: HistoryItem[];
  favorites: FavoriteItem[];
}

export interface HistoryItem {
  bookId: string;
  bookTitle: string;
  cover: string;
  chapterTitle: string;
  tingId: string;
  chapterIndex: number;
  timestamp: number;
  progress: number;
  currentTime: number;
}

export interface FavoriteItem {
  bookId: string;
  bookTitle: string;
  cover: string;
  author: string;
  speaker: string;
  timestamp: number;
}

interface UserContextType {
  email: string | null;
  isLoggedIn: boolean;
  history: HistoryItem[];
  favorites: FavoriteItem[];
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  addHistory: (item: Omit<HistoryItem, 'timestamp'>) => Promise<void>;
  updateHistoryProgress: (tingId: string, currentTime: number, progress: number) => void;
  removeHistory: (tingId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  addFavorite: (item: Omit<FavoriteItem, 'timestamp'>) => Promise<void>;
  removeFavorite: (bookId: string) => Promise<void>;
  isFavorite: (bookId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'dreamlistenbar_user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    email: '',
    history: [],
    favorites: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 从 localStorage 加载本地数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
        
        // 如果有 email，从后端同步
        if (parsed.email) {
          syncFromBackend(parsed.email);
        }
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
    setIsLoaded(true);
  }, []);

  // 从后端同步数据
  const syncFromBackend = async (email: string) => {
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/user/${encodeURIComponent(email)}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      
      if (data.success) {
        setUserData(prev => ({
          ...prev,
          history: data.history || [],
          favorites: data.favorites || [],
        }));
        
        // 更新 localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          email,
          history: data.history || [],
          favorites: data.favorites || [],
        }));
      }
    } catch (e) {
      console.error('Failed to sync from backend:', e);
    }
  };

  // 保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } catch (e) {
        console.error('Failed to save user data:', e);
      }
    }
  }, [userData, isLoaded]);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      // 先保存 email
      setUserData(prev => ({ ...prev, email }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...userData, email }));
      
      // 从后端获取数据
      await syncFromBackend(email);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserData({ email: '', history: [], favorites: [] });
    localStorage.removeItem(STORAGE_KEY);
  };

  const addHistory = async (item: Omit<HistoryItem, 'timestamp'>) => {
    const historyItem: HistoryItem = { ...item, timestamp: Date.now() };
    
    // 本地更新
    setUserData(prev => {
      const filtered = prev.history.filter(h => h.tingId !== item.tingId);
      const newHistory = [historyItem, ...filtered].slice(0, 100);
      return { ...prev, history: newHistory };
    });

    // 同步到后端
    if (userData.email) {
      try {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/user/${encodeURIComponent(userData.email)}/history`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(historyItem),
        });
      } catch (e) {
        console.error('Failed to sync history:', e);
      }
    }
  };

  const updateHistoryProgress = (tingId: string, currentTime: number, progress: number) => {
    setUserData(prev => {
      const newHistory = prev.history.map(h => 
        h.tingId === tingId ? { ...h, currentTime, progress, timestamp: Date.now() } : h
      );
      return { ...prev, history: newHistory };
    });
  };

  const addFavorite = async (item: Omit<FavoriteItem, 'timestamp'>) => {
    const favoriteItem: FavoriteItem = { ...item, timestamp: Date.now() };
    
    // 本地更新
    setUserData(prev => {
      if (prev.favorites.some(f => f.bookId === item.bookId)) return prev;
      return { ...prev, favorites: [favoriteItem, ...prev.favorites] };
    });

    // 同步到后端
    if (userData.email) {
      try {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/user/${encodeURIComponent(userData.email)}/favorites`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(favoriteItem),
        });
      } catch (e) {
        console.error('Failed to sync favorite:', e);
      }
    }
  };

  const removeFavorite = async (bookId: string) => {
    // 本地更新
    setUserData(prev => ({
      ...prev,
      favorites: prev.favorites.filter(f => f.bookId !== bookId),
    }));

    // 同步到后端
    if (userData.email) {
      try {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/user/${encodeURIComponent(userData.email)}/favorites/${bookId}`, {
          method: 'DELETE',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
      } catch (e) {
        console.error('Failed to remove favorite:', e);
      }
    }
  };

  const removeHistory = async (tingId: string) => {
    // 本地更新
    setUserData(prev => ({
      ...prev,
      history: prev.history.filter(h => h.tingId !== tingId),
    }));

    // 同步到后端
    if (userData.email) {
      try {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/user/${encodeURIComponent(userData.email)}/history/${tingId}`, {
          method: 'DELETE',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
      } catch (e) {
        console.error('Failed to remove history:', e);
      }
    }
  };

  const clearHistory = async () => {
    // 本地更新
    setUserData(prev => ({
      ...prev,
      history: [],
    }));

    // 同步到后端
    if (userData.email) {
      try {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/user/${encodeURIComponent(userData.email)}/history`, {
          method: 'DELETE',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
      } catch (e) {
        console.error('Failed to clear history:', e);
      }
    }
  };

  const isFavorite = (bookId: string) => {
    return userData.favorites.some(f => f.bookId === bookId);
  };

  return (
    <UserContext.Provider value={{
      email: userData.email || null,
      isLoggedIn: !!userData.email,
      history: userData.history,
      favorites: userData.favorites,
      isLoading,
      login,
      logout,
      addHistory,
      updateHistoryProgress,
      removeHistory,
      clearHistory,
      addFavorite,
      removeFavorite,
      isFavorite,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
