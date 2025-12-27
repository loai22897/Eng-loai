
import React from 'react';
import { AspectRatio, PrintFormat } from '../types';
import { Download, Maximize, Move, Printer } from 'lucide-react';

interface DesignCanvasProps {
  imageUrl: string | null;
  aspectRatio: AspectRatio;
  format: PrintFormat;
  isLoading: boolean;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({ imageUrl, aspectRatio, format, isLoading }) => {
  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case AspectRatio.SQUARE: return 'aspect-square';
      case AspectRatio.POSTER: return 'aspect-[3/4]';
      case AspectRatio.LANDSCAPE: return 'aspect-[4/3]';
      case AspectRatio.WIDE: return 'aspect-[16/9]';
      default: return 'aspect-square';
    }
  };

  const getFormatLabel = () => {
    switch (format) {
      case PrintFormat.POSTER: return "High-Gloss Paper (18x24\")";
      case PrintFormat.TSHIRT: return "Cotton Canvas Tee (L)";
      case PrintFormat.MUG: return "Ceramic Mug (11oz)";
      case PrintFormat.BUSINESS_CARD: return "Matte Finish (3.5x2\")";
      default: return "Standard Print";
    }
  };

  return (
    <div className="flex-1 bg-zinc-900 flex flex-col relative overflow-hidden">
      {/* Canvas Header */}
      <header className="h-14 bg-zinc-950/50 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            {getFormatLabel()}
          </span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            {aspectRatio} Workspace
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={!imageUrl}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            disabled={!imageUrl}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-bold rounded-lg transition-colors disabled:opacity-30"
          >
            <Printer className="w-4 h-4" />
            Export for Print
          </button>
        </div>
      </header>

      {/* Main Working Area */}
      <div className="flex-1 p-12 flex items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        <div className={`relative w-full max-w-2xl bg-zinc-950 shadow-2xl rounded-sm border-8 border-zinc-800/50 overflow-hidden transition-all duration-700 ${getAspectRatioStyle()} ${isLoading ? 'blur-sm' : ''}`}>
          
          {!imageUrl && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 space-y-4">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center">
                <Sparkles className="w-10 h-10 opacity-20" />
              </div>
              <p className="text-sm font-medium">Define a prompt to start designing</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-zinc-400 text-sm animate-pulse">Gemini is sketching...</p>
            </div>
          )}

          {imageUrl && (
            <div className="w-full h-full relative group">
              <img 
                src={imageUrl} 
                alt="AI Design" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              
              {/* Tool Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                  <Move className="w-4 h-4" />
                </button>
                <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Print Specs */}
        {imageUrl && (
          <div className="absolute top-8 right-8 space-y-2">
            <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-xl w-48">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Print Resolution</h4>
              <div className="flex items-center justify-between text-xs font-medium text-white">
                <span>DPI</span>
                <span className="text-indigo-400 font-bold">300 Optimized</span>
              </div>
              <div className="mt-2 h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[95%]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper internal component to avoid external dependency issues
const Sparkles = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

export default DesignCanvas;
