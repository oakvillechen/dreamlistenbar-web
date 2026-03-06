import { NextRequest, NextResponse } from 'next/server';

// Render 后端 URL
const RENDER_URL = 'https://dreamlistenbar-backend.onrender.com';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword') || searchParams.get('name');

  if (!keyword) {
    return NextResponse.json({ success: false, error: 'Missing keyword parameter' }, { status: 400 });
  }

  try {
    // 使用 Render 后端
    const res = await fetch(`${RENDER_URL}/api/search?keyword=${encodeURIComponent(keyword)}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, list: [] });
  }
}
