'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="glass sticky top-0 z-50 px-4 py-3 safe-top border-b border-white/5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🎧</span>
          <span className="text-base font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent hidden sm:inline">
            DreamListenBar
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索小说..."
              className="glass-input w-full px-4 py-2 pl-10 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        <Link 
          href="/my" 
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm hidden sm:inline">我的</span>
        </Link>
      </div>
    </header>
  );
}
