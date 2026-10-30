'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Mail, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ConsumerGachapon() {
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenStr, setTokenStr] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState<any>(null);
  const [theme, setTheme] = useState('halloween');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const savedTheme = localStorage.getItem('ngaayho_theme') || 'halloween';
      setTheme(savedTheme);

      if (!token) {
        setTokenValid(false);
        return;
      }
      setTokenStr(token);

      // 檢查 Token 是否已被使用
      const savedTokens = JSON.parse(localStorage.getItem('ngaayho_tokens') || '[]');
      const target = savedTokens.find((t: any) => t.token === token);
      if (target && target.used) {
        setTokenValid(false);
      } else {
        setTokenValid(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.toLowerCase().endsWith('@gmail.com')) {
      alert('請填寫正確有效的 Gmail 帳號（需以 @gmail.com 結尾）');
      return;
    }
    setIsLoggedIn(true);
  };

  const spinGachapon = async () => {
    if (isSpinning || showResult) return;
    setIsSpinning(true);

    // 讀取當前獎品池
    const savedPrizes = JSON.parse(localStorage.getItem('ngaayho_prizes') || '[]');
    const available = savedPrizes.filter((p: any) => p.count > 0);
    const selected = available.length > 0 
      ? available[Math.floor(Math.random() * available.length)]
      : { id: 'default', name: '萬聖紀念貼紙', type: 'physical' };

    // 若為 300 元折價券，拆分成 3 組 100 元專屬代碼
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

    // 扣除 1 顆庫存
    const updatedPrizes = savedPrizes.map((p: any) => 
      p.id === selected.id ? { ...p, count: Math.max(0, p.count - 1) } : p
    );
    localStorage.setItem('ngaayho_prizes', JSON.stringify(updatedPrizes));

    // 標記該 Token 為已使用
    const savedTokens = JSON.parse(localStorage.getItem('ngaayho_tokens') || '[]');
    const updatedTokens = savedTokens.map((t: any) => 
      t.token === tokenStr ? { ...t, used: true, usedBy: userEmail } : t
    );
    localStorage.setItem('ngaayho_tokens', JSON.stringify(updatedTokens));

    setTimeout(async () => {
      setIsSpinning(false);
      setWonPrize({ ...selected, promoCodes });
      setShowResult(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      // 若為優惠券，自動發信
      if (selected.type === 'coupon') {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail,
              prizeTitle: selected.name,
              promoCodes,
              terms: selected.terms || []
            }),
          });
        } catch (err) {
          console.error(err);
        }
      }
    }, 2000);
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-2xl max-w-sm w-full">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">QR Code 無效或已使用完畢</h2>
          <p className="text-sm text-slate-400">此抽獎連結已被使用過或已失效。若需抽獎，請向現場工作人員索取最新的專屬 QR Code。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans ${
      theme === 'halloween' ? 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-amber-100' : 'bg-stone-900 text-stone-100'
    }`}>
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-amber-500/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Nga&apos;ayho Tainan</span>
          <h1 className="text-2xl font-extrabold text-amber-300 mt-1">原味台南文創坊・萬聖扭蛋</h1>
          <p className="text-xs text-slate-400 mt-1">單次限定抽獎・陶珠、文創禮與專屬折扣</p>
        </header>

        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="w-full space-y-4 my-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-left">
              <label className="text-xs font-bold text-amber-200 block mb-1">請輸入您的 Google 帳號 (Gmail)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">抽中優惠券將直接發送電子憑證至此信箱，現場憑信件代碼進行核銷。</p>
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              登入並開始抽獎 <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 mb-6 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 已登入：{userEmail}
            </div>

            {/* 扭蛋機轉動外觀視覺 */}
            <div className={`relative w-48 h-48 rounded-full border-4 ${isSpinning ? 'animate-spin border-amber-400' : 'border-amber-500/40'} bg-gradient-to-tr from-amber-950/40 to-purple-900/40 flex items-center justify-center shadow-inner my-4`}>
              <Sparkles className={`w-16 h-16 text-amber-400 ${isSpinning ? 'scale-125 transition-transform' : ''}`} />
            </div>

            {!showResult ? (
              <button
                disabled={isSpinning}
                onClick={spinGachapon}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {isSpinning ? '幸運轉動中...' : '旋轉扭蛋機'}
              </button>
            ) : (
              <div className="w-full bg-slate-800 border border-amber-400/40 p-5 rounded-2xl mt-4 text-center">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">恭喜獲得</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-3">{wonPrize?.name}</h3>

                {wonPrize?.promoCodes && wonPrize.promoCodes.length > 0 && (
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 my-3">
                    <span className="text-xs text-slate-400 block mb-1">專屬優惠代碼 (已同步寄至信箱)：</span>
                    <div className="space-y-1">
                      {wonPrize.promoCodes.map((c: string, idx: number) => (
                        <div key={idx} className="font-mono text-sm font-bold text-amber-300 tracking-wider">
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-400">憑證已寄至您的信箱與官方後台，現場出示即可使用！</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}