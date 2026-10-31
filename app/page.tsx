'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GachaponContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('請輸入有效的 Gmail 信箱！');
      return;
    }
    setError('');
    setIsLoggedIn(true);
  };

  const handleSpin = async () => {
    if (!token) {
      setError('請透過攤位生成的 QR Code 掃描進入！');
      return;
    }
    setSpinning(true);
    setError('');
    
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spin', payload: { tokenStr: token, userEmail: email } })
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setSpinning(false);
        return;
      }

      setTimeout(() => {
        setResult(data.wonPrize);
        setSpinning(false);
      }, 2000);
    } catch (err) {
      setError('連線失敗，請重試');
      setSpinning(false);
    }
  };

  // 根據獎項動態顯示規則
  const renderRules = (prizeName: string) => {
    let threshold = '500';
    if (prizeName.includes('100元') || prizeName.includes('300元') || prizeName.includes('折')) {
      threshold = '1000';
    }
    return (
      <div className="bg-gray-100 p-4 rounded text-left mt-4 text-xs text-gray-700 space-y-1">
        <p className="font-bold text-gray-900 mb-2">⚠️ 優惠券使用規則：</p>
        <p>1. 單筆消費滿 {threshold} 元可使用一張，以此類推。</p>
        <p>2. 本優惠券可於品牌實體櫃位、攤位使用。</p>
        <p>3. 本優惠券僅可作為消費折抵使用，不可轉換現金。</p>
        <p>4. 嚴禁轉售本優惠券。</p>
        <p>5. 本優惠有效期限至116.12.31止。</p>
        <p>6. 品牌保有調整優惠券使用規則之權益。</p>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">原味台南文創坊</h1>
          <p className="text-gray-500 mb-6">請驗證您的 Gmail 以進行抽獎</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              placeholder="請輸入您的 @gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded text-black"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700">
              確認登入
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-6">原味台南專屬扭蛋機</h1>
        
        {!result ? (
          <>
            <div className="w-48 h-48 mx-auto bg-gray-200 rounded-full flex items-center justify-center border-8 border-orange-500 mb-8">
               {spinning ? <div className="animate-spin text-5xl">🌀</div> : <div className="text-5xl">🎁</div>}
            </div>
            {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
            <button 
              onClick={handleSpin}
              disabled={spinning}
              className={`w-full py-4 rounded-full font-bold text-xl text-white ${spinning ? 'bg-gray-400' : 'bg-orange-500 shadow-lg transform hover:scale-105 transition'}`}
            >
              {spinning ? '扭蛋轉動中...' : '開始抽獎！'}
            </button>
          </>
        ) : (
          <div className="animate-bounce">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">恭喜您獲得！</h2>
            <div className="text-4xl text-red-600 font-extrabold my-4">{result.name}</div>
            <p className="text-red-500 font-bold animate-pulse my-4 text-xl">⚠️ 請務必截圖保存本畫面！</p>
            
            {result.promoCodes && result.promoCodes.length > 0 && (
              <div className="bg-orange-50 p-4 rounded text-left mt-4 border border-orange-200">
                <p className="font-bold mb-2 text-gray-800 text-center">您的專屬核銷條碼</p>
                {result.promoCodes.map((c: string) => (
                  <div key={c} className="font-mono bg-white p-3 border mb-2 text-center text-lg font-bold text-red-600 shadow-sm">{c}</div>
                ))}
              </div>
            )}
            {result.type === 'coupon' && renderRules(result.name)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20">載入中...</div>}>
      <GachaponContent />
    </Suspense>
  );
}