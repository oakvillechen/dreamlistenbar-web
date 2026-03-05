'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useUser } from '@/lib/UserContext';
import { usePlayer } from '@/lib/PlayerContext';
import { proxyCoverUrl, proxyAudioUrl } from '@/lib/proxy';
import Link from 'next/link';

export default function MyPage() {
  const { email, isLoggedIn, history, favorites, login, logout, removeFavorite } = useUser();
  const { play } = usePlayer();
  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      login(emailInput.trim());
    }
  };

  const handlePlayHistory = async (item: typeof history[0]) => {
    try {
      const res = await fetch(`/api/audio?tingId=${item.tingId}`);
      const data = await res.json();
      if (data.success && data.audio_url) {
        const audioUrl = proxyAudioUrl(data.audio_url);
        play(audioUrl, item.chapterTitle, item.cover, item.tingId, item.bookId, item.bookTitle, item.chapterIndex, []);
      }
    } catch (err) {
      console.error('Failed to play history item:', err);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* User Info */}
        <div className="glass-card p-6 mb-6">
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xl">
                  🎧
                </div>
                <div>
                  <p className="text-white font-medium">{email}</p>
                  <p className="text-xs text-gray-400">已登录</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition-all"
              >
                退出
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <p className="text-white font-medium">登录以保存数据</p>
                  <p className="text-xs text-gray-400">输入邮箱即可</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 glass-input px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-all"
                >
                  登录
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all
              ${activeTab === 'history' 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                : 'glass text-gray-300 hover:text-white'}`}
          >
            📖 播放历史 ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all
              ${activeTab === 'favorites' 
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                : 'glass text-gray-300 hover:text-white'}`}
          >
            ❤️ 我的收藏 ({favorites.length})
          </button>
        </div>

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">📖</p>
                <p>暂无播放记录</p>
                <p className="text-sm mt-2">去首页找一本好书吧</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={`${item.tingId}-${item.timestamp}`}
                  className="glass-card p-3 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => handlePlayHistory(item)}
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      {item.cover ? (
                        <img
                          src={proxyCoverUrl(item.cover)}
                          alt={item.bookTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.bookTitle}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{item.chapterTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${item.progress || 0}%` }} 
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-2">
            {favorites.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">❤️</p>
                <p>暂无收藏</p>
                <p className="text-sm mt-2">长按书籍卡片添加收藏</p>
              </div>
            ) : (
              favorites.map((item) => (
                <Link href={`/book/${item.bookId}`} key={item.bookId} className="block">
                  <div className="glass-card p-3 hover:bg-white/10 transition-all">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                        {item.cover ? (
                          <img
                            src={proxyCoverUrl(item.cover)}
                            alt={item.bookTitle}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.bookTitle}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {item.author && <span className="mr-2">👤 {item.author}</span>}
                          {item.speaker && <span>🎙️ {item.speaker}</span>}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFavorite(item.bookId);
                        }}
                        className="p-2 text-pink-400 hover:text-pink-300 transition-colors shrink-0"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
