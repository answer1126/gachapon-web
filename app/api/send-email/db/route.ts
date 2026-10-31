import { createClient } from 'redis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let client;
  try {
    // 【關鍵修復】同時去抓 STORAGE_URL 或 REDIS_URL，防堵 Vercel 改名
    const redisUrl = process.env.STORAGE_URL || process.env.REDIS_URL || process.env.KV_URL;
    
    if (!redisUrl) {
      return NextResponse.json({ error: '找不到資料庫密碼，請確認 Vercel 的 Environment Variables 設定！' }, { status: 500 });
    }

    client = createClient({ url: redisUrl });
    await client.connect();

    const body = await req.json();
    const { action, payload } = body;
    let responseData: any = {};

    if (action === 'getPrizes') {
      const data = await client.get('ngaayho_prizes');
      responseData = { prizes: data ? JSON.parse(data) : [] };
    } 
    else if (action === 'setPrizes') {
      await client.set('ngaayho_prizes', JSON.stringify(payload));
      responseData = { success: true };
    } 
    else if (action === 'generateToken') {
      const data = await client.get('ngaayho_tokens');
      const tokens = data ? JSON.parse(data) : [];
      tokens.push(payload);
      await client.set('ngaayho_tokens', JSON.stringify(tokens));
      responseData = { success: true };
    } 
    else if (action === 'checkToken') {
      const data = await client.get('ngaayho_tokens');
      const tokens = data ? JSON.parse(data) : [];
      const target = tokens.find((t: any) => t.token === payload);
      responseData = { valid: target && !target.used };
    } 
    else if (action === 'spin') {
      const { tokenStr, userEmail } = payload;
      const tokensData = await client.get('ngaayho_tokens');
      const tokens = tokensData ? JSON.parse(tokensData) : [];
      const tokenIdx = tokens.findIndex((t: any) => t.token === tokenStr);
      
      if (tokenIdx === -1 || tokens[tokenIdx].used) {
        responseData = { error: '此 QR Code 已失效' };
      } else {
        const prizesData = await client.get('ngaayho_prizes');
        const prizes = prizesData ? JSON.parse(prizesData) : [];
        const available = prizes.filter((p: any) => p.count > 0);
        
        const selected = available.length > 0 
          ? available[Math.floor(Math.random() * available.length)]
          : { id: 'default', name: '萬聖紀念貼紙', type: 'physical' };

        if (selected.id !== 'default') {
          const updatedPrizes = prizes.map((p: any) => 
            p.id === selected.id ? { ...p, count: Math.max(0, p.count - 1) } : p
          );
          await client.set('ngaayho_prizes', JSON.stringify(updatedPrizes));
        }

        tokens[tokenIdx].used = true;
        tokens[tokenIdx].usedBy = userEmail;
        await client.set('ngaayho_tokens', JSON.stringify(tokens));

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
        responseData = { wonPrize: { ...selected, promoCodes } };
      }
    } else {
      responseData = { error: '未知動作' };
    }

    // 確實關閉連線，釋放資源
    await client.quit();
    
    if (responseData.error) {
      return NextResponse.json(responseData, { status: 400 });
    }
    return NextResponse.json(responseData);

  } catch (error: any) {
    if (client && client.isOpen) await client.quit();
    return NextResponse.json({ error: error.message || '伺服器連線錯誤' }, { status: 500 });
  }
}