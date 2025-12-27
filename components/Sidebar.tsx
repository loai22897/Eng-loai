
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: AppView.CHAT, label: 'المحادثة والتشخيص', icon: '💬' },
    { id: AppView.PRINTER_SPECS, label: 'مواصفات الطابعات', icon: '📋' },
    { id: AppView.DRIVERS, label: 'البحث عن تعريفات', icon: '💾' },
    { id: AppView.FIRMWARE, label: 'تحديث السوفتوير', icon: '🔄' },
    { id: AppView.ERROR_CODES, label: 'موسوعة الأكواد', icon: '🔢' },
    { id: AppView.ACADEMY, label: 'أكاديمية الصيانة', icon: '🎓' },
    { id: AppView.ABOUT, label: 'عن النظام', icon: 'ℹ️' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 right-0 z-30 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out shadow-xl flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-blue-400">AI Print by Loai</h1>
          <div className="mt-3">
             <p className="text-xs text-slate-400">تطوير: م. لؤي عامر</p>
             <p className="text-sm text-indigo-300 font-serif italic mt-1 tracking-wider" style={{fontFamily: 'serif'}}>ℓσαι 𝒜𝓂𝓮𝓻 😏</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onChangeView(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 active:scale-95 ${
                    currentView === item.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500">
          الإصدار 1.0.0
        </div>
      </div>
    </>
  );
};

export default Sidebar;
