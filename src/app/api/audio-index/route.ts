import { NextRequest, NextResponse } from 'next/server';

// 简单的内存索引存储
// 注意：Vercel 无状态，重启后会丢失
// 生产环境应使用数据库（如 Supabase）
const audioIndex: Record<string, string> = {};

// 获取索引
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tingId = searchParams.get('tingId');

  if (tingId) {
    const audioUrl = audioIndex[tingId];
    return NextResponse.json({ 
      success: !!audioUrl, 
      audioUrl,
      count: Object.keys(audioIndex).length 
    });
  }

  return NextResponse.json({ 
    success: true, 
    index: audioIndex,
    count: Object.keys(audioIndex).length 
  });
}

// 更新索引
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 批量添加
    if (body.chapters && Array.isArray(body.chapters)) {
      for (const ch of body.chapters) {
        if (ch.id && ch.audioUrl) {
          audioIndex[ch.id] = ch.audioUrl;
        }
      }
      return NextResponse.json({ 
        success: true, 
        message: `Added ${body.chapters.length} chapters`,
        count: Object.keys(audioIndex).length 
      });
    }
    
    // 单个添加
    if (body.tingId && body.audioUrl) {
      audioIndex[body.tingId] = body.audioUrl;
      return NextResponse.json({ 
        success: true, 
        message: 'Added',
        count: Object.keys(audioIndex).length 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid body. Expected { tingId, audioUrl } or { chapters: [{ id, audioUrl }] }' 
    }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
