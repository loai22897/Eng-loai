import React, { useState, useEffect } from 'react';
import { PRINTER_BRANDS, PRINTER_SERIES_SUGGESTIONS, PrinterDetails } from '../types';
import { getComprehensivePrinterDetails, fetchLatestPrinterData } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { Loader2, RefreshCw, Download, Zap, Calendar, Droplet, AlertTriangle } from 'lucide-react';

const PrinterSpecsViewer: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>(PRINTER_BRANDS[0]);
  const [modelInput, setModelInput] = useState<string>('');
  const [details, setDetails] = useState<PrinterDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingList, setUpdatingList] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Update suggestions when brand changes
  useEffect(() => {
    if (selectedBrand && PRINTER_SERIES_SUGGESTIONS[selectedBrand]) {
      setSuggestions(PRINTER_SERIES_SUGGESTIONS[selectedBrand]);
      setModelInput('');
    } else {
      setSuggestions([]);
    }
  }, [selectedBrand]);

  const handleFetchSpecs = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const modelToSearch = typeof e === 'string' ? e : modelInput;
    
    if (!selectedBrand || !modelToSearch) return;

    setLoading(true);
    setDetails(null);
    setError(null);

    try {
      const result = await getComprehensivePrinterDetails(selectedBrand, modelToSearch);
      if (result) {
        setDetails(result);
      } else {
        setError(`لم يتم العثور على مواصفات دقيقة للموديل "${modelToSearch}". تأكد من كتابة الاسم بشكل صحيح.`);
      }
    } catch (error) {
      console.error(error);
      setError("حدث خطأ أثناء الاتصال بالخدمة. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateList = async () => {
    setUpdatingList(true);
    try {
        const newModels = await fetchLatestPrinterData(selectedBrand);
        if (newModels && newModels.length > 0) {
            setSuggestions(prev => [...new Set([...newModels, ...prev])]);
        }
    } catch(e) {
        console.error(e);
    } finally {
        setUpdatingList(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 min-h-[85vh]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-slate-100 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">مواصفات الطابعات</h2>
              <p className="text-slate-500 text-sm">شامل: المواصفات، الحبر، الفيرموير، وتاريخ الصنع</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Sidebar List */}
            <div className="lg:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200 h-[500px] flex flex-col">
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">الشركة</label>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900 text-sm font-medium"
                    >
                        {PRINTER_BRANDS.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">الموديلات المتوفرة</label>
                    <button 
                        onClick={handleUpdateList} 
                        disabled={updatingList}
                        className="text-xs text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors flex items-center gap-1"
                        title="جلب موديلات 2024-2025"
                    >
                        <RefreshCw className={`w-3 h-3 ${updatingList ? 'animate-spin' : ''}`} />
                        تحديث القائمة
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                    {suggestions.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setModelInput(s);
                                handleFetchSpecs(s);
                            }}
                            className={`w-full text-right text-sm py-2 px-3 rounded-lg transition-all ${
                                modelInput === s 
                                ? 'bg-indigo-600 text-white shadow-md font-medium' 
                                : 'text-slate-600 hover:bg-white hover:shadow-sm'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
                <div className="mb-6 flex gap-2">
                    <input
                        type="text"
                        value={modelInput}
                        onChange={(e) => setModelInput(e.target.value)}
                        placeholder="ابحث عن موديل محدد..."
                        className="flex-1 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-right shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchSpecs(e)}
                    />
                    <button
                        onClick={handleFetchSpecs}
                        disabled={loading || !modelInput}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-lg font-bold transition-all disabled:bg-slate-300 shadow-md active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'بحث'}
                    </button>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 min-h-[400px] relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">جاري تحليل بيانات الطابعة...</p>
                        </div>
                    )}

                    {!details && !loading && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Zap className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 mb-2">ابدأ البحث</h3>
                            <p className="max-w-xs mx-auto">اختر موديل من القائمة أو ابحث عن طابعة لعرض التقرير الفني الشامل.</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center h-full text-red-500 p-8 text-center">
                            <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    {details && (
                        <div className="animate-fade-in-up">
                            {/* Title Banner */}
                            <div className="bg-slate-800 text-white p-6 relative overflow-hidden">
                                <div className="relative z-10 flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold mb-1">{details.model_name}</h1>
                                        <div className="flex items-center gap-4 text-sm text-slate-300 mt-2">
                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> إصدار: {details.release_date}</span>
                                            <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> {details.print_speed}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-300 uppercase tracking-wider mb-1">Toner / Cartridge</div>
                                            <div className="font-mono font-bold text-lg text-amber-400">{details.toner_cartridge}</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                            </div>

                            <div className="p-6 md:p-8">
                                {/* Specs Body */}
                                <div className="prose prose-slate max-w-none prose-headings:text-indigo-700 prose-li:marker:text-indigo-500">
                                    <MarkdownRenderer content={details.specs_markdown} variant="light" />
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4">
                                    {details.firmware_url && (
                                        <a 
                                            href={details.firmware_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-bold transition-colors shadow-sm"
                                        >
                                            <Download className="w-5 h-5" />
                                            تحميل التعريفات / الفيرموير
                                        </a>
                                    )}
                                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-3 rounded-lg border border-amber-100">
                                        <Droplet className="w-5 h-5" />
                                        <span className="font-medium text-sm">الحبر المتوافق: <strong>{details.toner_cartridge}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterSpecsViewer;