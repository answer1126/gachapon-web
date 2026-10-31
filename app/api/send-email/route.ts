import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, text } = await req.json();

    // 建立 Gmail 發信引擎
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'answer731126@gmail.com',
        // 您的專屬應用程式密碼已成功寫入
        pass: 'ngnuhwtmcatdarol' 
      }
    });

    await transporter.sendMail({
      from: '"原味台南 扭蛋系統" <answer731126@gmail.com>',
      to,
      subject,
      text
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('發信失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}