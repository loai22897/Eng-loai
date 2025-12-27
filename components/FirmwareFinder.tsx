import React, { useState } from 'react';
import { PRINTER_BRANDS } from '../types';
import { findFirmware } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const FirmwareFinder: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>(PRINTER_BRANDS[0]);
  const [model, setModel] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await findFirmware(selectedBrand, model);
      setResult(response);
    } catch (error) {
      setResult("حدث خطأ أثناء البحث.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 min-h-[60vh]">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">تحديث السوفتوير (Firmware)</h2>
            <p className="text-slate-500 text-sm">البحث عن الإصدارات الحالية والسابقة لأنظمة التشغيل</p>
          </div>
        </div>

        {/* Safety Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
          <div className="text-amber-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-amber-800 text-sm">تنبيه هام جداً</h4>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
              أثناء عملية تحديث الفيرموير (Firmware)، احذر بشدة من <strong>فصل التيار الكهربائي</strong> أو إيقاف تشغيل الطابعة أو فصل كابل USB.
              أي انقطاع أثناء التحديث قد يؤدي إلى تلف اللوحة الأم (Formatter Board) بشكل نهائي.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">الشركة المصنعة</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            >
              {PRINTER_BRANDS.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">موديل الطابعة</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="مثال: MP C3003 أو LaserJet M605"
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={loading || !model}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md h-[50px] mb-[1px]"
            >
              {loading ? <span className="animate-pulse">...</span> : 'بحث عن نسخ'}
            </button>
          </div>
        </form>

        {loading ? (
           <div className="space-y-6 animate-pulse p-4">
             <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
             <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
             <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
             <div className="h-32 bg-slate-100 rounded-xl mt-4"></div>
           </div>
        ) : result ? (
           <div className="animate-fade-in-up">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 leading-relaxed">
                 <div className="prose prose-slate max-w-none prose-headings:text-indigo-700 prose-headings:font-bold prose-table:shadow-sm prose-th:bg-indigo-50 prose-th:text-indigo-900">
                    <MarkdownRenderer content={result} variant="light" />
                 </div>
              </div>
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
             <p className="font-medium">أدخل الموديل لعرض جدول إصدارات الفيرموير المتاحة</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default FirmwareFinder;