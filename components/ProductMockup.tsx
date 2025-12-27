import React from 'react';
import { ProductType } from '../types';

interface ProductMockupProps {
  type: ProductType;
  imageUrl: string | null;
  className?: string;
}

const ProductMockup: React.FC<ProductMockupProps> = ({ type, imageUrl, className = '' }) => {
  
  const renderContent = () => {
    // Placeholder if no image
    const displayImage = imageUrl || 'https://picsum.photos/800/800';
    const isPlaceholder = !imageUrl;

    switch (type) {
      case ProductType.TSHIRT:
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-800 rounded-xl overflow-hidden shadow-2xl group">
             {/* T-Shirt SVG Shape */}
             <svg viewBox="0 0 512 512" className="w-4/5 h-4/5 text-zinc-200 fill-current drop-shadow-2xl filter contrast-125">
                <path d="M378.5,64.5c-15.8,18.1-40.4,20.8-40.4,20.8S316,22,256,22s-82.1,63.3-82.1,63.3s-24.6-2.7-40.4-20.8 c-13-15-77.5-12-77.5-12L24,206.5l68.5,23.5v260h327v-260l68.5-23.5l-32-154C456,52.5,391.5,49.5,378.5,64.5z" />
             </svg>
             {/* Texture Overlay */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none mix-blend-multiply opacity-50"></div>
             
             {/* Print Area Overlay */}
             <div className="absolute top-[28%] left-[50%] -translate-x-1/2 w-[32%] h-[32%] overflow-hidden mix-blend-multiply opacity-95">
                <img 
                  src={displayImage} 
                  alt="Design" 
                  className={`w-full h-full object-cover ${isPlaceholder ? 'opacity-30 grayscale' : ''}`}
                />
             </div>
             {/* Fabric Wrinkles (Simulated) */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
          </div>
        );

      case ProductType.HOODIE:
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <svg viewBox="0 0 512 512" className="w-[85%] h-[85%] text-slate-300 fill-current drop-shadow-2xl">
                {/* Simplified Hoodie Shape */}
                <path d="M256,0C190,0,150,40,150,90c0,10,2,20,5,28L60,160l40,40v260h312V200l40-40l-95-42c3-8,5-18,5-28C362,40,322,0,256,0z M256,20c50,0,80,30,80,70s-30,70-80,70s-80-30-80-70S206,20,256,20z M256,180c-20,0-40-5-55-15l-10,40l-10,180h150V205l-10-40C306,175,286,180,256,180z"/>
             </svg>
             {/* Print Area */}
             <div className="absolute top-[42%] left-[50%] -translate-x-1/2 w-[28%] h-[28%] overflow-hidden mix-blend-multiply opacity-95">
                <img 
                  src={displayImage} 
                  alt="Design" 
                  className={`w-full h-full object-cover ${isPlaceholder ? 'opacity-30 grayscale' : ''}`}
                />
             </div>
          </div>
        );

      case ProductType.POSTER:
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-800 rounded-xl overflow-hidden shadow-2xl p-8">
            <div className="relative w-3/4 h-[90%] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border-[16px] border-zinc-950 flex items-center justify-center overflow-hidden">
               {/* Reflection/Glass effect */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/20 z-20 pointer-events-none"></div>
               <img 
                  src={displayImage} 
                  alt="Design" 
                  className={`w-full h-full object-cover z-10 ${isPlaceholder ? 'opacity-30 grayscale' : ''}`}
                />
            </div>
            {/* Wall Shadow */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-black/40 blur-xl rounded-[100%]"></div>
          </div>
        );

      case ProductType.MUG:
        return (
           <div className="relative w-full h-full flex items-center justify-center bg-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="relative w-64 h-56 transform rotate-[-5deg]">
                {/* Handle */}
                <div className="absolute right-[-35px] top-8 w-28 h-40 border-[16px] border-zinc-100 rounded-r-3xl z-0 shadow-lg"></div>
                {/* Body */}
                <div className="relative w-full h-full bg-zinc-100 rounded-lg overflow-hidden z-10 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.1)] flex items-center justify-center">
                   {/* Cylindrical Lighting */}
                   <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-white/40 to-black/25 z-30 pointer-events-none mix-blend-hard-light"></div>
                   
                   <div className="w-[85%] h-[75%] overflow-hidden transform">
                      <img 
                        src={displayImage} 
                        alt="Design" 
                        className={`w-full h-full object-cover scale-150 ${isPlaceholder ? 'opacity-30 grayscale' : ''}`}
                      />
                   </div>
                </div>
              </div>
           </div>
        );
        
        case ProductType.NOTEBOOK:
            return (
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="relative w-64 h-84 bg-zinc-800 rounded-r-lg rounded-l-sm shadow-[20px_20px_60px_rgba(0,0,0,0.5)] flex overflow-hidden transform rotate-3">
                        {/* Spiral binding */}
                        <div className="w-10 h-full bg-zinc-900 flex flex-col justify-evenly py-4 border-r border-black/50 z-20 shadow-xl">
                            {[...Array(14)].map((_, i) => (
                                <div key={i} className="w-7 h-2.5 bg-zinc-400 rounded-full mx-auto shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]"></div>
                            ))}
                        </div>
                        {/* Cover */}
                        <div className="flex-1 relative overflow-hidden bg-zinc-900">
                             <img 
                                src={displayImage} 
                                alt="Design" 
                                className={`w-full h-full object-cover ${isPlaceholder ? 'opacity-30 grayscale' : ''}`}
                            />
                             {/* Leather Texture overlay */}
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay pointer-events-none"></div>
                             {/* Spine Shadow */}
                             <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10"></div>
                        </div>
                    </div>
                </div>
            )

      default:
        return <div>Unknown Product</div>;
    }
  };

  return (
    <div className={`transition-all duration-700 ease-out transform ${className}`}>
      {renderContent()}
    </div>
  );
};

export default ProductMockup;