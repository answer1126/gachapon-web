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

  const fetchLatestInventory = async () => {
    try {
      const res = await fetch(`/api/db?t=${Date.now()}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getPrizes' })
      });
      const data = await res.json();
      if (data.prizes && data.prizes.length > 0) setPrizes(data.prizes);
    } catch (e) {
      console.error("讀取庫存失敗", e);
    }
  };

  useEffect(() => {
    fetchLatestInventory();
  }, []);

  const saveToCloud = async () => {
    setLoading(true);
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setPrizes', payload: prizes })
    });
    alert('✅ 手動修改的庫存已覆蓋至雲端！');
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* 左側：庫存管理 */}
      <div className="w-full lg:w-2/3 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">原味台南 - 庫存控管</h1>
          <button onClick={resetToDefaults} className="w-full md:w-auto bg-red-500 text-white px-4 py-3 md:py-2 rounded font-bold hover:bg-red-600 shadow">
            ⚠️ 載入原始獎項
          </button>
        </div>
        
        <button 
          onClick={fetchLatestInventory}
          className="w-full bg-blue-100 text-blue-700 border-2 border-blue-500 py-3 rounded-lg font-bold mb-6 hover:bg-blue-200 shadow text-sm md:text-base"
        >
          🔄 點我同步雲端最新數量 (客人抽獎後按此更新)
        </button>

        <div className="space-y-3 mb-6">
          {prizes.map((prize, idx) => (
            <div key={prize.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-4 rounded shadow border-l-4 border-orange-400 gap-3">
              <span className="font-medium text-gray-700 text-base md:text-lg">{prize.name}</span>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                <span className="text-gray-500 text-sm font-bold">目前庫存：</span>
                <input 
                  type="number" 
                  value={prize.count}
                  onChange={(e) => {
                    const newPrizes = [...prizes];
                    newPrizes[idx].count = parseInt(e.target.value) || 0;
                    setPrizes(newPrizes);
                  }}
                  className="w-20 md:w-24 border-2 border-gray-300 rounded p-2 text-center font-black text-lg md:text-xl text-gray-800 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={saveToCloud} disabled={loading} className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-base md:text-lg hover:bg-green-600 shadow mb-8 lg:mb-0">
          {loading ? '儲存中...' : '💾 手動調整數字後，點此強制覆蓋雲端'}
        </button>
      </div>

      {/* 右側：QR Code 生成 */}
      <div className="w-full lg:w-1/3 bg-gray-900 text-white p-6 md:p-8 flex flex-col items-center justify-center shadow-xl">
        <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-2 text-center">生成抽獎 QR 碼</h2>
        <p className="text-gray-400 text-xs md:text-sm mb-6 text-center">每次產生的條碼僅限單次使用</p>
        <button onClick={generateQR} className="w-full bg-yellow-500 text-black py-4 rounded-lg font-black text-lg md:text-xl mb-6 hover:bg-yellow-400 transition shadow-lg">
          產生全新 QR Code
        </button>
        {qrToken && (
          <div className="bg-white p-4 md:p-6 rounded-xl flex flex-col items-center shadow-inner w-full max-w-[250px] mx-auto">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrToken)}`} alt="QR Code" className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
}