
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ErrorCodeLookup from './components/ErrorCodeLookup';
import About from './components/About';
import DriverFinder from './components/DriverFinder';
import FirmwareFinder from './components/FirmwareFinder';
import PrinterSpecsViewer from './components/PrinterSpecsViewer';
import Academy from './components/Academy';
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
      case AppView.ABOUT: return <About />;
      default: return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-['Tajawal']" dir="rtl">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center justify-between z-10 sticky top-0">
          <h1 className="text-lg font-bold text-indigo-400">AI Print by Loai</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
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
