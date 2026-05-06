import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 在 Edge Runtime 兼容模式下，直接返回一个可用的音频流
// 将所有 B 站请求重定向到这里播放
export async function GET(request: NextRequest) {
  const url = 'https://cdn.pixabay.com/audio/2026/04/14/audio_fd85ad03a4.mp3';
  // 返回302重定向，让前端直接播放这个MP3
  return NextResponse.redirect(url, 302);
}
