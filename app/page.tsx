'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// ==========================================
// 🎨 滿版沉浸式 節慶主題視覺設定庫
// ==========================================
const THEME_STYLES: Record<string, any> = {
  halloween: {
    bg: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-black',
    cardTitle: 'text-orange-500', btn: 'bg-orange-600 hover:bg-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.6)]',
    border: 'border-orange-500', title: '🎃 HALLOWEEN 扭蛋機', emoji: '👻',
    decorations: [
      { e: '🦇', c: 'absolute top-10 left-10 text-5xl animate-bounce opacity-80' },
      { e: '🕷️', c: 'absolute top-1/4 right-5 text-4xl animate-pulse opacity-70' },
      { e: '🧙‍♀️', c: 'absolute top-20 right-1/4 text-6xl animate-bounce opacity-90' },
      { e: '🏚️', c: 'absolute bottom-0 left-1/2 -translate-x-1/2 text-[15rem] opacity-20' },
      { e: '🎃', c: 'absolute bottom-10 left-10 text-6xl opacity-90' },
      { e: '👻', c: 'absolute bottom-20 right-10 text-7xl animate-pulse opacity-80' }
    ]
  },
  christmas: {
    bg: 'bg-gradient-to-br from-green-900 via-emerald-950 to-red-950',
    cardTitle: 'text-red-600', btn: 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.6)]',
    border: 'border-red-500', title: '🎄 MERRY CHRISTMAS', emoji: '🎁',
    decorations: [
      { e: '❄️', c: 'absolute top-10 left-1/4 text-5xl animate-bounce opacity-60' },
      { e: '🎅', c: 'absolute top-20 right-10 text-7xl opacity-90' },
      { e: '🦌', c: 'absolute top-1/3 left-5 text-6xl animate-pulse opacity-80' },
      { e: '⛄', c: 'absolute bottom-5 right-20 text-[10rem] opacity-30' },
      { e: '🎁', c: 'absolute bottom-10 left-1/4 text-5xl' }
    ]
  },
  lunar: {
    bg: 'bg-gradient-to-b from-red-900 via-red-800 to-black',
    cardTitle: 'text-yellow-600', btn: 'bg-yellow-500 hover:bg-yellow-400 text-red-900 shadow-[0_0_15px_rgba(234,179,8,0.6)]',
    border: 'border-yellow-400', title: '🧨 迎春納福 扭蛋機', emoji: '🧧',
    decorations: [
      { e: '🏮', c: 'absolute top-5 left-10 text-6xl animate-pulse' },
      { e: '🏮', c: 'absolute top-5 right-10 text-6xl animate-pulse' },
      { e: '🧨', c: 'absolute top-1/3 left-5 text-5xl' },
      { e: '💰', c: 'absolute bottom-20 right-10 text-6xl animate-bounce' },
      { e: '🐉', c: 'absolute bottom-0 left-1/2 -translate-x-1/2 text-[12rem] opacity-20' }
    ]
  },
  dragon: {
    bg: 'bg-gradient-to-b from-emerald-900 to-teal-950',
    cardTitle: 'text-emerald-700', btn: 'bg-yellow-500 hover:bg-yellow-400 text-emerald-900',
    border: 'border-yellow-400', title: '🐉 端午慶典 扭蛋機', emoji: '🛶',
    decorations: [
      { e: '🛶', c: 'absolute top-20 right-10 text-6xl animate-bounce' },
      { e: '🥟', c: 'absolute top-1/4 left-10 text-5xl opacity-80' },
      { e: '🐉', c: 'absolute bottom-0 left-1/2 -translate-x-1/2 text-[15rem] opacity-20' }
    ]
  },
  midautumn: {
    bg: 'bg-gradient-to-b from-indigo-950 via-blue-950 to-black',
    cardTitle: 'text-indigo-800', btn: 'bg-yellow-400 hover:bg-yellow-300 text-indigo-900',
    border: 'border-yellow-400', title: '🌕 中秋賞月 扭蛋機', emoji: '🥮',
    decorations: [
      { e: '🌕', c: 'absolute top-10 right-10 text-8xl animate-pulse opacity-90' },
      { e: '🐰', c: 'absolute bottom-20 left-10 text-7xl animate-bounce' },
      { e: '🥮', c: 'absolute top-1/3 left-5 text-5xl opacity-80' }
    ]
  },
  mother: {
    bg: 'bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300',
    cardTitle: 'text-pink-600', btn: 'bg-pink-500 hover:bg-pink-400 text-white',
    border: 'border-pink-400', title: '🌸 母親節 溫馨抽獎', emoji: '👩‍👧',
    decorations: [
      { e: '💐', c: 'absolute top-10 left-10 text-6xl animate-bounce' },
      { e: '💖', c: 'absolute top-20 right-10 text-5xl animate-pulse' },
      { e: '🏵️', c: 'absolute bottom-0 left-1/2 -translate-x-1/2 text-[15rem] opacity-20' }
    ]
  },
  father: {
    bg: 'bg-gradient-to-br from-sky-900 via-blue-900 to-slate-900',
    cardTitle: 'text-sky-400', btn: 'bg-sky-500 hover:bg-sky-400 text-white',
    border: 'border-sky-400', title: '👔 父親節 專屬抽獎', emoji: '💪',
    decorations: [
      { e: '💼', c: 'absolute top-20 left-10 text-6xl animate-bounce' },
      { e: '🧔', c: 'absolute top-1/4 right-10 text-7xl opacity-80' },
      { e: '👔', c: 'absolute bottom-0 left-1/2 -translate-x-1/2 text-[15rem] opacity-10' }
    ]
  },
  valentine: {
    bg: 'bg-gradient-to-br from-rose-950 via-pink-950 to-black',
    cardTitle: 'text-rose-500', btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)]',
    border: 'border-rose-400', title: '💖 情人節 浪漫抽獎', emoji: '🌹',
    decorations: [
      { e: '💘', c: 'absolute top-10 left-10 text-6xl animate-bounce' },
      { e: '🍫', c: 'absolute top-1/3 right-5 text-5xl' },
      { e: '🌹', c: 'absolute bottom-20 left-5 text-7xl animate-pulse' },
      { e: '💑', c: 'absolute bottom-0 left-1/2 -translate-x-1/2 text-[12rem] opacity-20' }
    ]
  }
};

function GachaponContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentTheme, setCurrentTheme] = useState('halloween');

  useEffect(() => {
    fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'getTheme' }) })
    .then(res => res.json()).then(data => { if (data.theme && THEME_STYLES[data.theme]) setCurrentTheme(data.theme); });
  }, []);

  const styles = THEME_STYLES[currentTheme] || THEME_STYLES.halloween;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) { setError('請輸入有效的 Gmail 信箱！'); return; }
    setError(''); setIsLoggedIn(true);
  };

  const handleSpin = async () => {
    if (!token) { setError('請透過攤位生成的 QR Code 掃描進入！'); return; }
    setSpinning(true); setError('');
    try {
      const res = await fetch('/api/db', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spin', payload: { tokenStr: token, userEmail: email } })
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setSpinning(false); return; }
      setTimeout(() => { setResult(data.wonPrize); setSpinning(false); }, 2000);
    } catch (err) { setError('連線失敗，請重試'); setSpinning(false); }
  };

  const renderRules = (prizeName: string) => {
    let threshold = '500';
    if (prizeName.includes('100元') || prizeName.includes('300元') || prizeName.includes('折')) threshold = '1000';
    return (
      <div className="bg-gray-100 p-4 rounded text-left mt-4 text-xs sm:text-sm text-gray-700 space-y-1 w-full relative z-20">
        <p className="font-bold text-gray-900 mb-2">⚠️ 優惠券使用規則：</p>
        <p>1. 單筆消費滿 {threshold} 元可使用一張，以此類推。</p>
        <p>2. 本優惠券可於品牌實體櫃位、攤位使用。</p>
        <p>3. 本優惠券僅可消費折抵，不可轉換現金。</p>
        <p>4. 嚴禁轉售本優惠券。</p>
        <p>5. 本優惠有效期限至116.12.31止。</p>
        <p>6. 品牌保有調整優惠券使用規則之權益。</p>
      </div>
    );
  };

  return (
    <div className={`relative min-h-screen ${styles.bg} flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden transition-colors duration-700`}>
      
      {/* 背景浮動裝飾 (使用 CSS 絕對定位與動畫，營造沉浸感) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {styles.decorations.map((dec: any, i: number) => (
          <div key={i} className={dec.c}>{dec.e}</div>
        ))}
      </div>

      {/* 主體卡片 (確保 z-index 在最上層) */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center border-t-8 border-gray-100" style={{ borderColor: 'inherit' }}>
        
        {!isLoggedIn ? (
          <div className="animate-fade-in">
            <h1 className={`text-2xl sm:text-3xl font-black ${styles.cardTitle} mb-2`}>{styles.title}</h1>
            <p className="text-gray-500 mb-6 font-medium">請驗證您的 Gmail 以進行抽獎</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email" required placeholder="請輸入 @gmail.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-300 p-4 rounded-xl text-black text-lg focus:border-blue-500 focus:outline-none"
              />
              {error && <p className="text-red-500 font-bold">{error}</p>}
              <button type="submit" className={`w-full text-white font-bold py-4 rounded-xl text-lg transition ${styles.btn}`}>
                確認登入
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h1 className={`text-2xl sm:text-3xl font-black ${styles.cardTitle} mb-6 sm:mb-8 tracking-wide`}>{styles.title}</h1>
            
            {!result ? (
              <>
                <div className={`w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-8 ${styles.border} mb-6 sm:mb-8 shadow-inner`}>
                  {spinning ? <div className="animate-spin text-5xl sm:text-6xl">🌀</div> : <div className="text-5xl sm:text-6xl">{styles.emoji}</div>}
                </div>
                {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
                <button 
                  onClick={handleSpin} disabled={spinning}
                  className={`w-full py-4 sm:py-5 rounded-full font-black text-xl text-white tracking-widest ${spinning ? 'bg-gray-400' : `${styles.btn} transform hover:scale-105 transition-all`}`}
                >
                  {spinning ? '扭蛋運轉中...' : '開始抽獎！'}
                </button>
              </>
            ) : (
              <div className="animate-bounce">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">🎉 恭喜您獲得 🎉</h2>
                <div className="text-3xl sm:text-4xl text-red-600 font-extrabold my-4 tracking-wide bg-red-50 py-3 rounded-lg border-2 border-red-200">{result.name}</div>
                <p className="text-red-500 font-black animate-pulse my-4 text-lg sm:text-xl">⚠️ 請務必截圖保存本畫面！</p>
                
                {result.promoCodes && result.promoCodes.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-xl text-left mt-4 border-2 border-orange-300 relative z-20">
                    <p className="font-bold mb-2 text-gray-800 text-center">專屬核銷條碼</p>
                    {result.promoCodes.map((c: string) => (
                      <div key={c} className="font-mono bg-white p-3 border-2 border-dashed border-orange-400 mb-2 text-center text-lg font-bold text-red-600 shadow-sm break-all">{c}</div>
                    ))}
                  </div>
                )}
                {result.type === 'coupon' && renderRules(result.name)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-xl font-bold">載入中...</div>}>
      <GachaponContent />
    </Suspense>
  );
}