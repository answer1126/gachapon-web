import { createClient } from 'redis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let client;
  try {
    // 1. 確保有抓到 Vercel 發放的密碼
    if (!process.env.REDIS_URL) {
      return NextResponse.json({ error: '找不到資料庫密碼' }, { status: 500 });
    }

    // 2. 每次呼叫 API 時，建立新連線（開門）
    client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    const body = await req.json();
    const { action, payload } = body;
    let responseData: any = {};

    // 讀取庫存
    if (action === 'getPrizes') {
      const data = await client.get('ngaayho_prizes');
      responseData = { prizes: data ? JSON.parse(data) : [] };
    } 
    // 更新庫存
    else if (action === 'setPrizes') {
      await client.set('ngaayho_prizes', JSON.stringify(payload));
      responseData = { success: true };
    } 
    // 生成條碼
    else if (action === 'generateToken') {
      const data = await client.get('ngaayho_tokens');
      const tokens = data ? JSON.parse(data) : [];
      tokens.push(payload);
      await client.set('ngaayho_tokens', JSON.stringify(tokens));
      responseData = { success: true };
    } 
    // 檢查條碼
    else if (action === 'checkToken') {
      const data = await client.get('ngaayho_tokens');
      const tokens = data ? JSON.parse(data) : [];
      const target = tokens.find((t: any) => t.token === payload);
      responseData = { valid: target && !target.used };
    } 
    // 客人抽獎
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

    // 3. 執行完畢，安全關門！！！ (避免 Vercel 系統卡死的關鍵)
    await client.quit();

    if (responseData.error) {
      return NextResponse.json(responseData, { status: 400 });
    }
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error(error);
    // 發生錯誤時也要強制關門
    if (client && client.isOpen) {
      await client.quit();
    }
    return NextResponse.json({ error: error.message || '伺服器連線錯誤' }, { status: 500 });
  }
}