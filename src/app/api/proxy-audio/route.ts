import { NextRequest } from 'next/server';

// 后端 URL
const BACKEND_URL = process.env.BACKEND_URL || 'https://dreamlistenbar-backend.onrender.com';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new Response('Missing url', { status: 400 });
  }

  try {
    // 转发给后端处理，或者直接在这里处理
    // 为了统一逻辑，我们转发给后端
    const res = await fetch(`${BACKEND_URL}/api/proxy-audio?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Referer': 'http://yuetingba.cn/'
      }
    });

    if (!res.ok) {
      return new Response('Failed to fetch audio from backend', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'audio/mpeg';
    const contentLength = res.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(res.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Proxy audio error:', error);
    return new Response('Proxy failed', { status: 500 });
  }
}
