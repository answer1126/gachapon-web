'use client';
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Settings, Save, QrCode, Gift, RefreshCw } from 'lucide-react';

const defaultPrizes = [
  { id: '1', name: '手作陶珠・原味經典款', type: 'physical', count: 10, total: 10 },
  { id: '2', name: '萬聖限定・木雕貓頭鷹', type: 'physical', count: 5, total: 5 },
  { id: '3', name: '植染文創・手作襪', type: 'physical', count: 10, total: 10 },
  { id: '4', name: '全館 300 元折價券 (分3張100)', type: 'coupon', count: 3, total: 3, terms: ['單筆結帳限用一張(100元)','不可找零或兌換現金'] },
  { id: '5', name: '單筆消費 50 元折價券', type: 'coupon', count: 10, total: 10, terms: ['滿500元方可使用','不與其他優惠併用'] },
  { id: '6', name: '單筆消費 100 元折價券', type: 'coupon', count: 6, total: 6, terms: ['滿800元方可使用','不與其他優惠併用'] },
  { id: '7', name: '全館 9 折優惠券', type: 'coupon', count: 20, total: 20, terms: ['特價商品除外'] },
  { id: '8', name: '全館 8 折優惠券', type: 'coupon', count: 10, total: 10, terms: ['特價商品除外'] },
  { id: '9', name: '萬聖紀念貼紙', type: 'physical', count: 20, total: 20 },
];

export default function AdminDashboard() {
  const [prizes, setPrizes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  // 進入後台時，立刻從雲端讀取目前庫存
  useEffect(() => {
    fetch('/api/db', { method: 'POST', body: JSON.stringify({ action: 'getPrizes' }) })
      .then(res => res.json())
      .then(data => {
        if (data.prizes && data.prizes.length > 0) {
          setPrizes(data.prizes);
        } else {
          setPrizes(defaultPrizes);
        }
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await fetch('/api/db', { method: 'POST', body: JSON.stringify({ action: 'setPrizes', payload: prizes }) });
    alert('雲端庫存已成功更新！客人手機現在會同步最新機率！');
    setIsSaving(false);
  };

  const generateSingleUseQR = async () => {
    const newToken = Math.random().toString(36).substring(2, 15);
    const baseUrl = window.location.origin;
    const url = `${baseUrl}?token=${newToken}`;
    
    // 將權限寫入雲端
    await fetch('/api/db', { 
      method: 'POST', 
      body: JSON.stringify({ action: 'generateToken', payload: { token: newToken, used: false } }) 
    });

    setQrToken(newToken);
    setQrUrl(url);
  };

  if (isLoading) return <div className="p-10 text-center font-bold">連線雲端資料庫中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Settings className="w-7 h-7 text-amber-500" /> 原味台南・雲端管理後台
            </h1>
            <p className="text-sm text-slate-500 mt-1">跨設備即時同步版本</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-emerald-500" /> 獎項庫存即時控管
            </h2>
            <div className="space-y-3">
              {prizes.map((prize, idx) => (
                <div key={prize.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-700">{prize.name}</div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <span className="text-xs text-slate-500">剩餘數量：</span>
                    <input
                      type="number"
                      value={prize.count}
                      onChange={(e) => {
                        const newPrizes = [...prizes];
                        newPrizes[idx].count = parseInt(e.target.value) || 0;
                        setPrizes(newPrizes);
                      }}
                      className="w-20 px-2 py-1 border border-slate-300 rounded-md text-center font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSave} disabled={isSaving} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition">
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? '同步至雲端中...' : '儲存庫存至雲端'}
            </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-amber-400">
              <QrCode className="w-5 h-5" /> 客人掃碼抽獎區
            </h2>
            <p className="text-xs text-slate-400 mb-6 text-center">請點擊下方按鈕，讓客人用他的手機掃描即可抽獎</p>
            
            <button onClick={generateSingleUseQR} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-xl shadow-lg transition mb-6">
              生成單次抽獎 QR 碼
            </button>

            {qrUrl && (
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center animate-in zoom-in duration-300">
                <QRCodeSVG value={qrUrl} size={200} level="H" includeMargin className="rounded-xl" />
                <p className="text-slate-900 font-bold text-sm mt-3">請客人掃描此條碼</p>
                <span className="text-[10px] text-rose-500 mt-1 font-bold">※ 掃描一次後自動失效，防止轉傳</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}