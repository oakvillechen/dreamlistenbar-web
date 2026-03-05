'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { proxyAudioUrl } from '@/lib/proxy';

interface PlayerState {
  audioUrl: string | null;
  title: string;
  cover: string;
  tingId: string | null;
  bookId: string | null;
  bookTitle: string;
  chapterIndex: number;
  chapters: { tingId: string; title: string }[];
}

interface PlayerContextType {
  state: PlayerState;
  play: (audioUrl: string, title: string, cover: string, tingId: string, bookId: string, bookTitle: string, chapterIndex: number, chapters: { tingId: string; title: string }[]) => void;
  close: () => void;
  playNext: () => void;
  playPrev: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    audioUrl: null,
    title: '',
    cover: '',
    tingId: null,
    bookId: null,
    bookTitle: '',
    chapterIndex: -1,
    chapters: [],
  });

  const play = useCallback((audioUrl: string, title: string, cover: string, tingId: string, bookId: string, bookTitle: string, chapterIndex: number, chapters: { tingId: string; title: string }[]) => {
    setState({ audioUrl, title, cover, tingId, bookId, bookTitle, chapterIndex, chapters });

    // 记录到历史
    try {
      const saved = localStorage.getItem('dreamlistenbar_user');
      if (saved) {
        const userData = JSON.parse(saved);
        const historyItem = {
          bookId,
          bookTitle,
          cover,
          chapterTitle: title,
          tingId,
          chapterIndex,
          timestamp: Date.now(),
          progress: 0,
          currentTime: 0,
        };
        const filtered = (userData.history || []).filter((h: { tingId: string }) => h.tingId !== tingId);
        userData.history = [historyItem, ...filtered].slice(0, 100);
        localStorage.setItem('dreamlistenbar_user', JSON.stringify(userData));
      }
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, audioUrl: null }));
  }, []);

  const fetchAudioAndPlay = useCallback(async (tingId: string, title: string, index: number) => {
    try {
      const res = await fetch(`/api/audio?tingId=${tingId}`);
      const data = await res.json();
      if (data.success && data.audio_url) {
        const audioUrl = proxyAudioUrl(data.audio_url);
        setState(prev => {
          const newState = { ...prev, audioUrl, title, tingId, chapterIndex: index };
          
          // 记录到历史
          try {
            const saved = localStorage.getItem('dreamlistenbar_user');
            if (saved) {
              const userData = JSON.parse(saved);
              const historyItem = {
                bookId: prev.bookId,
                bookTitle: prev.bookTitle,
                cover: prev.cover,
                chapterTitle: title,
                tingId,
                chapterIndex: index,
                timestamp: Date.now(),
                progress: 0,
                currentTime: 0,
              };
              const filtered = (userData.history || []).filter((h: { tingId: string }) => h.tingId !== tingId);
              userData.history = [historyItem, ...filtered].slice(0, 100);
              localStorage.setItem('dreamlistenbar_user', JSON.stringify(userData));
            }
          } catch (e) {
            console.error('Failed to save history:', e);
          }
          
          return newState;
        });
      }
    } catch (err) {
      console.error('Failed to fetch audio:', err);
    }
  }, []);

  const playNext = useCallback(async () => {
    setState(prev => {
      if (prev.chapterIndex < prev.chapters.length - 1) {
        const nextIndex = prev.chapterIndex + 1;
        const nextChapter = prev.chapters[nextIndex];
        fetchAudioAndPlay(nextChapter.tingId, nextChapter.title, nextIndex);
      }
      return prev;
    });
  }, [fetchAudioAndPlay]);

  const playPrev = useCallback(async () => {
    setState(prev => {
      if (prev.chapterIndex > 0) {
        const prevIndex = prev.chapterIndex - 1;
        const prevChapter = prev.chapters[prevIndex];
        fetchAudioAndPlay(prevChapter.tingId, prevChapter.title, prevIndex);
      }
      return prev;
    });
  }, [fetchAudioAndPlay]);

  return (
    <PlayerContext.Provider value={{ state, play, close, playNext, playPrev }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
