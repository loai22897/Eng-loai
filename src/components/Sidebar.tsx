
import React from 'react';
import { AppView } from '../types';
import { 
  MessageSquare, 
  BookOpen, 
  History, 
  Cpu, 
  Download, 
  Info, 
  Hash,
  RefreshCw,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: AppView.CHAT, label: 'المحادثة والتشخيص', icon: <MessageSquare size={20} /> },
    { id: AppView.PRINTER_SPECS, label: 'مواصفات الطابعات', icon: <BookOpen size={20} /> },
    { id: AppView.DRIVERS, label: 'البحث عن تعريفات', icon: <Download size={20} /> },
    { id: AppView.FIRMWARE, label: 'تحديث السوفتوير', icon: <RefreshCw size={20} /> },
    { id: AppView.ERROR_CODES, label: 'موسوعة الأكواد', icon: <Hash size={20} /> },
    { id: AppView.ACADEMY, label: 'أكاديمية الصيانة', icon: <GraduationCap size={20} /> },
    { id: AppView.HISTORY, label: 'سجل الصيانات', icon: <History size={20} /> },
    { id: AppView.ABOUT, label: 'عن النظام', icon: <Info size={20} /> },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden backdrop-blur-sm transition-all"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 right-0 z-50 w-72 bg-slate-900 text-white transform transition-all duration-300 ease-in-out shadow-2xl flex flex-col border-l border-slate-800
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                <Cpu className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-lg font-black text-white tracking-tight leading-none">AI PRINT</h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">By Eng. Loai</p>
             </div>
          </div>
          <div className="mt-6 flex flex-col items-start">
             <span className="text-xs text-slate-500 font-serif italic">ℓσαι 𝒜𝓂𝓮𝓻 🛠️</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <ul className="space-y-1.5 px-4">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onChangeView(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group active:scale-[0.98] ${
                    currentView === item.id 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                  {currentView === item.id && (
                    <div className="mr-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
             <span>v1.0.0 PRO</span>
             <span className="text-green-500 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                متصل الآن
             </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
