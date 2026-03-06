'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { proxyCoverUrl } from '@/lib/proxy';

interface PlayerProps {
  audioUrl: string | null;
  title: string;
  cover: string;
  bookId?: string | null;
  bookTitle?: string;
  chapterIndex?: number;
  totalChapters?: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function Player({
  audioUrl,
  title,
  cover,
  bookId,
  bookTitle,
  chapterIndex = -1,
  totalChapters = 0,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: PlayerProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  
  // 定时关闭
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number>(0);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const sleepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      setIsLoading(true);
      setError(null);
      
      const currentSrc = audioRef.current.currentSrc || audioRef.current.src;
      if (currentSrc !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
      
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Auto-play blocked:', err);
        setIsPlaying(false);
      });
    }
  }, [audioUrl]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (sleepIntervalRef.current) {
        clearInterval(sleepIntervalRef.current);
      }
    };
  }, []);

  const startSleepTimer = (minutes: number) => {
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
    }

    const endTime = Date.now() + minutes * 60 * 1000;
    setSleepTimer(minutes);
    setSleepRemaining(minutes * 60);
    setShowSleepMenu(false);

    sleepIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSleepRemaining(remaining);
      
      if (remaining <= 0) {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setSleepTimer(null);
        if (sleepIntervalRef.current) {
          clearInterval(sleepIntervalRef.current);
        }
      }
    }, 1000);
  };

  const cancelSleepTimer = () => {
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
    }
    setSleepTimer(null);
    setSleepRemaining(0);
    setShowSleepMenu(false);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Play error:', err);
      setError('播放失败，请重试');
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError('音频加载失败');
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatSleepTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        Math.max(0, audioRef.current.currentTime + seconds),
        duration
      );
    }
  };
  
  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (hasNext && onNext) {
      onNext();
    }
  };

  const goToBook = () => {
    if (bookId) {
      onClose();
      router.push(`/book/${bookId}`);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 safe-bottom">
      {/* Player Card */}
      <div className="glass-card rounded-t-3xl p-4 mx-2 border-t border-white/10">
        {/* Track Info - 可点击跳转 */}
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/10 shrink-0 cursor-pointer"
            onClick={goToBook}
          >
            {cover ? (
              <img
                src={proxyCoverUrl(cover)}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                🎧
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={goToBook}
          >
            <p className="text-sm font-medium text-white truncate">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              {bookTitle && <span className="truncate max-w-[120px]">{bookTitle}</span>}
              {totalChapters > 0 && (
                <>
                  <span>·</span>
                  <span className="text-indigo-400">{chapterIndex + 1}/{totalChapters}</span>
                </>
              )}
              {!bookTitle && !totalChapters && (
                isLoading ? '加载中...' : error || `${formatTime(currentTime)} / ${formatTime(duration)}`
              )}
            </p>
          </div>
          
          {/* Sleep Timer */}
          <button
            onClick={() => setShowSleepMenu(!showSleepMenu)}
            className={`p-2 transition-colors relative ${sleepTimer ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            title="定时关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {sleepTimer && (
              <span className="absolute -top-1 -right-1 text-[9px] bg-indigo-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {Math.ceil(sleepRemaining / 60)}
              </span>
            )}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sleep Timer Menu */}
        {showSleepMenu && (
          <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400 mb-2">⏰ 定时关闭</p>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60, 90, 120].map((min) => (
                <button
                  key={min}
                  onClick={() => startSleepTimer(min)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${sleepTimer === min 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  {min < 60 ? `${min}分钟` : `${min / 60}小时`}
                </button>
              ))}
              {sleepTimer && (
                <button
                  onClick={cancelSleepTimer}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30"
                >
                  取消
                </button>
              )}
            </div>
            {sleepTimer && (
              <p className="text-xs text-indigo-300 mt-2">
                ⏱ 剩余 {formatSleepTime(sleepRemaining)} 后自动暂停
              </p>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-indigo-500
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls - 改进布局 */}
        <div className="flex items-center justify-center gap-2">
          {/* Speed */}
          <button
            onClick={changeSpeed}
            className="w-14 h-12 flex flex-col items-center justify-center text-xs font-bold text-gray-300 hover:text-white transition-colors rounded-xl bg-white/5"
          >
            <span>{speed}x</span>
            <span className="text-[9px] text-gray-500">速度</span>
          </button>

          {/* 上一章 */}
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`w-14 h-12 flex flex-col items-center justify-center rounded-xl transition-all
              ${hasPrev ? 'text-white bg-white/10 hover:bg-white/20 active:scale-95' : 'text-gray-600 bg-white/5 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
            <span className="text-[9px] mt-0.5">上一章</span>
          </button>

          {/* 快退15秒 */}
          <button
            onClick={() => handleSkip(-15)}
            className="w-14 h-12 flex flex-col items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <span className="text-sm font-bold">-15</span>
            <span className="text-[9px] text-gray-500">秒</span>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading || !!error}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all
              ${isLoading || error 
                ? 'bg-gray-600 cursor-not-allowed' 
                : isPlaying 
                  ? 'bg-indigo-500 playing' 
                  : 'bg-indigo-500 hover:bg-indigo-400 active:scale-95'}`}
          >
            {isLoading ? (
              <svg className="w-7 h-7 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* 快进30秒 */}
          <button
            onClick={() => handleSkip(30)}
            className="w-14 h-12 flex flex-col items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <span className="text-sm font-bold">+30</span>
            <span className="text-[9px] text-gray-500">秒</span>
          </button>

          {/* 下一章 */}
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`w-14 h-12 flex flex-col items-center justify-center rounded-xl transition-all
              ${hasNext ? 'text-white bg-white/10 hover:bg-white/20 active:scale-95' : 'text-gray-600 bg-white/5 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
            <span className="text-[9px] mt-0.5">下一章</span>
          </button>

          {/* 返回列表 */}
          <button
            onClick={goToBook}
            className="w-14 h-12 flex flex-col items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-[9px] text-gray-500">列表</span>
          </button>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onCanPlay={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
