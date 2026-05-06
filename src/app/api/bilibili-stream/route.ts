import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 从 B 站直播间 ID 获取真实流地址（Edge 运行时兼容）
async function getBilibiliStreamUrl(roomId: string): Promise<string | null> {
  try {
    // 1. 获取直播间信息
    const infoRes = await fetch(
      `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!infoRes.ok) throw new Error('Room info fetch failed');
    const info = await infoRes.json();
    const realRoomId = info?.data?.room_id;
    if (!realRoomId) throw new Error('Invalid room ID');

    // 2. 获取直播流地址
    const streamRes = await fetch(
      `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${realRoomId}&platform=web&qn=0`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!streamRes.ok) throw new Error('Stream URL fetch failed');
    const streamData = await streamRes.json();
    const durl = streamData?.data?.durl;
    if (!durl || durl.length === 0) throw new Error('No stream URL');

    // 返回第一个可用的 flv 地址
    return durl[0].url;
  } catch (error) {
    console.error('Bilibili stream error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('room_id') || '27519423'; // 默认 Lofi Girl 旧房间号

  const streamUrl = await getBilibiliStreamUrl(roomId);

  if (!streamUrl) {
    return NextResponse.json({ error: 'Failed to retrieve stream' }, { status: 502 });
  }

  // 302 重定向到真实流地址（客户端直接播放）
  // 注意：部分浏览器可能因为跨域限制无法播放，此处仅为示例
  return NextResponse.redirect(streamUrl, 302);
}
