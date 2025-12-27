import React from 'react';

const About: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 max-w-md w-full">
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          👨‍💻
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">AI Print by Loai</h1>
        <p className="text-slate-500 mb-8">مساعد صيانة الطابعات الذكي</p>
        
        <div className="space-y-4 text-right bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-slate-500 text-sm">المطور</span>
            <div className="text-left">
                <span className="font-bold text-slate-800 block text-left">م. لؤي عامر</span>
                <span className="text-indigo-500 font-serif text-sm block tracking-wider" style={{fontFamily: 'serif'}}>ℓσαι 𝒜𝓂𝓮𝓻 😏</span>
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
             <span className="text-slate-500 text-sm">تواصل</span>
             <a href="https://wa.me/970597113281" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:text-green-700 font-bold transition-colors">
                <span className="text-sm">WhatsApp</span>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.13 1.25 4.74 1.25 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.23c-1.5 0-2.98-.39-4.31-1.15l-.31-.18-3.11.82.83-3.03-.2-.31c-.82-1.27-1.27-2.77-1.27-4.38 0-4.54 3.7-8.23 8.23-8.23 4.54 0 8.23 3.7 8.23 8.23 0 4.54-3.7 8.23-8.23 8.23zm4.51-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.66.81-.81.98-.15.17-.3.19-.55.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.71.12.33 3.48 5.31 8.42 7.46 2.91 1.27 4.05 1.02 5.51.87 1.6-.16 3.43-1.39 3.91-2.74.48-1.35.48-2.51.34-2.74-.14-.22-.51-.35-.76-.47z"/>
                </svg>
             </a>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-slate-500 text-sm">الإصدار</span>
             <span className="font-mono text-slate-800">1.0 Beta</span>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          تم تصميم هذا البوت لمساعدة مهندسي الصيانة في تشخيص الأعطال بالذكاء الاصطناعي، توفير الأدلة الفنية، وحل مشاكل السوفت وير.
        </p>
      </div>
    </div>
  );
};

export default About;