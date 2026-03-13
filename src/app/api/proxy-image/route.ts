import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new Response('Missing url', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      },
    });

    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/webp';

    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response('Proxy failed', { status: 500 });
  }
}
