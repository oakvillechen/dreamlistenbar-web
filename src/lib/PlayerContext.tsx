'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlayerState {
  audioUrl: string | null;
  title: string;
  cover: string;
  tingId: string | null;
  bookId: string | null;
  chapterIndex: number;
  chapters: { tingId: string; title: string }[];
}

interface PlayerContextType {
  state: PlayerState;
  play: (audioUrl: string, title: string, cover: string, tingId: string, bookId: string, chapterIndex: number, chapters: { tingId: string; title: string }[]) => void;
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
    chapterIndex: -1,
    chapters: [],
  });

  const play = (audioUrl: string, title: string, cover: string, tingId: string, bookId: string, chapterIndex: number, chapters: { tingId: string; title: string }[]) => {
    setState({ audioUrl, title, cover, tingId, bookId, chapterIndex, chapters });
  };

  const close = () => {
    setState(prev => ({ ...prev, audioUrl: null }));
  };

  const playNext = async () => {
    if (state.chapterIndex < state.chapters.length - 1) {
      const nextIndex = state.chapterIndex + 1;
      const nextChapter = state.chapters[nextIndex];
      // 这里需要调用 API 获取新的音频地址
      fetchAudioAndPlay(nextChapter.tingId, nextChapter.title, nextIndex);
    }
  };

  const playPrev = async () => {
    if (state.chapterIndex > 0) {
      const prevIndex = state.chapterIndex - 1;
      const prevChapter = state.chapters[prevIndex];
      fetchAudioAndPlay(prevChapter.tingId, prevChapter.title, prevIndex);
    }
  };

  const fetchAudioAndPlay = async (tingId: string, title: string, index: number) => {
    try {
      const res = await fetch(`/api/audio?tingId=${tingId}`);
      const data = await res.json();
      if (data.success && data.audio_url) {
        play(data.audio_url, title, state.cover, tingId, state.bookId!, index, state.chapters);
      }
    } catch (err) {
      console.error('Failed to auto-play next/prev:', err);
    }
  };

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
