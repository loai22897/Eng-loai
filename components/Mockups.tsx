
import React from 'react';
import { PrintFormat } from '../types';
import { Eye } from 'lucide-react';

interface MockupsProps {
  imageUrl: string | null;
  activeFormat: PrintFormat;
}

const Mockups: React.FC<MockupsProps> = ({ imageUrl, activeFormat }) => {
  const mockups = [
    {
      id: 'poster',
      name: 'Art Gallery',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop',
      type: PrintFormat.POSTER
    },
    {
      id: 'tshirt',
      name: 'Lifestyle',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
      type: PrintFormat.TSHIRT
    },
    {
      id: 'mug',
      name: 'Workspace',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop',
      type: PrintFormat.MUG
    },
    {
      id: 'card',
      name: 'Studio',
      image: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?q=80&w=1000&auto=format&fit=crop',
      type: PrintFormat.BUSINESS_CARD
    }
  ];

  return (
    <div className="w-80 h-screen bg-zinc-950 border-l border-zinc-800 flex flex-col">
      <header className="h-14 flex items-center gap-2 px-6 border-b border-zinc-800">
        <Eye className="w-4 h-4 text-zinc-500" />
        <span className="text-sm font-bold text-white tracking-tight uppercase">Live Mockups</span>
      </header>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {mockups.map((mockup) => (
          <div key={mockup.id} className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${activeFormat === mockup.type ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.02]' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}>
            <div className="aspect-[4/3] bg-zinc-900 overflow-hidden relative">
              <img 
                src={mockup.image} 
                alt={mockup.name} 
                className="w-full h-full object-cover grayscale opacity-50"
              />
              
              {/* Design Overlay */}
              {imageUrl && (
                <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                  <div className={`relative shadow-2xl transition-all duration-500 ${
                    mockup.type === PrintFormat.POSTER ? 'w-1/2 aspect-[3/4] rotate-[-2deg]' :
                    mockup.type === PrintFormat.TSHIRT ? 'w-1/3 aspect-[3/4] translate-y-2' :
                    mockup.type === PrintFormat.MUG ? 'w-1/4 aspect-square -translate-x-4' :
                    'w-1/2 aspect-[3/2] rotate-1'
                  }`}>
                    <img 
                      src={imageUrl} 
                      className="w-full h-full object-cover rounded-[1px]" 
                      style={{ filter: 'contrast(1.1) brightness(0.9) saturate(1.1)' }}
                    />
                    <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
                  </div>
                </div>
              )}

              {!imageUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-zinc-800 border-dashed animate-pulse" />
                </div>
              )}
            </div>
            
            <div className="p-3 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{mockup.name}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${activeFormat === mockup.type ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-zinc-800'}`} />
            </div>
          </div>
        ))}
        
        <div className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-xl">
          <p className="text-[10px] text-zinc-500 text-center leading-relaxed italic">
            "Design is a silent ambassador of your brand."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Mockups;
