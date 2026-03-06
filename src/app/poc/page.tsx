'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * POC: 测试前端直接从悦听吧页面提取音频链接
 * 方案：iframe + postMessage
 */
export default function AudioExtractPOC() {
  const [tingId, setTingId] = useState('3a1c0241-acb4-6dd3-1783-861a9852d12c');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // 方案1: 直接访问页面，尝试从 iframe 提取
  const testIframeExtract = () => {
    addLog('测试 iframe 方案...');
    // 注意：由于跨域限制，这个方案可能无法工作
    // 悦听吧可能没有设置 X-Frame-Options 或 CSP
    const url = `https://yuetingba.cn/book/Ting/${tingId}`;
    setProxyUrl(url);
  };

  // 方案2: 使用 CORS 代理
  const testCorsProxy = async () => {
    addLog('测试 CORS 代理方案...');
    
    // 公共 CORS 代理列表
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://yuetingba.cn/book/Ting/${tingId}`)}`,
      `https://corsproxy.io/?${encodeURIComponent(`https://yuetingba.cn/book/Ting/${tingId}`)}`,
    ];

    for (const proxy of corsProxies) {
      try {
        addLog(`尝试代理: ${proxy.split('?')[0]}...`);
        const res = await fetch(proxy);
        const html = await res.text();
        
        // 尝试提取音频链接
        const audioMatch = html.match(/https?:\/\/[^\s"']+\.(m4a|mp3)/i);
        if (audioMatch) {
          addLog(`✅ 找到音频链接: ${audioMatch[0].substring(0, 50)}...`);
          setAudioUrl(audioMatch[0]);
          return;
        }
        
        addLog(`❌ 未找到音频链接，HTML 长度: ${html.length}`);
      } catch (err) {
        addLog(`❌ 代理失败: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  // 方案3: 使用 YQL (Yahoo Query Language)
  const testYQL = async () => {
    addLog('测试 YQL 方案...');
    const url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22${encodeURIComponent(`https://yuetingba.cn/book/Ting/${tingId}`)}%22&format=json`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      addLog(`YQL 响应: ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (err) {
      addLog(`❌ YQL 失败: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // 方案4: 检查悦听吧是否有公开 API
  const testPublicAPI = async () => {
    addLog('测试悦听吧公开 API...');
    
    // 尝试不同的 API 端点
    const endpoints = [
      `https://yuetingba.cn/api/audio/${tingId}`,
      `https://yuetingba.cn/api/play/${tingId}`,
      `https://yuetingba.cn/api/chapter/${tingId}`,
      `https://yuetingba.cn/api/Ting/${tingId}`,
    ];

    for (const endpoint of endpoints) {
      try {
        addLog(`尝试: ${endpoint}`);
        const res = await fetch(endpoint, {
          headers: { 'Accept': 'application/json' }
        });
        const text = await res.text();
        addLog(`响应 (${res.status}): ${text.substring(0, 100)}...`);
      } catch (err) {
        addLog(`❌ 失败: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  // 测试当前后端方案
  const testCurrentBackend = async () => {
    addLog('测试当前后端方案 (ngrok)...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://unabasing-maximus-consciously.ngrok-free.dev';
    
    try {
      const res = await fetch(`${backendUrl}/api/audio?url=https://yuetingba.cn/book/Ting/${tingId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      
      if (data.success && data.audio_url) {
        addLog(`✅ 后端成功: ${data.audio_url.substring(0, 50)}...`);
        setAudioUrl(data.audio_url);
      } else {
        addLog(`❌ 后端失败: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      addLog(`❌ 后端请求失败: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🎵 音频提取 POC</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">章节 ID (tingId)</label>
            <input
              type="text"
              value={tingId}
              onChange={(e) => setTingId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={testIframeExtract} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
              iframe 方案
            </button>
            <button onClick={testCorsProxy} className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500">
              CORS 代理
            </button>
            <button onClick={testYQL} className="px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-500">
              YQL 方案
            </button>
            <button onClick={testPublicAPI} className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500">
              公开 API
            </button>
            <button onClick={testCurrentBackend} className="col-span-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500">
              当前后端 (ngrok)
            </button>
          </div>

          {audioUrl && (
            <div className="p-4 bg-green-900/50 rounded-lg border border-green-700">
              <p className="text-sm text-green-300 mb-2">✅ 音频链接:</p>
              <p className="text-xs text-green-200 break-all">{audioUrl}</p>
              <audio controls src={audioUrl} className="w-full mt-2" />
            </div>
          )}

          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">📋 日志:</p>
            <div className="h-64 overflow-y-auto space-y-1 text-xs font-mono">
              {logs.map((log, i) => (
                <p key={i} className="text-gray-300">{log}</p>
              ))}
            </div>
          </div>

          {proxyUrl && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">🔗 iframe:</p>
              <iframe
                ref={iframeRef}
                src={proxyUrl}
                className="w-full h-48 bg-white rounded"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">📊 方案评估</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-2">方案</th>
                <th className="pb-2">可行性</th>
                <th className="pb-2">优点</th>
                <th className="pb-2">缺点</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr>
                <td className="py-1">iframe + postMessage</td>
                <td>❌</td>
                <td>纯前端</td>
                <td>跨域限制，X-Frame-Options</td>
              </tr>
              <tr>
                <td className="py-1">CORS 代理</td>
                <td>⚠️</td>
                <td>简单</td>
                <td>依赖第三方，不稳定</td>
              </tr>
              <tr>
                <td className="py-1">YQL</td>
                <td>❌</td>
                <td>Yahoo 提供</td>
                <td>已废弃</td>
              </tr>
              <tr>
                <td className="py-1">Vercel Edge</td>
                <td>❌</td>
                <td>无需后端</td>
                <td>悦听吧 IP 封锁</td>
              </tr>
              <tr>
                <td className="py-1">本地后端</td>
                <td>✅</td>
                <td>稳定可靠</td>
                <td>需要保持运行</td>
              </tr>
              <tr>
                <td className="py-1">云服务器</td>
                <td>✅</td>
                <td>24/7 运行</td>
                <td>需要付费</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <a href="/" className="text-indigo-400 hover:text-indigo-300">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
