import { NextRequest, NextResponse } from 'next/server';

// 后端 URL（Render 部署）
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dreamlistenbar-backend.onrender.com';

// 本地开发后端
const LOCAL_BACKEND = 'http://localhost:3001';

// 缓存已知可用的音频 URL（包括 token）
const workingUrls = new Map<string, { url: string; timestamp: number }>();
const failedUrls = new Set<string>();

// 已知可用的服务器（从 assl 解密中获取）
const KNOWN_WORKING_SERVERS = [
  'http://183.162.112.199:35661',  // 忠诚等新书
  'http://185.242.234.59:36512',   // 仙逆等
  'http://185.242.232.69:36512',
  'http://106.13.91.31:45321',
  'http://183.162.112.199:52001',
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tingId = searchParams.get('tingId');

  if (!tingId) {
    return NextResponse.json(
      { success: false, error: 'Missing tingId parameter' },
      { status: 400 }
    );
  }

  // 检查缓存中是否有已知可用的 URL
  const cached = workingUrls.get(tingId);
  if (cached && Date.now() - cached.timestamp < 3600000) { // 1小时缓存
    return NextResponse.json({ 
      success: true, 
      audio_url: cached.url,
      source: 'cache',
      cached: true
    });
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
      
      if (data.success && data.audioPath) {
        // 获取可用服务器列表（从后端返回或使用已知列表）
        const servers = data.availableServers || KNOWN_WORKING_SERVERS;
        
        // 尝试所有服务器
        for (const server of servers) {
          const audioUrl = `${server}${data.audioPath}`;
          
          // 跳过已知失败的 URL
          if (failedUrls.has(audioUrl)) {
            continue;
          }
          
          // 快速验证音频 URL 是否可访问
          try {
            const headRes = await fetch(audioUrl, { 
              method: 'HEAD',
              signal: AbortSignal.timeout(5000),
            });
            
            if (headRes.ok) {
              console.log(`[AUDIO] Found working server: ${server}`);
              // 缓存可用的 URL
              workingUrls.set(tingId, { url: audioUrl, timestamp: Date.now() });
              
              return NextResponse.json({ 
                success: true, 
                audio_url: audioUrl,
                audioServer: server,
                title: data.title,
                tingNo: data.tingNo,
                source: 'yuetingba-api',
                verified: true
              });
            } else {
              console.log(`[AUDIO] Server ${server} returned ${headRes.status}`);
              failedUrls.add(audioUrl);
            }
          } catch (verifyErr) {
            console.log(`[AUDIO] Server ${server} failed:`, verifyErr instanceof Error ? verifyErr.message : 'Unknown');
            failedUrls.add(audioUrl);
          }
        }
        
        // 如果后端返回了 audioUrl（带 token），直接验证它
        if (data.audioUrl && !failedUrls.has(data.audioUrl)) {
          try {
            const headRes = await fetch(data.audioUrl, { 
              method: 'HEAD',
              signal: AbortSignal.timeout(5000),
            });
            
            if (headRes.ok) {
              workingUrls.set(tingId, { url: data.audioUrl, timestamp: Date.now() });
              return NextResponse.json({ 
                success: true, 
                audio_url: data.audioUrl,
                audioServer: data.audioServer,
                title: data.title,
                tingNo: data.tingNo,
                source: 'yuetingba-api',
                verified: true
              });
            }
          } catch (e) {
            failedUrls.add(data.audioUrl);
          }
        }
        
        // 所有服务器都失败
        console.log(`[AUDIO] All servers failed for tingId: ${tingId}`);
      }
    } catch (err: unknown) {
      console.log(`Backend ${backend} failed:`, err instanceof Error ? err.message : 'Unknown error');
      continue;
    }
  }

  // 所有后端都失败或音频不可用
  return NextResponse.json(
    { success: false, error: '音频暂时不可用，该章节可能已被下架或服务器维护中' },
    { status: 404 }
  );
}
