import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword') || searchParams.get('name');
  const type = searchParams.get('type') || '1';

  if (!keyword) {
    return NextResponse.json({ success: false, error: 'Missing keyword parameter' }, { status: 400 });
  }

  try {
    // 目标网站使用 name 参数
    const url = `http://yuetingba.cn/Search?type=${type}&name=${encodeURIComponent(keyword)}`;
    const { data: html } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(html);
    const books: {
      title: string;
      bookId: string;
      href: string;
      cover: string;
      author: string;
      speaker: string;
      summary: string;
    }[] = [];

    $('.section-box-list-item').each((_, el) => {
      const aNode = $(el).find('.box-list-item-text-title a');
      const title = aNode.text().trim();
      const href = aNode.attr('href');
      const bookId = href ? href.split('/')[3] : '';
      const cover = $(el).find('.box-list-item-img img').attr('src');
      const summary = $(el).find('.box-list-item-text-intro').text().trim();
      const authorText = $(el).find('span[title]').first().text().trim();
      const speakerText = $(el).find('span[title]').last().text().trim();

      if (title && bookId) {
        books.push({
          title,
          bookId,
          href: href || '',
          cover: cover ? (cover.startsWith('http') ? cover : 'http://yuetingba.cn' + cover) : '',
          author: authorText,
          speaker: speakerText,
          summary
        });
      }
    });

    return NextResponse.json({ success: true, list: books });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Search failed' },
      { status: 500 }
    );
  }
}
