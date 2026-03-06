'use client';

import { useState } from 'react';

export default function IndexPage() {
  const [tingId, setTingId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  // 添加单个章节
  const handleAddSingle = async () => {
    if (!tingId || !audioUrl) {
      setMessage('❌ 请填写章节ID和音频URL');
      return;
    }

    try {
      const res = await fetch('/api/audio-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tingId, audioUrl })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ 已添加！索引共 ${data.count} 章`);
        setTingId('');
        setAudioUrl('');
        setCount(data.count);
      } else {
        setMessage('❌ 添加失败: ' + data.error);
      }
    } catch (err) {
      setMessage('❌ 错误: ' + err.message);
    }
  };

  // 批量导入
  const handleImport = async () => {
    try {
      const data = JSON.parse(jsonInput);
      const chapters = data.chapters || [];
      
      if (chapters.length === 0) {
        setMessage('❌ 没有找到章节');
        return;
      }

      const res = await fetch('/api/audio-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapters })
      });
      const result = await res.json();
      
      if (result.success) {
        setMessage(`✅ 导入成功！${result.message}`);
        setCount(result.count);
        setJsonInput('');
      } else {
        setMessage('❌ 导入失败: ' + result.error);
      }
    } catch (err) {
      setMessage('❌ JSON 格式错误: ' + err.message);
    }
  };

  // 查看索引
  const handleView = async () => {
    try {
      const res = await fetch('/api/audio-index');
      const data = await res.json();
      setCount(data.count || 0);
      setMessage(`📋 索引共 ${data.count} 章`);
    } catch (err) {
      setMessage('❌ 查询失败: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📚 音频索引管理</h1>

        {/* 快速添加 */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">快速添加章节</h2>
          <p className="text-gray-400 text-sm mb-3">
            在悦听吧打开章节页，从开发者工具找到 .mp3 URL
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={tingId}
              onChange={(e) => setTingId(e.target.value)}
              placeholder="章节ID (如: 3a1c0241-acb4-6dd3-1783-861a9852d12c)"
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm"
            />
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="音频URL (如: http://185.242.234.59:36512/...mp3)"
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm"
            />
            <button
              onClick={handleAddSingle}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 text-sm"
            >
              添加
            </button>
          </div>
        </div>

        {/* 批量导入 */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">批量导入</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`JSON 格式:
{
  "chapters": [
    { "id": "xxx", "audioUrl": "http://..." },
    { "id": "yyy", "audioUrl": "http://..." }
  ]
}`}
            className="w-full h-40 bg-gray-700 rounded border border-gray-600 p-2 text-sm font-mono"
          />
          <button
            onClick={handleImport}
            className="mt-2 px-4 py-2 bg-green-600 rounded hover:bg-green-500 text-sm"
          >
            批量导入
          </button>
        </div>

        {/* 操作按钮 */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <button
            onClick={handleView}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            查看索引数量
          </button>
          <span className="ml-4 text-gray-400">索引: {count} 章</span>
        </div>

        {/* 消息 */}
        {message && (
          <div className="bg-gray-800 rounded-lg p-4 text-sm">
            {message}
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
          <h2 className="text-white font-semibold mb-2">📖 使用说明</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>在悦听吧打开任意章节播放页</li>
            <li>按 F12 打开开发者工具</li>
            <li>切换到 Network 标签</li>
            <li>找到 .mp3 文件，右键 → Copy → Copy URL</li>
            <li>粘贴到上方的「音频URL」输入框</li>
            <li>从页面URL复制章节ID</li>
            <li>点击「添加」</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
