import { NextRequest, NextResponse } from 'next/server';

// 后端 URL（Render 部署）
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dreamlistenbar-backend.onrender.com';

// 本地开发后端
const LOCAL_BACKEND = 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tingId = searchParams.get('tingId');

  if (!tingId) {
    return NextResponse.json(
      { success: false, error: 'Missing tingId parameter' },
      { status: 400 }
    );
  }

  // 优先使用本地后端（如果可用）
  const backends = [LOCAL_BACKEND, BACKEND_URL];
  
  for (const backend of backends) {
    try {
      const res = await fetch(`${backend}/api/yuetingba/audio/${tingId}`, {
        headers: { 
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000), // 8秒超时
      });

      if (!res.ok) continue;
      
      const data = await res.json();
      
      if (data.success && data.audioUrl) {
        return NextResponse.json({ 
          success: true, 
          audio_url: data.audioUrl,
          audioServer: data.audioServer,
          title: data.title,
          tingNo: data.tingNo,
          source: 'yuetingba-api'
        });
      }
    } catch (err: unknown) {
      console.log(`Backend ${backend} failed:`, err instanceof Error ? err.message : 'Unknown error');
      continue;
    }
  }

  // 所有后端都失败
  return NextResponse.json(
    { success: false, error: 'All backends unavailable' },
    { status: 500 }
  );
}
