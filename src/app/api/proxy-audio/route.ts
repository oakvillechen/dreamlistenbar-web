import { NextRequest } from 'next/server';

// 后端 URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new Response('Missing url', { status: 400 });
  }

  try {
    // 通过后端代理音频（后端添加了正确的 Referer 和 User-Agent）
    const res = await fetch(`${BACKEND_URL}/api/proxy-audio?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Range': request.headers.get('range') || '',
      },
    });

    if (!res.ok) {
      return new Response('Failed to fetch audio', { status: res.status });
    }

    const headers = new Headers();
    const contentType = res.headers.get('content-type') || 'audio/mpeg';
    const contentLength = res.headers.get('content-length');
    const contentRange = res.headers.get('content-range');

    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    if (contentRange) headers.set('Content-Range', contentRange);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(res.body, {
      status: contentRange ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy audio error:', error);
    return new Response('Proxy failed', { status: 500 });
  }
}
