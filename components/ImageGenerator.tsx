import React, { useState } from 'react';
import { Wand2, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { generateImage } from '../services/geminiService';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const base64Image = await generateImage(prompt);
      setResultImage(base64Image);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-purple-400" />
          Creative Studio
        </h2>
        <p className="text-slate-400 text-sm mt-1">Generate images using Gemini 2.5 Flash Image</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        
        {/* Output Display */}
        <div className="w-full max-w-2xl aspect-square bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center mb-8 relative overflow-hidden group">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Wand2 className="w-6 h-6 text-purple-500 animate-pulse" />
                </div>
              </div>
              <p className="text-purple-400 font-medium animate-pulse">Dreaming up your image...</p>
            </div>
          ) : resultImage ? (
            <>
              <img src={resultImage} alt="Generated result" className="w-full h-full object-contain bg-black" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a 
                  href={resultImage} 
                  download={`gemini-generated-${Date.now()}.png`}
                  className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-purple-50 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  <Download className="w-5 h-5" /> Download
                </a>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 p-8">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No image generated yet</p>
              <p className="text-sm">Enter a prompt below to start creating</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center p-8 text-center">
              <div className="text-red-400">
                <p className="font-bold text-lg mb-2">Generation Failed</p>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-4 text-slate-300 underline hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="w-full max-w-2xl space-y-4">
          <label className="block text-sm font-medium text-slate-300">Prompt</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to see... e.g. 'A futuristic city on Mars in synthwave style'"
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Generate
            </button>
          </div>
          
          <div className="flex gap-2 text-xs text-slate-500">
             <span>Try:</span>
             <button onClick={() => setPrompt("A cute robot holding a flower, cinematic lighting, 8k")} className="hover:text-purple-400 transition-colors">"Robot holding flower"</button>
             <span>•</span>
             <button onClick={() => setPrompt("Cyberpunk street food vendor in Tokyo, neon lights, rain")} className="hover:text-purple-400 transition-colors">"Cyberpunk Tokyo"</button>
          </div>
        </div>

      </div>
    </div>
  );
};