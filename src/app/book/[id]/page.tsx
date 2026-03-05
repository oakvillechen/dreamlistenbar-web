'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/Header';
import { usePlayer } from '@/lib/PlayerContext';
import { useUser } from '@/lib/UserContext';
import { BookDetail, Chapter } from '@/lib/types';
import { proxyCoverUrl, proxyAudioUrl } from '@/lib/proxy';

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { play, state: playerState } = usePlayer();
  const { addFavorite, removeFavorite, isFavorite } = useUser();
  
  const [data, setData] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('0');
  const [fetchingAudioId, setFetchingAudioId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookDetail(id, currentTab);
  }, [id, currentTab]);

  const fetchBookDetail = async (bookId: string, page: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/book/${bookId}?page=${page}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch book detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayChapter = async (chapter: Chapter, index: number) => {
    if (fetchingAudioId === chapter.tingId) return;
    
    setFetchingAudioId(chapter.tingId);
    try {
      const res = await fetch(`/api/audio?tingId=${chapter.tingId}`);
      const audioData = await res.json();
      
      if (audioData.success && audioData.audio_url) {
        const audioUrl = proxyAudioUrl(audioData.audio_url);
        play(
          audioUrl,
          chapter.title,
          data?.book.cover || '',
          chapter.tingId,
          id,
          data?.book.title || '',
          index,
          data?.chapters.map(c => ({ tingId: c.tingId, title: c.title })) || []
        );
      } else {
        alert('无法解析音频地址，请稍后再试');
      }
    } catch (err) {
      console.error('Play error:', err);
    } finally {
      setFetchingAudioId(null);
    }
  };

  const handleToggleFavorite = () => {
    if (!data) return;
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite({
        bookId: id,
        bookTitle: data.book.title,
        cover: data.book.cover,
        author: '',
        speaker: '',
      });
    }
  };

  if (!data && loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <div className="flex gap-4 mb-8">
            <div className="w-32 h-44 rounded-xl skeleton" />
            <div className="flex-1 space-y-3 pt-4">
              <div className="h-6 w-3/4 rounded skeleton" />
              <div className="h-4 w-1/2 rounded skeleton" />
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-lg skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const favorited = isFavorite(id);

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Book Header */}
        <div className="flex gap-4 mb-6">
          <div className="relative w-28 h-40 rounded-xl overflow-hidden glass shadow-2xl shrink-0">
            {data.book.cover ? (
              <img
                src={proxyCoverUrl(data.book.cover)}
                alt={data.book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
            )}
          </div>
          <div className="flex-1 pt-1">
            <h1 className="text-lg font-bold text-white mb-2 leading-tight">{data.book.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30">有声书</span>
            </div>
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${favorited 
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10'}`}
            >
              <svg className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorited ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>

        {/* Tabs / Pagination */}
        {data.tabs.length > 1 && (
          <div className="mb-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pb-2">
              {data.tabs.map((tab) => (
                <button
                  key={tab.offset}
                  onClick={() => setCurrentTab(tab.offset)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all
                    ${currentTab === tab.offset 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {tab.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chapters List */}
        <div className="grid grid-cols-1 gap-2">
          {data.chapters.map((chapter, index) => {
            const isCurrent = playerState.tingId === chapter.tingId;
            return (
              <button
                key={chapter.tingId}
                onClick={() => handlePlayChapter(chapter, index)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left
                  ${isCurrent 
                    ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' 
                    : 'glass hover:bg-white/10 text-gray-300'}
                `}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${isCurrent ? 'bg-indigo-500 text-white' : 'bg-white/5'}
                `}>
                  {fetchingAudioId === chapter.tingId ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isCurrent ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span className="text-sm font-medium truncate flex-1">{chapter.title}</span>
                {isCurrent && <span className="text-[10px] uppercase tracking-widest animate-pulse">Playing</span>}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
