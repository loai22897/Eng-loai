import React from 'react';
import { Mic, MicOff, Activity, AlertCircle } from 'lucide-react';
import { useLiveGemini } from '../hooks/useLiveGemini';

export const LiveInterface: React.FC = () => {
  const { connectionState, connect, disconnect, volume } = useLiveGemini();

  // Visualizer bars
  const bars = 12;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-900/50 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl transition-all duration-1000 ${connectionState === 'connected' ? 'opacity-100 scale-125' : 'opacity-0 scale-75'}`}></div>
      </div>

      <div className="z-10 flex flex-col items-center gap-12 max-w-md w-full">
        
        {/* Status Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Gemini Live</h2>
          <p className="text-slate-400">Real-time low-latency voice conversation</p>
          <div className="flex items-center justify-center gap-2 mt-4">
             <div className={`w-2 h-2 rounded-full ${
               connectionState === 'connected' ? 'bg-emerald-500 animate-pulse' : 
               connectionState === 'connecting' ? 'bg-amber-500 animate-bounce' : 
               connectionState === 'error' ? 'bg-red-500' : 'bg-slate-600'
             }`} />
             <span className="text-xs font-mono uppercase tracking-wider text-slate-500">{connectionState}</span>
          </div>
        </div>

        {/* Visualizer / Main Interaction Area */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* Circular Rings */}
          <div className={`absolute inset-0 border-2 border-slate-700 rounded-full transition-all duration-700 ${connectionState === 'connected' ? 'scale-110 border-sky-500/30' : 'scale-100'}`}></div>
          <div className={`absolute inset-4 border border-slate-700 rounded-full transition-all duration-700 delay-100 ${connectionState === 'connected' ? 'scale-110 border-indigo-500/30' : 'scale-100'}`}></div>

          {/* Dynamic Visualizer Bars */}
          <div className="absolute flex items-end gap-1 h-32">
             {Array.from({ length: bars }).map((_, i) => {
               // Pseudo-random height modulation based on volume and index
               const heightMod = Math.max(0.2, volume * (1 + Math.sin(i * 0.5)) * 1.5);
               const h = Math.min(100, heightMod * 100); 
               
               return (
                 <div 
                    key={i} 
                    className={`w-3 bg-gradient-to-t from-sky-600 to-indigo-400 rounded-full transition-all duration-75`}
                    style={{ 
                      height: connectionState === 'connected' ? `${h}%` : '20%',
                      opacity: connectionState === 'connected' ? 0.8 + (volume * 0.2) : 0.2
                    }}
                 />
               );
             })}
          </div>

          {/* Icon in Center */}
          <div className="z-20 p-6 bg-slate-900 rounded-full border border-slate-700 shadow-xl">
            {connectionState === 'error' ? <AlertCircle className="w-8 h-8 text-red-500" /> : <Activity className={`w-8 h-8 ${connectionState === 'connected' ? 'text-sky-400' : 'text-slate-600'}`} />}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {connectionState !== 'connected' && connectionState !== 'connecting' ? (
            <button
              onClick={connect}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-full font-semibold shadow-lg shadow-sky-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="w-5 h-5" />
              <span>Start Conversation</span>
            </button>
          ) : (
             <button
              onClick={disconnect}
              disabled={connectionState === 'connecting'}
              className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 border border-slate-700 hover:border-red-500/50 rounded-full font-semibold transition-all"
            >
              <MicOff className="w-5 h-5" />
              <span>End Session</span>
            </button>
          )}
        </div>

        {/* Hints */}
        <div className="text-center text-sm text-slate-500 max-w-xs">
          {connectionState === 'connected' 
             ? "Gemini is listening. Speak naturally." 
             : "Requires microphone access. Works best in a quiet environment."}
        </div>

      </div>
    </div>
  );
};