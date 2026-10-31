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

const THEMES = [
  { id: 'halloween', name: '🎃 萬聖節風格' },
  { id: 'christmas', name: '🎄 聖誕節風格' },
  { id: 'lunar', name: '🧨 農曆春節' },
  { id: 'dragon', name: '🐉 端午節風格' },
  { id: 'midautumn', name: '🌕 中秋節風格' },
  { id: 'mother', name: '🌸 母親節風格' },
  { id: 'father', name: '👔 父親節風格' },
  { id: 'valentine', name: '💖 情人節風格' }
];

export default function AdminPage() {
  // 🎯 修改點：將預設 Tab 改為 qr
  const [activeTab, setActiveTab] = useState<'qr' | 'inventory' | 'theme'>('qr');
  const [prizes, setPrizes] = useState(MY_PRIZES.map(p => ({ ...p, count: p.defaultCount })));
  const [qrToken, setQrToken] = useState('');
  const [currentTheme, setCurrentTheme] = useState('halloween');
  const [loading, setLoading] = useState(false);

  const fetchInitialData = async () => {
    try {
      const resPrizes = await fetch(`/api/db?t=${Date.now()}`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'getPrizes' })
      });
      const dataPrizes = await resPrizes.json();
      if (dataPrizes.prizes && dataPrizes.prizes.length > 0) setPrizes(dataPrizes.prizes);

      const resTheme = await fetch(`/api/db?t=${Date.now()}`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'getTheme' })
      });
      const dataTheme = await resTheme.json();
      if (dataTheme.theme) setCurrentTheme(dataTheme.theme);
    } catch (e) {
      console.error("讀取失敗", e);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const saveToCloud = async () => {
    setLoading(true);
    await fetch('/api/db', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'setPrizes', payload: prizes })
    });
    alert('✅ 手動修改的庫存已覆蓋至雲端！');
    setLoading(false);
  };

  const generateQR = async () => {
    const token = Math.random().toString(36).substring(2, 10);
    await fetch('/api/db', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generateToken', payload: { token, used: false } })
    });
    setQrToken(`https://gachapon-web.vercel.app/?token=${token}`);
  };

  const saveTheme = async (themeId: string) => {
    setLoading(true);
    await fetch('/api/db', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'setTheme', payload: { theme: themeId } })
    });
    setCurrentTheme(themeId);
    alert('✅ 主題切換成功！前台已即時套用。');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* 頂部導覽列：順序調換 */}
        <div className="flex flex-col sm:flex-row bg-gray-900 text-white">
          <div className="p-4 text-xl font-bold text-center sm:text-left text-orange-500 border-b sm:border-b-0 sm:border-r border-gray-700">
            原味台南管理中心
          </div>
          <div className="flex w-full overflow-x-auto">
            <button onClick={() => setActiveTab('qr')} className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === 'qr' ? 'bg-yellow-600' : 'hover:bg-gray-800'}`}>📱 抽獎 QR 碼</button>
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === 'inventory' ? 'bg-orange-600' : 'hover:bg-gray-800'}`}>📦 數量控管</button>
            <button onClick={() => setActiveTab('theme')} className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === 'theme' ? 'bg-pink-600' : 'hover:bg-gray-800'}`}>🎨 節慶風格</button>
          </div>
        </div>

        <div className="p-6 md:p-8 min-h-[500px]">
          {/* Tab 1: QR Code (優先顯示) */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in py-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">生成單次抽獎 QR 碼</h2>
              <p className="text-gray-500 mb-8">每次點擊都會產生一組全新、只能掃描一次的專屬條碼</p>
              <button onClick={generateQR} className="bg-yellow-500 text-black px-10 py-5 rounded-full font-black text-2xl mb-8 hover:bg-yellow-400 transform hover:scale-105 transition shadow-xl">
                立即產生 QR Code
              </button>
              {qrToken && (
                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-200">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrToken)}`} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
            </div>
          )}

          {/* Tab 2: 庫存管理 */}
          {activeTab === 'inventory' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">獎品數量控管</h2>
              <button onClick={fetchInitialData} className="w-full bg-blue-50 text-blue-700 border-2 border-blue-300 py-3 rounded-lg font-bold mb-6 hover:bg-blue-100 shadow-sm transition">
                🔄 點我同步雲端最新數量
              </button>
              <div className="space-y-3 mb-6">
                {prizes.map((prize, idx) => (
                  <div key={prize.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 p-4 rounded shadow-sm border-l-4 border-orange-400">
                    <span className="font-medium text-gray-700 text-lg mb-2 sm:mb-0">{prize.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm font-bold">庫存：</span>
                      <input 
                        type="number" value={prize.count}
                        onChange={(e) => {
                          const newPrizes = [...prizes];
                          newPrizes[idx].count = parseInt(e.target.value) || 0;
                          setPrizes(newPrizes);
                        }}
                        className="w-24 border-2 border-gray-300 rounded p-2 text-center font-black text-xl text-gray-800 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={saveToCloud} disabled={loading} className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 shadow transition">
                {loading ? '儲存中...' : '💾 (修改數字後點擊) 強制覆蓋雲端'}
              </button>
            </div>
          )}

          {/* Tab 3: 主題設定 */}
          {activeTab === 'theme' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">消費者前台風格設定</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {THEMES.map(theme => (
                  <button
                    key={theme.id} onClick={() => saveTheme(theme.id)} disabled={loading}
                    className={`p-6 rounded-xl font-bold text-lg border-4 transition transform hover:scale-105 ${
                      currentTheme === theme.id ? 'border-green-500 bg-green-50 shadow-lg text-green-800' : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {theme.name}
                    {currentTheme === theme.id && <div className="mt-2 text-sm text-green-600">✅ 啟用中</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}