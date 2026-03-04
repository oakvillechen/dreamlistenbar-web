import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '0';

  try {
    const url = `http://yuetingba.cn/book/detail/${id}/${page}`;
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });

    const $ = cheerio.load(html);

    // Header Info
    const bookTitle = $('.feature-box-detail h1').text().trim() || $('.box-detail-item-title').text().trim();
    const cover = $('.book-info-img img, .box-detail-item-img img').attr('src');

    // Chapters
    const chapters: {
      tingId: string;
      title: string;
      url: string;
    }[] = [];

    $('.ting-list-content-item').each((_, el) => {
      const tId = $(el).attr('id')?.replace('item_', '');
      const title = $(el).find('a[title]').first().text().trim() || $(el).find('a').last().text().trim();
      if (tId && title) {
        chapters.push({ tingId: tId, title, url: `http://yuetingba.cn/book/Ting/${tId}` });
      }
    });

    // Tabs (Pagination)
    const tabs: { offset: string; text: string }[] = [];
    $('.nav-tabs li a').each((_, el) => {
      const tabHref = $(el).attr('href');
      const tabOffset = tabHref ? tabHref.split('/').pop() : '0';
      const tabText = $(el).text().trim();
      tabs.push({ offset: tabOffset || '0', text: tabText });
    });

    return NextResponse.json({
      success: true,
      book: {
        title: bookTitle,
        cover: cover ? 'http://yuetingba.cn' + cover : ''
      },
      chapters,
      tabs
    });
  } catch (err) {
    console.error('Book detail error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to fetch book' },
      { status: 500 }
    );
  }
}
