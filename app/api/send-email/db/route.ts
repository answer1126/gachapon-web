import { createClient } from 'redis';
import { NextResponse } from 'next/server';

// 使用 Vercel 新版自動提供的 REDIS_URL
const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis 連線錯誤', err));

export async function POST(req: Request) {
  try {
    // 確保資料庫連線開啟
    if (!client.isOpen) {
      await client.connect();
    }

    const body = await req.json();
    const { action, payload } = body;

    // 讀取獎品庫存
    if (action === 'getPrizes') {
      const data = await client.get('ngaayho_prizes');
      const prizes = data ? JSON.parse(data) : [];
      return NextResponse.json({ prizes });
    }

    // 更新獎品庫存
    if (action === 'setPrizes') {
      await client.set('ngaayho_prizes', JSON.stringify(payload));
      return NextResponse.json({ success: true });
    }

    // 生成單次抽獎 QR 碼權限
    if (action === 'generateToken') {
      const data = await client.get('ngaayho_tokens');
      const tokens = data ? JSON.parse(data) : [];
      tokens.push(payload);
      await client.set('ngaayho_tokens', JSON.stringify(tokens));
      return NextResponse.json({ success: true });
    }

    // 客人掃描時驗證 QR Code
    if (action === 'checkToken') {
      const data = await client.get('ngaayho_tokens');
      const tokens = data ? JSON.parse(data) : [];
      const target = tokens.find((t: any) => t.token === payload);
      return NextResponse.json({ valid: target && !target.used });
    }

    // 客人按下抽獎
    if (action === 'spin') {
      const { tokenStr, userEmail } = payload;
      
      const tokensData = await client.get('ngaayho_tokens');
      const tokens = tokensData ? JSON.parse(tokensData) : [];
      const tokenIdx = tokens.findIndex((t: any) => t.token === tokenStr);
      
      if (tokenIdx === -1 || tokens[tokenIdx].used) {
        return NextResponse.json({ error: '此 QR Code 已失效' }, { status: 400 });
      }

      const prizesData = await client.get('ngaayho_prizes');
      const prizes = prizesData ? JSON.parse(prizesData) : [];
      const available = prizes.filter((p: any) => p.count > 0);
      const selected = available.length > 0 
        ? available[Math.floor(Math.random() * available.length)]
        : { id: 'default', name: '萬聖紀念貼紙', type: 'physical' };

      // 扣除庫存
      if (selected.id !== 'default') {
        const updatedPrizes = prizes.map((p: any) => 
          p.id === selected.id ? { ...p, count: Math.max(0, p.count - 1) } : p
        );
        await client.set('ngaayho_prizes', JSON.stringify(updatedPrizes));
      }

      // 註記 QR code 已使用
      tokens[tokenIdx].used = true;
      tokens[tokenIdx].usedBy = userEmail;
      await client.set('ngaayho_tokens', JSON.stringify(tokens));

      // 產生結帳條碼
      let promoCodes: string[] = [];
      if (selected.name.includes('300')) {
        promoCodes = [
          `NT-100-A-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          `NT-100-B-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          `NT-100-C-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        ];
      } else if (selected.type === 'coupon') {
        promoCodes = [`NT-PROMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`];
      }

      return NextResponse.json({ wonPrize: { ...selected, promoCodes } });
    }

    return NextResponse.json({ error: '未知動作' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '伺服器連線錯誤' }, { status: 500 });
  }
}