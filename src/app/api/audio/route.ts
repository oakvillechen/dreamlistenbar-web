import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Note: For full audio extraction with Playwright, deploy the backend separately
// This route uses a lightweight approach that may not work for all sources

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
    // Try to use the deployed backend for Playwright-based extraction
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    const targetUrl = tingId 
      ? `http://yuetingba.cn/book/Ting/${tingId}`
      : url;

    // First, try the backend (with Playwright)
    try {
      const backendResponse = await axios.get(`${backendUrl}/api/audio`, {
        params: { url: targetUrl },
        timeout: 30000,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (backendResponse.data.success && backendResponse.data.audio_url) {
        return NextResponse.json({
          success: true,
          audio_url: backendResponse.data.audio_url
        });
      }
    } catch (backendErr) {
      console.log('Backend unavailable, trying direct extraction...');
    }

    // Fallback: Direct extraction (limited)
    if (targetUrl) {
      const { data: html } = await axios.get(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      });

      const $ = cheerio.load(html);

      // Try to find audio URL in the page
      let audioUrl: string | null = null;

      // Check for audio elements
      $('audio, source').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !audioUrl) {
          audioUrl = src.startsWith('http') ? src : `http://yuetingba.cn${src}`;
        }
      });

      // Check for embedded audio URLs in scripts
      if (!audioUrl) {
        const scripts = $('script').toArray();
        for (const script of scripts) {
          const content = $(script).html() || '';
          const match = content.match(/(https?:\/\/[^\s"']+\.(m4a|mp3|m3u8)[^\s"']*)/i);
          if (match) {
            audioUrl = match[1];
            break;
          }
        }
      }

      if (audioUrl) {
        return NextResponse.json({ success: true, audio_url: audioUrl });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Could not extract audio URL. Please try again.' },
      { status: 404 }
    );
  } catch (err) {
    console.error('Audio extraction error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to extract audio' },
      { status: 500 }
    );
  }
}
