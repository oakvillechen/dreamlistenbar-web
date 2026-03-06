import { NextRequest, NextResponse } from 'next/server';

// 音频抓取需要 Playwright，只能用本地后端
// Render 后端内存不足，无法运行 Playwright
const LOCAL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://unabasing-maximus-consciously.ngrok-free.dev';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const tingId = searchParams.get('tingId');

  if (!url && !tingId) {
    return NextResponse.json(
      { success: false, error: 'Missing url or tingId parameter' },
      { status: 400 }
    );
  }

  try {
    const targetUrl = tingId 
      ? `http://yuetingba.cn/book/Ting/${tingId}`
      : url;

    // 使用本地后端（Playwright）
    const res = await fetch(`${LOCAL_BACKEND}/api/audio?url=${encodeURIComponent(targetUrl)}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Audio extraction error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to extract audio. Make sure local backend is running.' },
      { status: 500 }
    );
  }
}
