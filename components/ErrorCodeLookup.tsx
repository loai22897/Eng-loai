import React, { useState } from 'react';
import { PRINTER_BRANDS } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const ErrorCodeLookup: React.FC = () => {
  const [brand, setBrand] = useState(PRINTER_BRANDS[0]);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setResult(null);

    const prompt = `
      طابعة ${brand} كود خطأ: "${code}".
      المطلوب (Telegraphic Response):
      1. المعنى (Meaning).
      2. القطعة (Part).
      3. الحل السريع (Quick Fix) - خطوات مرقمة ومختصرة جداً.
    `;

    try {
      const response = await sendMessageToGemini(prompt);
      setResult(response);
    } catch (err) {
      setResult("خطأ في البحث.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="ml-2">🔢</span> كاشف الأعطال الفوري
        </h2>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">الشركة المصنعة</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
            >
              {PRINTER_BRANDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-2">رقم / كود الخطأ</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: SC542 أو 50.4"
                className="flex-1 rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
              />
              <button
                type="submit"
                disabled={loading || !code}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? '...' : 'كشف'}
              </button>
            </div>
          </div>
        </form>

        {result && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">التشخيص:</h3>
            <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed font-medium">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorCodeLookup;