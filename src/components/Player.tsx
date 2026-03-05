'use client';

import { useEffect, useRef, useState } from 'react';

interface PlayerProps {
  audioUrl: string | null;
  title: string;
  cover: string;
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
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      setIsLoading(true);
      setError(null);
      
      const currentSrc = audioRef.current.currentSrc || audioRef.current.src;
      // Skip if the url is exactly the same to prevent loop
      if (currentSrc !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
      
      // Auto play when url changes
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Auto-play blocked by browser:', err);
        setIsPlaying(false);
      });
    }
  }, [audioUrl]);

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

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        Math.max(0, audioRef.current.currentTime + seconds),
        duration
      );
    }
  };

  const [speed, setSpeed] = useState(1);
  
  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 safe-bottom">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm -z-10"
        onClick={onClose}
      />
      
      {/* Player */}
      <div className="audio-player glass-card rounded-t-3xl p-4 mx-2">
        {/* Track Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/10 shrink-0">
            {cover ? (
              <img
                src={cover}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🎧
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLoading ? '加载中...' : error || `${formatTime(currentTime)} / ${formatTime(duration)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
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
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Speed */}
          <button
            onClick={changeSpeed}
            className="w-10 h-10 flex items-center justify-center text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            {speed}x
          </button>

          {/* Skip Back */}
          <button
            onClick={() => handleSkip(-15)}
            className="p-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Prev */}
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`p-2 transition-colors ${hasPrev ? 'text-gray-300 hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading || !!error}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
              ${isLoading || error 
                ? 'bg-gray-600 cursor-not-allowed' 
                : isPlaying 
                  ? 'bg-indigo-500 playing' 
                  : 'bg-indigo-500 hover:bg-indigo-400'}`}
          >
            {isLoading ? (
              <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`p-2 transition-colors ${hasNext ? 'text-gray-300 hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => handleSkip(30)}
            className="p-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onCanPlay={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
