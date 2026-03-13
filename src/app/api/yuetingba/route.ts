import { NextRequest, NextResponse } from 'next/server';

// Vercel Edge Function - 直接调用悦听吧 API（无需后端）
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const keyword = searchParams.get('keyword');
  const page = searchParams.get('page') || '0';

  try {
    let targetUrl = '';
    
    switch (type) {
      case 'category':
        targetUrl = `https://yuetingba.cn/api/book/list?category=${id || 'latest'}&page=${page}`;
        break;
      case 'search':
        if (!keyword) {
          return NextResponse.json({ success: false, error: 'Missing keyword' }, { status: 400 });
        }
        targetUrl = `https://yuetingba.cn/api/book/search?keyword=${encodeURIComponent(keyword)}`;
        break;
      case 'book':
        if (!id) {
          return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
        }
        // 并行获取书籍详情和章节
        const [detailRes, chaptersRes] = await Promise.all([
          fetch(`https://yuetingba.cn/api/book/detail/${id}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
              'Accept': 'application/json',
            },
          }),
          fetch(`https://yuetingba.cn/api/book/chapters/${id}?page=${page}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
              'Accept': 'application/json',
            },
          }),
        ]);
        
        const detailData = await detailRes.json();
        const chaptersData = await chaptersRes.json();
        
        return NextResponse.json({
          success: true,
          book: detailData.data || {},
          chapters: chaptersData.list || [],
          tabs: chaptersData.tabs || [],
        });
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
