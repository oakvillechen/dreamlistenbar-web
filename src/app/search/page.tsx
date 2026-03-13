'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BookCard from '@/components/BookCard';
import { Book } from '@/lib/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const type = searchParams.get('type') || '1';

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (keyword) {
      searchBooks(keyword, type);
    }
  }, [keyword, type]);

  const searchBooks = async (query: string, searchType: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(query)}&type=${searchType}`);
      const data = await res.json();
      
      if (data.success) {
        setBooks(data.list);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Type Tabs */}
        <div className="mb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {[
              { type: '1', label: '书名' },
              { type: '2', label: '作者' },
              { type: '3', label: '主播' },
            ].map((t) => (
              <Link
                key={t.type}
                href={`/search?keyword=${encodeURIComponent(keyword)}&type=${t.type}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${type === t.type
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'glass text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Search Info */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">
            搜索结果
          </h1>
          {keyword && (
            <p className="text-gray-400 text-sm mt-1">
              关键词: "{keyword}"
            </p>
          )}
        </div>

        {/* Results */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-3">
                <div className="flex gap-3">
                  <div className="w-20 h-28 rounded-lg skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded skeleton" />
                    <div className="h-3 w-1/2 rounded skeleton" />
                    <div className="h-3 w-full rounded skeleton mt-4" />
                  </div>
                </div>
              </div>
            ))
          ) : searched && books.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">🔍</p>
              <p>未找到相关内容</p>
              <p className="text-sm mt-2">试试其他关键词？</p>
            </div>
          ) : (
            books.map((book, index) => (
              <BookCard key={`${book.bookId}-${index}`} book={book} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
