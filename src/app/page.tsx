'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BookCard from '@/components/BookCard';
import { CATEGORIES, Book } from '@/lib/types';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('latest');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchBooks(selectedCategory, 1, true);
  }, [selectedCategory]);

  const fetchBooks = async (catId: string, pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/category?id=${catId}&page=${pageNum}`);
      const data = await res.json();
      
      if (data.success) {
        if (reset) {
          setBooks(data.list);
        } else {
          setBooks(prev => [...prev, ...data.list]);
        }
        setHasMore(data.list.length > 0);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBooks(selectedCategory, nextPage);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
    setBooks([]);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${selectedCategory === cat.id
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'glass text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="space-y-3">
          {loading && books.length === 0 ? (
            // Skeleton loading
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
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">📚</p>
              <p>暂无内容</p>
            </div>
          ) : (
            <>
              {books.map((book, index) => (
                <BookCard key={`${book.bookId}-${index}`} book={book} />
              ))}
              
              {loading && (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Load More */}
        {hasMore && books.length > 0 && !loading && (
          <button
            onClick={loadMore}
            className="w-full mt-4 py-3 glass-card text-center text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            加载更多
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>🎧 DreamListenBar</p>
      </footer>
    </div>
  );
}
