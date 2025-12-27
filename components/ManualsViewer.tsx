import React, { useState } from 'react';
import { COMMON_PARTS } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const ManualsViewer: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [manualContent, setManualContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchManual = async (part: string) => {
    setSelectedPart(part);
    setLoading(true);
    setManualContent('');

    const prompt = `
      أعطني (Cheat Sheet) لصيانة قطعة "${part}".
      المطلوب رؤوس أقلام فقط وبشكل "مختصر جداً جداً":
      1. الوظيفة (Function).
      2. علامات التلف (Symptoms).
      3. خطوات الفك/التركيب الرئيسية (Key Steps).
    `;

    try {
      const content = await sendMessageToGemini(prompt);
      setManualContent(content);
    } catch (err) {
      setManualContent("تعذر التحميل.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-full overflow-y-auto">
       <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="ml-2">📖</span> دليل المهندس (مختصر)
       </h2>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Parts List */}
         <div className="lg:col-span-1 space-y-3">
           <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">اختر القطعة</h3>
           {COMMON_PARTS.map((part) => (
             <button
               key={part}
               onClick={() => fetchManual(part)}
               className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                 selectedPart === part
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
               }`}
             >
               {part}
             </button>
           ))}
         </div>

         {/* Content Area */}
         <div className="lg:col-span-3">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[400px] p-8">
             {!selectedPart ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <span className="text-4xl mb-4">⚡</span>
                 <p>معلومات سريعة للمهندس الميداني</p>
               </div>
             ) : (
               <>
                 <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                   {selectedPart}
                 </h3>
                 
                 {loading ? (
                   <div className="space-y-4 animate-pulse">
                     <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                     <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                     <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                   </div>
                 ) : (
                   <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed font-medium">
                     {manualContent}
                   </div>
                 )}
               </>
             )}
           </div>
         </div>
       </div>
    </div>
  );
};

export default ManualsViewer;