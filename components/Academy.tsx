
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { fetchLessonDetails, generateImage, analyzeMultimodal } from '../services/geminiService';
import { LessonContent, DeviceSegment, SEGMENTS_CONFIG, PRINTER_SERIES_SUGGESTIONS } from '../types';
import * as LucideIcons from 'lucide-react';
import { 
  Loader2, CheckCircle, PlayCircle, GraduationCap,
  ArrowRight, ListChecks, Lightbulb, 
  Image as ImageIcon, ChevronLeft, Home, Youtube,
  Search, Scan, Info, Maximize2, X,
  Monitor, ChevronDown, Minimize2, Layers, Maximize,
  Camera, CameraOff, RefreshCw, Zap, Cpu, AlertCircle, Sparkles
} from 'lucide-react';

const Academy: React.FC = () => {
  const [view, setView] = useState<'selector' | 'parts' | 'lesson'>('selector');
  const [selectedSegment, setSelectedSegment] = useState<DeviceSegment>('printers');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [activePart, setActivePart] = useState<any | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPiP, setIsPiP] = useState(false);

  // Camera & Analysis State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentSegmentConfig = SEGMENTS_CONFIG[selectedSegment];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredModels = useMemo(() => {
    let globalPool: string[] = [];
    (Object.values(currentSegmentConfig.suggestions) as string[][]).forEach(list => {
      globalPool = [...globalPool, ...list];
    });
    if (selectedSegment === 'printers') {
      (Object.values(PRINTER_SERIES_SUGGESTIONS) as string[][]).forEach(list => {
        globalPool = [...globalPool, ...list];
      });
    }
    const uniqueModels = Array.from(new Set(globalPool));
    const q = debouncedSearch.toLowerCase().trim();
    let results = uniqueModels.filter(m => {
      const matchQuery = m.toLowerCase().includes(q);
      const matchBrand = selectedBrand ? m.toLowerCase().includes(selectedBrand.toLowerCase()) : true;
      return matchQuery && matchBrand;
    });
    if (q.length >= 2 && !results.some(r => r.toLowerCase() === q)) {
      const prefix = selectedBrand ? `${selectedBrand} ` : '';
      const customModel = searchQuery.trim().startsWith(selectedBrand) ? searchQuery.trim() : `${prefix}${searchQuery.trim()}`;
      results = [customModel, ...results];
    }
    return results.sort((a, b) => {
        const aSuggested = uniqueModelsExist(a);
        const bSuggested = uniqueModelsExist(b);
        if (aSuggested && !bSuggested) return -1;
        if (!aSuggested && bSuggested) return 1;
        return a.localeCompare(b);
    }).slice(0, 50);
  }, [debouncedSearch, selectedBrand, selectedSegment, searchQuery]);

  function uniqueModelsExist(model: string) {
    let pool: string[] = [];
    (Object.values(SEGMENTS_CONFIG[selectedSegment].suggestions) as string[][]).forEach(list => {
      pool = [...pool, ...list];
    });
    if (selectedSegment === 'printers') {
      (Object.values(PRINTER_SERIES_SUGGESTIONS) as string[][]).forEach(list => {
        pool = [...pool, ...list];
      });
    }
    return pool.some(m => m.toLowerCase() === model.toLowerCase());
  }

  useEffect(() => {
    if (view === 'selector' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [view, searchQuery, selectedBrand]);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setView('parts');
  };

  const loadLesson = async (part: any) => {
    setActivePart(part);
    setIsLoadingLesson(true);
    setView('lesson');
    setIsPiP(false);
    setAnalysisResult(null);
    setLessonContent(null);
    setImageGenError(null);
    
    // FAST TRACK: Start both operations in parallel
    const lessonPromise = fetchLessonDetails(part.name, selectedModel);
    const imagePromise = triggerImageGeneration(part.name, selectedModel);

    try {
      const content = await lessonPromise;
      if (content) {
        setLessonContent(content);
        setIsLoadingLesson(false); // Text is ready, show it!
      }
      // Image will follow when imagePromise resolves inside triggerImageGeneration
    } catch (e) {
      console.error(e);
      setIsLoadingLesson(false);
    }
  };

  const triggerImageGeneration = async (partName: string, modelName: string) => {
    setIsImageGenerating(true);
    setImageGenError(null);
    try {
      const img = await generateImage(`${partName} ${modelName} printer spare part photo`);
      setLessonContent(prev => prev ? { ...prev, partImageUrl: img } : null);
    } catch (err: any) {
      console.error("Image gen error:", err);
      setImageGenError("تعذر توليد الصورة.");
    } finally {
      setIsImageGenerating(false);
    }
  };

  const retryImageGeneration = () => {
    if (activePart && selectedModel) {
      triggerImageGeneration(activePart.name, selectedModel);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setAnalysisResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("لا يمكن الوصول للكاميرا.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvasRef.current.toDataURL('image/jpeg');
    const base64Data = imageData.split(',')[1];
    stopCamera();
    setIsAnalyzing(true);
    try {
      const prompt = `تحليل حالة ${activePart?.name} في طابعة ${selectedModel}.`;
      const result = await analyzeMultimodal(prompt, base64Data, 'image/jpeg');
      setAnalysisResult(result);
    } catch (err) {
      setAnalysisResult("حدث خطأ أثناء التحليل.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFullScreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) videoContainerRef.current.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent className={className} /> : <Scan className={className} />;
  };

  const themeColorClass = () => {
    switch (selectedSegment) {
      case 'copiers': return 'emerald';
      case 'scanners': return 'indigo';
      default: return 'blue';
    }
  };

  const Header = () => (
    <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 p-3 sticky top-0 z-50 flex items-center justify-between shadow-sm px-6">
       <div className="flex items-center gap-3">
          <div className={`size-9 bg-${themeColorClass()}-600 rounded-lg flex items-center justify-center text-white shadow-lg`}>
             <GraduationCap size={18} />
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-xs leading-none mb-0.5">أكاديمية الصيانة</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Loai Academy</p>
          </div>
       </div>
       {view !== 'selector' && (
         <button onClick={() => { setView('selector'); setIsPiP(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 active:scale-90">
           <Home size={18} />
         </button>
       )}
    </div>
  );

  const SelectorView = () => (
    <div className="p-4 md:p-8 animate-fade-in space-y-5 max-w-2xl mx-auto">
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1.5 shadow-inner border border-slate-200">
         {(['printers', 'copiers', 'scanners'] as DeviceSegment[]).map(seg => (
           <button
             key={seg}
             onClick={() => { setSelectedSegment(seg); setSelectedBrand(''); setSearchQuery(''); }}
             className={`flex-1 flex flex-col items-center py-4 rounded-xl transition-all ${selectedSegment === seg ? `bg-white text-${SEGMENTS_CONFIG[seg].themeColor}-600 shadow-md scale-[1.02]` : 'text-slate-400 hover:text-slate-600'}`}
           >
              <span className="text-3xl md:text-4xl mb-2">{SEGMENTS_CONFIG[seg].icon}</span>
              <span className="font-black text-[9px] md:text-[10px] uppercase tracking-tighter">{SEGMENTS_CONFIG[seg].name}</span>
           </button>
         ))}
      </div>
      <div className="flex gap-1.5 items-center">
         <div className="relative w-[35%]">
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className={`w-full appearance-none bg-white p-2.5 pr-7 rounded-xl shadow-sm border border-slate-200 font-bold text-slate-700 outline-none text-[10px] md:text-xs focus:ring-2 focus:ring-${themeColorClass()}-500 h-11`}>
               <option value="">كل الماركات</option>
               {currentSegmentConfig.brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
         </div>
         <div className={`flex-1 bg-white p-0.5 rounded-xl shadow-sm border border-slate-200 flex items-center focus-within:ring-2 focus-within:ring-${themeColorClass()}-500 h-11`}>
            <input ref={searchInputRef} type="text" placeholder="اكتب أي موديل للتشخيص..." className="flex-1 bg-transparent px-3 py-2 text-right font-bold text-slate-800 outline-none text-xs placeholder:text-slate-300" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <div className={`p-2 text-${themeColorClass()}-400`}><Search size={16} /></div>
         </div>
      </div>
      <div className="space-y-1.5">
         <div className="flex justify-between items-center px-2">
            <span className="text-[8px] text-slate-300 font-mono">نتائج البحث: {filteredModels.length}</span>
            <h4 className="text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">قاعدة بيانات الموديلات الشاملة</h4>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredModels.length > 0 ? filteredModels.map((model, idx) => (
              <button key={`${model}-${idx}`} onClick={() => handleModelSelect(model)} className="w-full bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all text-right flex items-center justify-between group active:scale-[0.98]">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${model.toLowerCase().includes(debouncedSearch.toLowerCase()) && debouncedSearch !== '' ? 'text-indigo-600 bg-indigo-50' : 'text-red-600 bg-red-50'} px-1.5 py-0.5 rounded-md border border-current opacity-70`}>
                    <span className="text-[8px] font-black uppercase">Diagnose ⚡</span>
                  </div>
                  <ChevronLeft size={14} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-700 text-xs truncate max-w-[150px]">{model}</span>
                  {idx === 0 && searchQuery.trim() !== '' && !uniqueModelsExist(model) ? (
                    <Cpu size={14} className="text-indigo-400 animate-pulse" />
                  ) : (
                    <Monitor size={14} className="text-slate-300" />
                  )}
                </div>
              </button>
            )) : (
              <div className="col-span-full bg-slate-50 py-12 rounded-2xl text-center space-y-3 border border-dashed border-slate-200">
                <div className="relative inline-block">
                  <Search size={32} className="mx-auto text-slate-200" />
                  <Zap size={14} className="absolute -top-1 -right-1 text-amber-400 animate-bounce" />
                </div>
                <div>
                  <p className="text-slate-500 font-black text-xs">ابدأ بكتابة اسم الموديل</p>
                  <p className="text-slate-300 text-[9px] mt-1">البحث يدعم جميع الماركات والموديلات العالمية</p>
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );

  const PartsNavigationView = () => (
    <div className="p-4 md:p-8 animate-fade-in space-y-5 max-w-2xl mx-auto">
       <div className="flex items-center justify-between sticky top-[60px] z-40 bg-white/80 backdrop-blur-md py-3 px-3 rounded-xl border border-slate-100 shadow-sm">
          <button onClick={() => setView('selector')} className={`p-1.5 bg-slate-100 rounded-lg text-${themeColorClass()}-600 active:scale-90 transition-transform`}><ArrowRight size={18} /></button>
          <div className="text-right">
             <h3 className="text-base font-black text-slate-900">{selectedModel}</h3>
             <p className="text-[8px] text-slate-400 font-bold">Maintenance Blueprint</p>
          </div>
       </div>
       <div className="flex flex-col gap-3">
          {currentSegmentConfig.parts.map((part: any) => (
            <button key={part.id} onClick={() => loadLesson(part)} className="w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-right flex items-center gap-4 group active:scale-95">
               <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-xs mb-0.5">{part.name}</h4>
                  <p className="text-[8px] text-slate-400 font-medium leading-tight">{part.description}</p>
               </div>
               <div className={`size-11 ${part.color} rounded-lg flex items-center justify-center text-white shadow-lg shrink-0`}>
                  <DynamicIcon name={part.icon} className="size-5" />
               </div>
            </button>
          ))}
       </div>
    </div>
  );

  const LessonDetailView = () => (
    <div className="p-4 pb-32 space-y-5 animate-fade-in max-w-2xl mx-auto relative">
       {isCameraActive && (
         <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-3xl border-4 border-white/20 shadow-2xl" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-4 mt-8">
               <button onClick={stopCamera} className="p-4 bg-white/10 text-white rounded-full"><X size={24} /></button>
               <button onClick={captureAndAnalyze} className="p-6 bg-red-600 text-white rounded-full shadow-2xl active:scale-95 transition-all"><Camera size={32} /></button>
            </div>
         </div>
       )}

       {isLoadingLesson ? (
          <div className="h-64 bg-white rounded-2xl flex flex-col items-center justify-center gap-4 border border-slate-100">
             <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
             <p className="text-[10px] font-black uppercase text-slate-400">تحميل البيانات السريع...</p>
          </div>
       ) : (
         <>
           <div ref={videoContainerRef} className={`bg-black rounded-2xl shadow-xl border border-slate-800 overflow-hidden group relative transition-all duration-500 ${isPiP ? 'fixed bottom-6 right-6 w-64 z-[60]' : 'aspect-video w-full'}`}>
              <iframe src={`https://www.youtube.com/embed/${lessonContent?.videoId}?autoplay=1&rel=0`} title="Maintenance Lesson" className="w-full h-full border-none" allowFullScreen></iframe>
              <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button onClick={toggleFullScreen} className="p-1.5 bg-black/60 text-white rounded-md"><Maximize size={14} /></button>
                 <button onClick={() => setIsPiP(!isPiP)} className="p-1.5 bg-black/60 text-white rounded-md"><Layers size={14} /></button>
              </div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-lg text-right">
              <div className="flex items-center justify-between mb-3 px-1">
                 <button onClick={startCamera} className={`flex items-center gap-2 px-3 py-1.5 bg-${themeColorClass()}-50 text-${themeColorClass()}-600 rounded-full border border-${themeColorClass()}-100 active:scale-95 transition-all`}>
                    <span className="text-[9px] font-black uppercase tracking-wider">التقط صورة للتحليل</span>
                    <Camera size={14} />
                 </button>
                 <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                    <Sparkles size={12} className="text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-700 uppercase">Pro Image 1K</span>
                 </div>
              </div>
              
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-100 group flex items-center justify-center">
                 {lessonContent?.partImageUrl ? (
                    <>
                      <img src={lessonContent.partImageUrl} alt="Technical View" className={`w-full h-full object-cover transition-all duration-700 ${isZoomed ? 'scale-150' : 'scale-100'}`} onClick={() => setIsZoomed(!isZoomed)} />
                      <div className="absolute top-3 left-3 p-1.5 bg-white/90 rounded-md text-blue-600 shadow-md" onClick={() => setIsZoomed(!isZoomed)}><Maximize2 size={12} /></div>
                    </>
                 ) : isImageGenerating ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                       <div className="relative">
                          <Loader2 size={32} className={`text-${themeColorClass()}-600 animate-spin`} />
                          <Sparkles size={14} className="absolute inset-0 m-auto text-indigo-500 animate-pulse" />
                       </div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">جاري الرسم الفوتوغرافية السريع...</p>
                    </div>
                 ) : imageGenError ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                       <AlertCircle size={32} className="text-red-400" />
                       <p className="text-[10px] font-bold text-slate-500">{imageGenError}</p>
                       <button onClick={retryImageGeneration} className="text-[9px] font-black text-blue-600 underline flex items-center gap-1">إعادة المحاولة <RefreshCw size={10} /></button>
                    </div>
                 ) : (
                   <div className="text-slate-200"><ImageIcon size={48} /></div>
                 )}
              </div>

              {(isAnalyzing || analysisResult) && (
                <div className={`mt-4 p-4 rounded-xl border animate-fade-in ${isAnalyzing ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-100'}`}>
                   <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
                      {isAnalyzing ? "جاري تحليل صورتك..." : "نتيجة فحص المهندس الذكي"}
                      {isAnalyzing ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} className="text-emerald-600" />}
                   </h5>
                   {isAnalyzing ? (
                     <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600 w-1/2 animate-[shimmer_2s_infinite]"></div></div>
                   ) : (
                     <p className="text-slate-800 text-xs font-bold leading-relaxed text-right">{analysisResult}</p>
                   )}
                </div>
              )}
           </div>

           <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-right">
                 <h4 className="text-xs font-black text-slate-900 mb-5 flex items-center justify-end gap-2"><ListChecks size={16} className="text-emerald-600" /> خطوات الإصلاح</h4>
                 <div className="space-y-5">
                    {lessonContent?.steps.map((s, i) => (
                      <div key={i} className="flex gap-3 items-start justify-end group">
                         <p className="text-slate-800 leading-relaxed font-bold text-xs pt-0.5 flex-1">{s}</p>
                         <span className={`size-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shrink-0 group-hover:bg-${themeColorClass()}-600 transition-all`}>{i+1}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl text-white shadow-xl text-right">
                 <h4 className="text-xs font-black mb-3 flex items-center justify-end gap-2 text-amber-400"><Lightbulb size={16} /> وصية م. لؤي</h4>
                 <p className="text-slate-300 leading-relaxed font-bold italic text-xs border-r-4 border-blue-600 pr-3">{lessonContent?.goldenTip}</p>
              </div>
           </div>

           <button onClick={() => { setView('parts'); setIsPiP(false); }} className={`w-full py-5 bg-${themeColorClass()}-600 text-white rounded-xl font-black text-base shadow-xl active:scale-95 flex items-center justify-center gap-2.5`}>
             <CheckCircle size={20} /> إنهاء الدرس
           </button>
         </>
       )}
    </div>
  );

  return (
    <div className="h-full bg-slate-50 overflow-hidden flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
         {view === 'selector' && <SelectorView />}
         {view === 'parts' && <PartsNavigationView />}
         {view === 'lesson' && <LessonDetailView />}
      </main>
    </div>
  );
};

export default Academy;
