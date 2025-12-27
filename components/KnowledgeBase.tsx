import React, { useState, useRef } from 'react';
import { FaultRecord } from '../types';

const INITIAL_RECORDS: FaultRecord[] = [
  {
    id: '1',
    title: 'HP LaserJet P2055 - Paper Jam Error',
    cause: 'تمزق فيلم السخان (Fuser Film Sleeve) وتراكم الحبر.',
    solution: 'استبدال فيلم السخان، تنظيف السخان، وتشحيم الهيتر.',
    estimatedTime: '20 دقيقة',
    partsNeeded: 'Fuser Film, Grease',
    timestamp: new Date('2023-10-15')
  },
  {
    id: '2',
    title: 'Ricoh MP 2000 - Code SC542',
    cause: 'حساس الحرارة (Thermistor) متسخ أو الفولتية غير مستقرة.',
    solution: 'تنظيف الثيرمستور + الدخول للسيرفس (Clear+107) واختيار Fuser Reset.',
    estimatedTime: '10 دقائق',
    partsNeeded: 'Thermistor (اذا لزم)',
    timestamp: new Date('2023-11-02')
  },
  {
    id: '3',
    title: 'Canon MF3010 - E202 Error',
    cause: 'عطل في وحدة السكانر (CIS Unit) أو الكيبل غير موصول جيداً.',
    solution: 'التأكد من كيبل السكانر، تنظيف مسار الحركة، أو استبدال الوحدة.',
    estimatedTime: '30 دقيقة',
    partsNeeded: 'Scanner Unit / Flat Cable',
    timestamp: new Date('2023-12-05')
  }
];

const KnowledgeBase: React.FC = () => {
  const [records, setRecords] = useState<FaultRecord[]>(INITIAL_RECORDS);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [newRecord, setNewRecord] = useState<Partial<FaultRecord>>({
    title: '',
    cause: '',
    solution: '',
    estimatedTime: '',
    partsNeeded: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewRecord({ ...newRecord, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecord({ ...newRecord, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.title || !newRecord.cause) return;

    const record: FaultRecord = {
      id: Date.now().toString(),
      title: newRecord.title || 'بدون عنوان',
      cause: newRecord.cause || '',
      solution: newRecord.solution || '',
      estimatedTime: newRecord.estimatedTime || 'غير محدد',
      partsNeeded: newRecord.partsNeeded || 'لا يوجد',
      timestamp: new Date(),
      imageUrl: newRecord.imageUrl
    };

    setRecords([record, ...records]);
    setIsAdding(false);
    setNewRecord({ title: '', cause: '', solution: '', estimatedTime: '', partsNeeded: '' });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <span className="ml-2">🗂️</span> أرشيف الأعطال (Knowledge Base)
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center transition-all active:scale-95"
        >
          {isAdding ? 'إلغاء' : '+ تسجيل عطل جديد'}
        </button>
      </div>

      {/* Add New Record Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 mb-8 animate-fade-in-down">
          <h3 className="font-bold text-lg text-slate-700 mb-4 border-b pb-2">تسجيل عطل جديد</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">موديل الطابعة والعطل (Title)</label>
              <input
                name="title"
                value={newRecord.title}
                onChange={handleInputChange}
                placeholder="مثال: HP M402 - انحشار ورق خلفي"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">السبب الحقيقي (Cause)</label>
              <textarea
                name="cause"
                value={newRecord.cause}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">الحل الجذري (Solution)</label>
              <textarea
                name="solution"
                value={newRecord.solution}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">الوقت المستغرق</label>
              <input
                name="estimatedTime"
                value={newRecord.estimatedTime}
                onChange={handleInputChange}
                placeholder="مثال: 15 دقيقة"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">قطع الغيار المطلوبة</label>
              <input
                name="partsNeeded"
                value={newRecord.partsNeeded}
                onChange={handleInputChange}
                placeholder="مثال: Fuser Film, Press Roller"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">صورة العطل (اختياري)</label>
              <input
                 type="file"
                 ref={fileInputRef}
                 onChange={handleImageUpload}
                 className="hidden"
                 accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 p-4 rounded-lg text-slate-500 hover:bg-slate-50 hover:border-blue-400 transition-all active:scale-98 active:bg-slate-100 active:border-blue-500"
              >
                {newRecord.imageUrl ? '✅ تم إرفاق الصورة' : '📸 اضغط لرفع صورة العطل'}
              </button>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md transition-transform active:scale-95"
              >
                حفظ في الأرشيف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((record) => (
          <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            {record.imageUrl && (
              <div className="h-40 bg-slate-100 w-full overflow-hidden border-b border-slate-100">
                <img src={record.imageUrl} alt={record.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-lg leading-snug">{record.title}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full whitespace-nowrap">
                  {record.timestamp.toLocaleDateString('en-GB')}
                </span>
              </div>
              
              <div className="space-y-3 text-sm flex-1">
                <div className="bg-red-50 p-2 rounded border border-red-100">
                  <span className="font-bold text-red-600 block mb-1">السبب:</span>
                  <p className="text-slate-700">{record.cause}</p>
                </div>
                
                <div className="bg-green-50 p-2 rounded border border-green-100">
                  <span className="font-bold text-green-600 block mb-1">الحل:</span>
                  <p className="text-slate-700">{record.solution}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center">
                  <span className="ml-1">⏱️</span> {record.estimatedTime}
                </div>
                <div className="flex items-center">
                  <span className="ml-1">🔧</span> {record.partsNeeded}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;