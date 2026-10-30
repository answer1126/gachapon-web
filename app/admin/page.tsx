'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, ShieldCheck, Palette, PackagePlus, Eye, Save } from 'lucide-react';

interface PrizeItem {
  id: string;
  name: string;
  count: number;
  type: 'coupon' | 'physical';
  codes?: string[];
  terms?: string[];
}

interface TokenRecord {
  token: string;
  createdAt: string;
  used: boolean;
  usedBy?: string;
}

export default function AdminPage() {
  const [currentTheme, setCurrentTheme] = useState('halloween');
  const [activeToken, setActiveToken] = useState('');
  const [tokenList, setTokenList] = useState<TokenRecord[]>([]);
  const [originUrl, setOriginUrl] = useState('');

  // 預設 94 顆獎品設定
  const [prizes, setPrizes] = useState<PrizeItem[]>([
    { id: '1', name: '明信片 1 張', count: 30, type: 'physical' },
    { id: '2', name: '明信片 2 張', count: 20, type: 'physical' },
    { id: '3', name: '50元折價券', count: 15, type: 'coupon', terms: ['單筆消費滿500元可使用一張，以此類推。', '本優惠券可於品牌實體櫃位、攤位使用。', '本優惠券僅可作為消費折抵使用，不可轉換現金。', '嚴禁轉售本優惠券。', '本優惠有效期限至116.12.31止。', '品牌保有調整優惠券使用規則之權益。'] },
    { id: '4', name: '100元折價券', count: 10, type: 'coupon', terms: ['單筆消費滿1000元可使用一張，以此類推。', '本優惠券可於品牌實體櫃位、攤位使用。', '本優惠券僅可作為消費折抵使用，不可轉換現金。', '嚴禁轉售本優惠券。', '本優惠有效期限至116.12.31止。', '品牌保有調整優惠券使用規則之權益。'] },
    { id: '5', name: '9折優惠券', count: 10, type: 'coupon', terms: ['單筆消費滿1000元可使用一張，以此類推。', '本優惠券可於品牌實體櫃位、攤位使用。', '本優惠券僅可作為消費折抵使用，不可轉換現金。', '嚴禁轉售本優惠券。', '本優惠有效期限至116.12.31止。', '品牌保有調整優惠券使用規則之權益。'] },
    { id: '6', name: '8折優惠券', count: 5, type: 'coupon', terms: ['單筆消費滿1000元可使用一張，以此類推。', '本優惠券可於品牌實體櫃位、攤位使用。', '本優惠券僅可作為消費折抵使用，不可轉換現金。', '嚴禁轉售本優惠券。', '本優惠有效期限至116.12.31止。', '品牌保有調整優惠券使用規則之權益。'] },
    { id: '7', name: '300元折價券 (自動拆成3張100元)', count: 3, type: 'coupon', terms: ['單筆消費滿1000元可使用一張100元折價券，以此類推。', '本優惠券可於品牌實體櫃位、攤位使用。', '本優惠券僅可作為消費折抵使用，不可轉換現金。', '嚴禁轉售本優惠券。', '本優惠有效期限至116.12.31止。', '品牌保有調整優惠券使用規則之權益。'] },
    { id: '8', name: '品牌IP毛巾', count: 1, type: 'physical' },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
      const savedTheme = localStorage.getItem('ngaayho_theme');
      if (savedTheme) setCurrentTheme(savedTheme);
      const savedPrizes = localStorage.getItem('ngaayho_prizes');
      if (savedPrizes) setPrizes(JSON.parse(savedPrizes));
      const savedTokens = localStorage.getItem('ngaayho_tokens');
      if (savedTokens) setTokenList(JSON.parse(savedTokens));
    }
  }, []);

  const handleGenerateToken = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tokenStr = `NGA-${Date.now().toString().slice(-4)}-${randomHex}`;
    setActiveToken(tokenStr);
    const updated = [{ token: tokenStr, createdAt: new Date().toLocaleTimeString(), used: false }, ...tokenList];
    setTokenList(updated);
    localStorage.setItem('ngaayho_tokens', JSON.stringify(updated));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('ngaayho_theme', currentTheme);
    localStorage.setItem('ngaayho_prizes', JSON.stringify(prizes));
    alert('活動風格與獎項配置已成功儲存！');
  };

  const qrUrl = activeToken ? `${originUrl}?token=${activeToken}` : '';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-700 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">原味台南文創坊・全方位管理控制台</h1>
            <p className="text-slate-400 text-sm mt-1">管理單次抽獎 QR 碼、切換全站視覺風格與調整即時獎項配置</p>
          </div>
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg transition shadow-md"
          >
            <Save className="w-4 h-4" /> 儲存全站設定
          </button>
        </header>

        {/* 1. 主題風格切換器 */}
        <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold">1. 活動主題風格即時切換</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'halloween', name: '萬聖狂歡 (琥珀橘/幽魅紫)', desc: '萬聖節南瓜金、魅紫與幽靈綠發光特效' },
              { id: 'classic', name: '原味經典 (沉穩陶木/古銅綠)', desc: '原住民族六股編織、陶珠與琉璃溫潤質感' },
              { id: 'lunar', name: '年節慶典 (吉祥緋紅/富貴金)', desc: '新年春節與喜慶市集專屬配色' },
            ].map((theme) => (
              <div
                key={theme.id}
                onClick={() => setCurrentTheme(theme.id)}
                className={`cursor-pointer p-4 rounded-lg border-2 transition ${
                  currentTheme === theme.id ? 'border-amber-400 bg-slate-750' : 'border-slate-700 bg-slate-850 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-amber-200">{theme.name}</div>
                <div className="text-xs text-slate-400 mt-1">{theme.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. QR Code 發派中心 */}
        <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">2. 單次使用 QR Code 派發</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col items-center gap-4 bg-slate-900 p-6 rounded-xl border border-slate-700">
              {activeToken ? (
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCodeSVG value={qrUrl} size={180} />
                </div>
              ) : (
                <div className="w-[180px] h-[180px] border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500 text-xs text-center p-4">
                  尚未生成 QR Code<br />請點擊下方按鈕
                </div>
              )}
              <button
                onClick={handleGenerateToken}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition"
              >
                <RefreshCw className="w-4 h-4" /> 生成單次抽獎 QR 碼
              </button>
              {activeToken && <span className="text-xs font-mono text-emerald-300">金鑰：{activeToken}</span>}
            </div>

            <div className="flex-1 w-full overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-300 mb-2">最近發行與核銷紀錄</h3>
              <table className="w-full text-xs text-left text-slate-300 border border-slate-700 rounded-lg overflow-hidden">
                <thead className="bg-slate-700 text-slate-200 uppercase">
                  <tr>
                    <th className="p-2.5">Token 代碼</th>
                    <th className="p-2.5">生成時間</th>
                    <th className="p-2.5">狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-900">
                  {tokenList.slice(0, 5).map((t, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-mono">{t.token}</td>
                      <td className="p-2.5">{t.createdAt}</td>
                      <td className="p-2.5">
                        {t.used ? (
                          <span className="text-rose-400 font-bold">已使用 (失效)</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">有效待使用</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tokenList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500">尚無發行紀錄</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. 獎項與庫存配置 */}
        <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <PackagePlus className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">3. 獎項名稱與剩餘庫存管理</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prizes.map((p, index) => (
              <div key={p.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-amber-400 font-bold">獎項 #{index + 1}</span>
                  <span className="text-xs text-slate-400">{p.type === 'coupon' ? '電子折價券 (自動發信)' : '實體好禮'}</span>
                </div>
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => {
                    const next = [...prizes];
                    next[index].name = e.target.value;
                    setPrizes(next);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">庫存顆數：</span>
                  <input
                    type="number"
                    value={p.count}
                    onChange={(e) => {
                      const next = [...prizes];
                      next[index].count = parseInt(e.target.value) || 0;
                      setPrizes(next);
                    }}
                    className="w-24 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-500">顆</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}