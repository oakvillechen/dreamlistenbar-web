'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BookCardProps {
  book: {
    title: string;
    bookId: string;
    cover: string;
    author: string;
    speaker: string;
    summary: string;
  };
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/book/${book.bookId}`} className="block">
      <div className="glass-card p-3 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
        <div className="flex gap-3">
          {/* Cover */}
          <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-white/5">
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                📚
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {book.author && <span className="mr-2">👤 {book.author}</span>}
              {book.speaker && <span>🎙️ {book.speaker}</span>}
            </p>
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-1">
              {book.summary || '暂无简介'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
