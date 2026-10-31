'use client';
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Camera } from 'lucide-react';

export default function ConsumerGachapon() {
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenStr, setTokenStr] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (!token) {
        setTokenValid(false);
        return;
      }
      setTokenStr(token);

      // 連線雲端檢查 QR Code 是否有效
      fetch('/api/db', { method: 'POST', body: JSON.stringify({ action: 'checkToken', payload: token }) })
        .then(res => res.json())
        .then(data => setTokenValid(data.valid));
    }
  }, []);

  const spinGachapon = async () => {
    if (isSpinning || showResult) return;
    setIsSpinning(true);

    const res = await fetch('/api/db', { 
      method: 'POST', 
      body: JSON.stringify({ action: 'spin', payload: { tokenStr, userEmail } }) 
    });
    const data = await res.json();

    setTimeout(() => {
      setIsSpinning(false);
      if (data.error) {
        alert(data.error);
        return;
      }
      setWonPrize(data.wonPrize);
      setShowResult(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }, 2000);
  };

  if (tokenValid === null) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-bold">連線雲端讀取機率中...</div>;

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-2xl max-w-sm w-full">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">QR Code 無效或已兌換</h2>
          <p className="text-sm text-slate-400">此條碼已被使用。請向攤位工作人員索取新的 QR Code。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-amber-100">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-amber-500/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Nga&apos;ayho Tainan</span>
          <h1 className="text-2xl font-extrabold text-amber-300 mt-1">原味台南文創坊・萬聖扭蛋</h1>
        </header>

        {!isLoggedIn ? (
          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="w-full space-y-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-left">
              <label className="text-sm font-bold text-amber-200 block mb-2">請輸入您的稱呼或 Email</label>
              <input type="text" required value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-3 text-white focus:border-amber-400" placeholder="例如：王小明" />
            </div>
            <button type="submit" className="w-full bg-amber-500 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
              開始抽獎 <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className={`relative w-48 h-48 rounded-full border-4 ${isSpinning ? 'animate-spin border-amber-400' : 'border-amber-500/40'} bg-gradient-to-tr from-amber-950/40 to-purple-900/40 flex items-center justify-center shadow-inner my-4`}>
              <Sparkles className={`w-16 h-16 text-amber-400 ${isSpinning ? 'scale-125 transition-transform' : ''}`} />
            </div>

            {!showResult ? (
              <button disabled={isSpinning} onClick={spinGachapon} className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold py-4 rounded-xl shadow-lg disabled:opacity-50 text-lg">
                {isSpinning ? '雲端開獎中...' : '旋轉扭蛋機'}
              </button>
            ) : (
              <div className="w-full bg-slate-800 border-2 border-amber-400 p-5 rounded-2xl mt-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full bg-rose-600 text-white text-xs font-bold py-1.5 flex justify-center items-center gap-1 animate-pulse">
                  <Camera className="w-3.5 h-3.5" /> 請務必截圖保存本畫面！
                </div>
                
                <div className="mt-6">
                  <span className="text-sm text-amber-400 font-bold uppercase">恭喜獲得</span>
                  <h3 className="text-2xl font-black text-white mt-1 mb-3">{wonPrize?.name}</h3>

                  {wonPrize?.promoCodes && wonPrize.promoCodes.length > 0 && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 my-3">
                      <span className="text-xs text-slate-400 block mb-2">專屬結帳條碼：</span>
                      <div className="space-y-2">
                        {wonPrize.promoCodes.map((c: string, idx: number) => (
                          <div key={idx} className="font-mono text-lg font-bold text-amber-400 tracking-widest">{c}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm font-bold text-emerald-400 mt-4">👉 結帳時出示此截圖即可核銷</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}