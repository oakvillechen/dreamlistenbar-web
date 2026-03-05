import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Referer': 'http://yuetingba.cn/',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch audio' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const contentLength = response.headers.get('content-length');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    return new Response(response.body, { status: 200, headers });
  } catch (err) {
    console.error('[PROXY] Error:', err);
    return new Response(JSON.stringify({ error: 'Proxy failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
