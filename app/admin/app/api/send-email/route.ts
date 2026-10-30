import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail, prizeTitle, promoCodes, terms } = await req.json();

    const termsListHtml = (terms || []).map((t: string) => `<li>${t}</li>`).join('');
    const promoDisplay = (promoCodes || []).join(' , ');

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #ea580c; text-align: center; margin-bottom: 8px;">【原味台南文創坊】扭蛋活動得獎憑證</h2>
        <p style="color: #4b5563; font-size: 15px;">親愛的貴賓您好，恭喜您在活動中抽中以下獎項：</p>
        
        <div style="background: #fff7ed; border: 2px dashed #f97316; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; color: #9a3412; font-size: 20px;">${prizeTitle}</h3>
          <p style="font-size: 14px; color: #7c2d12; margin: 10px 0 4px 0;">專屬優惠代碼：</p>
          <p style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #ea580c; margin: 0;">
            ${promoDisplay}
          </p>
        </div>

        <h4 style="color: #1f2937; margin-bottom: 8px;">優惠券使用規則：</h4>
        <ul style="font-size: 13px; color: #6b7280; line-height: 1.7; padding-left: 20px;">
          ${termsListHtml}
        </ul>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #f3f4f6;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">原味台南文創坊 保留活動調整與最終解釋之權利</p>
      </div>
    `;

    // 同步發送至顧客與品牌官方信箱
    await resend.emails.send({
      from: '原味台南文創坊 <onboarding@resend.dev>',
      to: [userEmail, 'answer731126@gmail.com'],
      subject: `【原味台南文創坊】扭蛋得獎通知：${prizeTitle}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('發信失敗:', error);
    return NextResponse.json({ error: '發送失敗' }, { status: 500 });
  }
}