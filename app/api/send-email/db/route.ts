import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    // 讀取獎品庫存
    if (action === 'getPrizes') {
      const prizes = await kv.get('ngaayho_prizes') || [];
      return NextResponse.json({ prizes });
    }

    // 品牌方更新獎品
    if (action === 'setPrizes') {
      await kv.set('ngaayho_prizes', payload);
      return NextResponse.json({ success: true });
    }

    // 品牌方產生新 QR Code 權限
    if (action === 'generateToken') {
      const tokens: any = await kv.get('ngaayho_tokens') || [];
      tokens.push(payload);
      await kv.set('ngaayho_tokens', tokens);
      return NextResponse.json({ success: true });
    }

    // 客人掃描時驗證 QR Code
    if (action === 'checkToken') {
      const tokens: any = await kv.get('ngaayho_tokens') || [];
      const target = tokens.find((t: any) => t.token === payload);
      if (!target || target.used) {
        return NextResponse.json({ valid: false });
      }
      return NextResponse.json({ valid: true });
    }

    // 客人按下抽獎按鈕
    if (action === 'spin') {
      const { tokenStr, userEmail } = payload;

      // 1. 再次驗證防弊
      const tokens: any = await kv.get('ngaayho_tokens') || [];
      const tokenIdx = tokens.findIndex((t: any) => t.token === tokenStr);
      if (tokenIdx === -1 || tokens[tokenIdx].used) {
        return NextResponse.json({ error: '此 QR Code 已失效' }, { status: 400 });
      }

      // 2. 抽獎並扣除雲端庫存
      const prizes: any = await kv.get('ngaayho_prizes') || [];
      const available = prizes.filter((p: any) => p.count > 0);
      const selected = available.length > 0 
        ? available[Math.floor(Math.random() * available.length)]
        : { id: 'default', name: '萬聖紀念貼紙', type: 'physical' };

      if (selected.id !== 'default') {
        const updatedPrizes = prizes.map((p: any) => 
          p.id === selected.id ? { ...p, count: Math.max(0, p.count - 1) } : p
        );
        await kv.set('ngaayho_prizes', updatedPrizes);
      }

      // 3. 註記該 QR Code 已被此客人使用
      tokens[tokenIdx].used = true;
      tokens[tokenIdx].usedBy = userEmail;
      await kv.set('ngaayho_tokens', tokens);

      // 4. 自動生成折扣碼
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
    return NextResponse.json({ error: '伺服器連線錯誤' }, { status: 500 });
  }
}