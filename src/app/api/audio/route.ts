import { NextRequest, NextResponse } from 'next/server';

// 后端 URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tingId = searchParams.get('tingId');

  if (!tingId) {
    return NextResponse.json(
      { success: false, error: 'Missing tingId parameter' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/yuetingba/audio/${tingId}`, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30s - backend does server verification
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[AUDIO] Backend returned ${res.status}: ${text}`);
      return NextResponse.json(
        { success: false, error: `Backend error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (data.success && data.audioUrl) {
      return NextResponse.json({
        success: true,
        audio_url: data.audioUrl,
        audioServer: data.audioServer,
        title: data.title,
        tingNo: data.tingNo,
        verified: data.verified,
        source: 'yuetingba-api',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Backend returned no audio URL' },
      { status: 404 }
    );
  } catch (err: unknown) {
    console.error('[AUDIO] Error:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: '音频暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
