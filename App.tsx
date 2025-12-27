
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ErrorCodeLookup from './components/ErrorCodeLookup';
import About from './components/About';
import DriverFinder from './components/DriverFinder';
import FirmwareFinder from './components/FirmwareFinder';
import PrinterSpecsViewer from './components/PrinterSpecsViewer';
import Academy from './components/Academy';
import MaintenanceHistory from './components/MaintenanceHistory';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Cast window to any to access Telegram property without TS errors
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.ready();
      (window as any).Telegram.WebApp.expand();
    }
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT: return <ChatInterface />;
      case AppView.PRINTER_SPECS: return <PrinterSpecsViewer />;
      case AppView.ERROR_CODES: return <ErrorCodeLookup />;
      case AppView.DRIVERS: return <DriverFinder />;
      case AppView.FIRMWARE: return <FirmwareFinder />;
      case AppView.ACADEMY: return <Academy />;
      case AppView.HISTORY: return <MaintenanceHistory />;
      case AppView.ABOUT: return <About />;
      default: return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-zinc-100 font-['Tajawal']" dir="rtl">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden bg-white md:rounded-r-[2.5rem] shadow-inner">
        {/* Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between z-40 sticky top-0">
          <h1 className="text-lg font-black text-blue-600 tracking-tighter">AI PRINT</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl active:scale-90 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
