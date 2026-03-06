import { NextRequest, NextResponse } from 'next/server';

// Render 后端 URL
const RENDER_URL = 'https://dreamlistenbar-backend.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '0';

  try {
    // 使用 Render 后端
    const res = await fetch(`${RENDER_URL}/api/book/${id}?page=${page}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book detail error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch book' });
  }
}
