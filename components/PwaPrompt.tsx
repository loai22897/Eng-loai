
import React, { useState, useEffect } from 'react';
import { Download, X, Star, Smartphone } from 'lucide-react';

const PwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the custom prompt if user is on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        // Delay showing to not annoy user immediately
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-slide-up md:left-auto md:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-1">
            <button onClick={() => setShowPrompt(false)} className="p-1 text-slate-300 hover:text-slate-500">
                <X size={18} />
            </button>
        </div>
        <div className="flex gap-4">
          <div className="size-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
             <Smartphone size={28} />
          </div>
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-amber-400 text-amber-400" />)}
            </div>
            <h4 className="font-black text-slate-800 text-sm mb-1">تطبيق الأكاديمية على جوالك</h4>
            <p className="text-[10px] text-slate-500 font-bold leading-tight">ثبّت التطبيق الآن للوصول السريع لجميع الأدوات الفنية حتى بدون إنترنت.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
            <button 
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Download size={14} /> تثبيت التطبيق
            </button>
            <button 
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
            >
                ليس الآن
            </button>
        </div>
      </div>
    </div>
  );
};

export default PwaPrompt;
