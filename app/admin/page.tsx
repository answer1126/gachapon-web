'use client';
import { useState, useEffect } from 'react';

const MY_PRIZES = [
  { id: '1', name: '明信片 1 張', defaultCount: 30, type: 'physical' },
  { id: '2', name: '明信片 2 張', defaultCount: 20, type: 'physical' },
  { id: '3', name: '50元折價券', defaultCount: 15, type: 'coupon' },
  { id: '4', name: '100元折價券', defaultCount: 10, type: 'coupon' },
  { id: '5', name: '9折優惠券', defaultCount: 10, type: 'coupon' },
  { id: '6', name: '8折優惠券', defaultCount: 5, type: 'coupon' },
  { id: '7', name: '300元折價券', defaultCount: 3, type: 'coupon' },
  { id: '8', name: '品牌 IP 毛巾', defaultCount: 1, type: 'physical' },
];

export default function AdminPage() {
  const [prizes, setPrizes] = useState(MY_PRIZES.map(p => ({ ...p, count: p.defaultCount })));
  const [qrToken, setQrToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getPrizes' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.prizes && data.prizes.length > 0) setPrizes(data.prizes);
    });
  }, []);

  const saveToCloud = async () => {
    setLoading(true);
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setPrizes', payload: prizes })
    });
    alert('雲端庫存已更新！');
    setLoading(false);
  };

  const resetToDefaults = async () => {
    if(confirm('確定要載入市集最新獎項嗎？這會洗掉雲端舊紀錄。')) {
      setLoading(true);
      const resetPrizes = MY_PRIZES.map(p => ({ ...p, count: p.defaultCount }));
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setPrizes', payload: resetPrizes })
      });
      setPrizes(resetPrizes);
      alert('已成功載入您的市集獎項！');
      setLoading(false);
    }
  };

  const generateQR = async () => {
    const token = Math.random().toString(36).substring(2, 10);
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generateToken', payload: { token, used: false } })
    });
    setQrToken(`https://gachapon-web.vercel.app/?token=${token}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-2/3 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">原味台南文創坊 - 後台管理</h1>
          <button onClick={resetToDefaults} className="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600">
            ⚠️ 載入最新市集獎項
          </button>
        </div>
        <div className="space-y-4 mb-6">
          {prizes.map((prize, idx) => (
            <div key={prize.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
              <span className="font-medium text-gray-700">{prize.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">剩餘數量 :</span>
                <input 
                  type="number" 
                  value={prize.count}
                  onChange={(e) => {
                    const newPrizes = [...prizes];
                    newPrizes[idx].count = parseInt(e.target.value) || 0;
                    setPrizes(newPrizes);
                  }}
                  className="w-20 border rounded p-1 text-center font-bold text-gray-700"
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={saveToCloud} disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold">
          {loading ? '儲存中...' : '儲存庫存至雲端'}
        </button>
      </div>
      <div className="w-1/3 bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-yellow-400 mb-2">生成單次抽獎 QR 碼</h2>
        <button onClick={generateQR} className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold mb-8">
          產生 QR Code
        </button>
        {qrToken && (
          <div className="bg-white p-4 rounded-lg flex flex-col items-center">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrToken)}`} alt="QR Code" />
          </div>
        )}
      </div>
    </div>
  );
}