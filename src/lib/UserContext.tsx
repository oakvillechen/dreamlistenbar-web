'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  progress: number; // 播放进度百分比
  currentTime: number; // 当前播放时间（秒）
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
  login: (email: string) => void;
  logout: () => void;
  addHistory: (item: Omit<HistoryItem, 'timestamp'>) => void;
  updateHistoryProgress: (tingId: string, currentTime: number, progress: number) => void;
  addFavorite: (item: Omit<FavoriteItem, 'timestamp'>) => void;
  removeFavorite: (bookId: string) => void;
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

  // 从 localStorage 加载数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
    setIsLoaded(true);
  }, []);

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

  const login = (email: string) => {
    setUserData(prev => ({ ...prev, email }));
  };

  const logout = () => {
    setUserData({ email: '', history: [], favorites: [] });
    localStorage.removeItem(STORAGE_KEY);
  };

  const addHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
    setUserData(prev => {
      // 移除已有的同一章记录
      const filtered = prev.history.filter(h => h.tingId !== item.tingId);
      // 添加到最前面
      const newHistory = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, 100); // 最多保留100条
      return { ...prev, history: newHistory };
    });
  };

  const updateHistoryProgress = (tingId: string, currentTime: number, progress: number) => {
    setUserData(prev => {
      const newHistory = prev.history.map(h => 
        h.tingId === tingId ? { ...h, currentTime, progress, timestamp: Date.now() } : h
      );
      return { ...prev, history: newHistory };
    });
  };

  const addFavorite = (item: Omit<FavoriteItem, 'timestamp'>) => {
    setUserData(prev => {
      if (prev.favorites.some(f => f.bookId === item.bookId)) return prev;
      return { ...prev, favorites: [{ ...item, timestamp: Date.now() }, ...prev.favorites] };
    });
  };

  const removeFavorite = (bookId: string) => {
    setUserData(prev => ({
      ...prev,
      favorites: prev.favorites.filter(f => f.bookId !== bookId),
    }));
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
      login,
      logout,
      addHistory,
      updateHistoryProgress,
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
