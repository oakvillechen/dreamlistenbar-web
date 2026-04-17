'use client';

import { useEffect, useState } from 'react';

interface CleanPlayerProps {
  tingId: string;
  onClose: () => void;
}

export default function CleanPlayer({ tingId, onClose }: CleanPlayerProps) {
  const [proxyUrl, setProxyUrl] = useState('');
  // 优先使用 NEXT_PUBLIC_ 变量
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dreamlistenbar-backend.onrender.com';

  useEffect(() => {
    // 设置指向我们后端的净化代理 URL
    setProxyUrl(`${BACKEND_URL}/api/yuetingba/clean-player/${tingId}`);
  }, [tingId, BACKEND_URL]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[80vh] bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col slide-in-from-bottom-8 animate-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">原站播放助手 (Ad-Free Mode)</h3>
              <p className="text-[10px] text-gray-400">正在通过安全代理加载并过滤广告...</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Iframe Content */}
        <div className="flex-1 w-full relative bg-black">
          {proxyUrl ? (
            <iframe
              src={proxyUrl}
              className="w-full h-full border-0"
              title="CleanPlayer"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-500">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">加载播放器设置...</p>
            </div>
          )}
          
          {/* Overlay to inform the user */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 rounded-full text-[10px] text-indigo-300 pointer-events-none uppercase tracking-widest z-10 font-bold shadow-lg">
            🛡️ Ad-Blocking Active
          </div>
        </div>
        
        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-900/80 text-[10px] text-gray-500 border-t border-white/5 flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            已自动屏蔽 Google 广告
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            视频广告提速 16x 自动跳过
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            提示：由后端代理安全传输
          </span>
        </div>
      </div>
    </div>
  );
}
