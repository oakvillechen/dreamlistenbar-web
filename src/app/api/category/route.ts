import { NextRequest, NextResponse } from 'next/server';

// 后端 URL
const BACKEND_URL = process.env.BACKEND_URL || 'https://dreamlistenbar-backend.onrender.com';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id') || 'latest';
  const page = searchParams.get('page') || '0';

  try {
    // 使用后端
    const res = await fetch(`${BACKEND_URL}/api/category?id=${id}&page=${page}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Category error:', error);
    return NextResponse.json({ success: false, list: [] });
  }
}
