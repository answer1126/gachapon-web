import { createClient } from 'redis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let client;
  try {
    const redisUrl = process.env.STORAGE_URL || process.env.REDIS_URL || process.env.KV_URL;
    if (!redisUrl) return NextResponse.json({ error: '找不到資料庫密碼' }, { status: 500 });

    client = createClient({ url: redisUrl });
    await client.connect();

    const body = await req.json();
    const { action, payload } = body;
    let responseData: any = {};

    // 升級至 v4 確保全新連線
    if (action === 'getPrizes') {
      const data = await client.get('ngaayho_prizes_v4');
      responseData = { prizes: data ? JSON.parse(data) : [] };
    } 
    else if (action === 'setPrizes') {
      await client.set('ngaayho_prizes_v4', JSON.stringify(payload));
      responseData = { success: true };
    } 
    else if (action === 'generateToken') {
      const data = await client.get('ngaayho_tokens_v4');
      const tokens = data ? JSON.parse(data) : [];
      tokens.push(payload);
      await client.set('ngaayho_tokens_v4', JSON.stringify(tokens));
      responseData = { success: true };
    } 
    else if (action === 'spin') {
      const { tokenStr, userEmail } = payload;
      const tokensData = await client.get('ngaayho_tokens_v4');
      const tokens = tokensData ? JSON.parse(tokensData) : [];
      const tokenIdx = tokens.findIndex((t: any) => t.token === tokenStr);
      
      if (tokenIdx === -1 || tokens[tokenIdx].used) {
        responseData = { error: '此 QR Code 已失效' };
      } else {
        const prizesData = await client.get('ngaayho_prizes_v4');
        const prizes = prizesData ? JSON.parse(prizesData) : [];
        const available = prizes.filter((p: any) => p.count > 0);
        
        const selected = available.length > 0 
          ? available[Math.floor(Math.random() * available.length)]
          : { id: 'default', name: '精美明信片', type: 'physical' };

        // 自動扣除庫存
        if (selected.id !== 'default') {
          const updatedPrizes = prizes.map((p: any) => 
            p.id === selected.id ? { ...p, count: Math.max(0, p.count - 1) } : p
          );
          await client.set('ngaayho_prizes_v4', JSON.stringify(updatedPrizes));
        }

        // 註記條碼已使用
        tokens[tokenIdx].used = true;
        tokens[tokenIdx].usedBy = userEmail;
        await client.set('ngaayho_tokens_v4', JSON.stringify(tokens));

        // 產生專屬優惠碼邏輯
        let promoCodes: string[] = [];
        if (selected.name.includes('300元')) {
          promoCodes = [
            `NGAAYHO-100-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            `NGAAYHO-100-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            `NGAAYHO-100-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
          ];
        } else if (selected.type === 'coupon') {
          promoCodes = [`NGAAYHO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`];
        }

        // 🔔 實體與折價券全面寄信邏輯
        try {
          const promoText = promoCodes.length > 0 
            ? `\n專屬優惠碼:\n${promoCodes.join('\n')}` 
            : '\n(實體獎項，無專屬優惠碼)';
            
          await fetch(new URL('/api/send-email', req.url).toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'answer731126@gmail.com',
              subject: `【扭蛋機核銷】顧客 ${userEmail} 抽中 ${selected.name}`,
              text: `顧客 Gmail: ${userEmail}\n抽中獎項: ${selected.name}${promoText}`
            })
          });
        } catch (e) {
          console.error('寄信失敗，但不影響客人畫面', e);
        }

        responseData = { wonPrize: { ...selected, promoCodes } };
      }
    }

    await client.quit();
    if (responseData.error) return NextResponse.json(responseData, { status: 400 });
    return NextResponse.json(responseData);

  } catch (error: any) {
    if (client && client.isOpen) await client.quit();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}