
import React, { useState } from 'react';
import { searchForDrivers } from '../services/geminiService';

const OS_DATA: Record<string, string[]> = {
  'Windows': [
    'Windows 11',
    'Windows 10 (64-bit)',
    'Windows 10 (32-bit)',
    'Windows 8.1 (64-bit)',
    'Windows 8.1 (32-bit)',
    'Windows 7 (64-bit)',
    'Windows Server 2022',
    'Windows Server 2019'
  ],
  'Mac OS': [
    'macOS 15 (Sequoia)',
    'macOS 14 (Sonoma)',
    'macOS 13 (Ventura)',
    'macOS 12 (Monterey)',
    'macOS 11 (Big Sur)',
    'macOS 10.15 (Catalina)'
  ],
  'Linux': [
    'Linux (Generic)',
    'CUPS Driver',
    'RedHat / CentOS',
    'Ubuntu / Debian'
  ]
};

const DriverFinder: React.FC = () => {
  const [model, setModel] = useState('');
  const [osType, setOsType] = useState('Windows');
  const [osVersion, setOsVersion] = useState(OS_DATA['Windows'][1]); // Default Win 10 64
  const [result, setResult] = useState('');
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOsTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setOsType(newType);
    setOsVersion(OS_DATA[newType][0]); // Reset version to first option of new type
  };

  const handleFind = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!model) return;
    
    setLoading(true);
    setResult('');
    setSources([]);

    try {
        const response = await searchForDrivers(model, `${osType} - ${osVersion}`);
        setResult(response.text);
        setSources(response.sources);
    } catch (e) {
        setResult("حدث خطأ أثناء البحث.");
    } finally {
        setLoading(false);
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full flex flex-col justify-center overflow-y-auto">
       <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="mb-6 inline-block p-4 rounded-full bg-blue-50 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">البحث عن التعريفات</h2>
          <p className="text-slate-500 mb-8">محرك بحث مدعوم من Google للعثور على التعريفات الرسمية.</p>

          <form onSubmit={handleFind} className="flex flex-col gap-4 max-w-2xl mx-auto mb-8">
              {/* Printer Model Input */}
              <div className="w-full">
                <label className="block text-right text-sm font-medium text-slate-600 mb-1">موديل الطابعة</label>
                <input 
                  type="text" 
                  placeholder="مثال: Ricoh MP C3003 أو HP M402dn" 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right bg-white"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {/* OS Type Selector */}
                <div className="flex-1">
                  <label className="block text-right text-sm font-medium text-slate-600 mb-1">نوع النظام</label>
                  <select 
                    value={osType}
                    onChange={handleOsTypeChange}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right bg-white"
                  >
                    {Object.keys(OS_DATA).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                {/* OS Version Selector */}
                <div className="flex-1">
                  <label className="block text-right text-sm font-medium text-slate-600 mb-1">الإصدار</label>
                  <select 
                    value={osVersion}
                    onChange={(e) => setOsVersion(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right bg-white"
                  >
                    {OS_DATA[osType].map(ver => (
                      <option key={ver} value={ver}>{ver}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !model}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all active:scale-95 font-semibold disabled:bg-slate-300 disabled:active:scale-100 mt-2"
              >
                {loading ? '... جارٍ البحث' : 'جلب رابط التعريف'}
              </button>
          </form>

          {result && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-right" dir="auto">
                  <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap mb-6">
                    {result}
                  </div>

                  {sources.length > 0 ? (
                    <div className="border-t border-slate-200 pt-4">
                      <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center">
                         <span className="ml-2">🔗</span> الروابط الرسمية (نتائج بحث Google):
                      </h3>
                      <div className="grid gap-2">
                        {sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group text-left"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500 mr-3 hidden md:block">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                            <div className="flex-1 min-w-0">
                               <div className="font-bold text-blue-700 text-sm truncate group-hover:underline" dir="ltr">{source.title}</div>
                               <div className="text-xs text-slate-400 truncate mt-0.5 font-mono" dir="ltr">{getDomain(source.uri)}</div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 ml-2 rotate-180">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-100 flex items-center">
                       <span className="text-lg ml-2">⚠️</span>
                       لم يتم العثور على روابط مباشرة. يرجى التأكد من اسم الموديل أو زيارة موقع الشركة المصنعة يدوياً.
                    </div>
                  )}
              </div>
          )}
       </div>
    </div>
  );
};

export default DriverFinder;
