
import React, { useState, useEffect } from 'react';
import { FaultRecord } from '../types';
import { 
  Trash2, 
  Calendar, 
  Search, 
  ClipboardCheck, 
  Printer, 
  ExternalLink,
  PlusCircle,
  Clock,
  Wrench
} from 'lucide-react';

const MaintenanceHistory: React.FC = () => {
  const [records, setRecords] = useState<FaultRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ai_print_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure dates are actual Date objects
        setRecords(parsed.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const deleteRecord = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      localStorage.setItem('ai_print_history', JSON.stringify(updated));
    }
  };

  const filteredRecords = records.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.cause.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto h-full overflow-y-auto custom-scrollbar bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <ClipboardCheck className="text-blue-600" size={32} />
            سجل المهندس
          </h2>
          <p className="text-slate-500 font-medium mt-1">تتبع وأرشفة كافة عمليات الصيانة التي قمت بها.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث في السجلات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium text-sm"
          />
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="group bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border-b-4 border-b-blue-500">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Printer size={20} />
                  </div>
                  <button 
                    onClick={() => deleteRecord(record.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {record.title}
                </h3>
                
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {record.timestamp.toLocaleDateString('ar-EG')}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {record.estimatedTime}</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">السبب المحتمل</span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{record.cause}</p>
                  </div>
                  
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-black text-blue-400 uppercase block mb-1">الحل الفني</span>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed">{record.solution}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                  <Wrench size={10} /> {record.partsNeeded}
                </span>
                <button className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors">
                  التفاصيل <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <PlusCircle className="text-slate-200" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-600">لا يوجد سجلات حتى الآن</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm">ابدأ بتشخيص الأعطال في المحادثة واحفظ النتائج هنا لتكون مرجعك الدائم.</p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistory;
