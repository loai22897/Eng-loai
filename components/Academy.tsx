
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { fetchLessonDetails, generateImage, analyzeMultimodal } from '../services/geminiService';
import { LessonContent, DeviceSegment, SEGMENTS_CONFIG, PRINTER_SERIES_SUGGESTIONS } from '../types';
import { 
  Loader2, CheckCircle, GraduationCap,
  ArrowRight, ListChecks, Lightbulb, 
  Image as ImageIcon, ChevronLeft, Home,
  Search, Scan, Maximize2, X,
  Monitor, ChevronDown, Layers, Maximize,
  Camera, RefreshCw, Zap, Cpu, AlertCircle, Sparkles,
  Flame, Repeat, Droplets, Box, Circle, Navigation
} from 'lucide-react';

// Safe mapping for dynamic icons to ensure Rollup resolves them correctly
const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap, Loader2, CheckCircle, ArrowRight, ListChecks, 
  Lightbulb, ImageIcon, ChevronLeft, Home, Search, Scan, 
  Maximize2, X, Monitor, ChevronDown, Layers, Maximize, 
  Camera, RefreshCw, Zap, Cpu, AlertCircle, Sparkles,
  Flame, Repeat, Droplets, Box, Circle, Navigation
};

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

  const themeStyles = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-100', ring: 'focus:ring-blue-500', lightBg: 'bg-blue-50' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-100', ring: 'focus:ring-emerald-500', lightBg: 'bg-emerald-50' },
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-100', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-50' }
  };

  const currentStyle = themeStyles[currentSegmentConfig.themeColor];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredModels = useMemo(() => {
    let globalPool: string[] = [];
    Object.values(currentSegmentConfig.suggestions).forEach(list => { globalPool = [...globalPool, ...list]; });
    if (selectedSegment === 'printers') {
      Object.values(PRINTER_SERIES_SUGGESTIONS).forEach(list => { globalPool = [...globalPool, ...list]; });
    }
    const uniqueModels = Array.from(new Set(globalPool));
    const q = debouncedSearch.toLowerCase().trim();
    return uniqueModels.filter(m => {
      const matchQuery = m.toLowerCase().includes(q);
      const matchBrand = selectedBrand ? m.toLowerCase().includes(selectedBrand.toLowerCase()) : true;
      return matchQuery && matchBrand;
    }).slice(0, 50);
  }, [debouncedSearch, selectedBrand, selectedSegment]);

  const loadLesson = async (part: any) => {
    setActivePart(part);
    setIsLoadingLesson(true);
    setView('lesson');
    try {
      const content = await fetchLessonDetails(part.name, selectedModel);
      if (content) {
        setLessonContent(content);
        setIsLoadingLesson(false);
        triggerImageGeneration(part.name, selectedModel);
      }
    } catch (e) { setIsLoadingLesson(false); }
  };

  const triggerImageGeneration = async (partName: string, modelName: string) => {
    setIsImageGenerating(true);
    try {
      const img = await generateImage(`${partName} ${modelName} technical component`);
      setLessonContent(prev => prev ? { ...prev, partImageUrl: img } : null);
    } catch (err) { setImageGenError("Image failed"); } finally { setIsImageGenerating(false); }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { setIsCameraActive(false); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
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
    stopCamera();
    setIsAnalyzing(true);
    try {
      const res = await analyzeMultimodal("حلل الصورة", imageData.split(',')[1], 'image/jpeg');
      setAnalysisResult(res);
    } finally { setIsAnalyzing(false); }
  };

  const renderIcon = (name: string, className?: string) => {
    const IconComp = ICON_MAP[name] || Scan;
    return <IconComp className={className} />;
  };

  return (
    <div className="h-full bg-slate-50 overflow-hidden flex flex-col font-tajawal">
      <div className="bg-white border-b border-slate-100 p-3 sticky top-0 z-50 flex items-center justify-between shadow-sm px-6">
        <div className="flex items-center gap-3">
          <div className={`size-9 ${currentStyle.bg} rounded-lg flex items-center justify-center text-white`}><GraduationCap size={18} /></div>
          <div><h1 className="font-black text-slate-800 text-xs leading-none">أكاديمية الصيانة</h1></div>
        </div>
        {view !== 'selector' && <button onClick={() => setView('selector')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Home size={18} /></button>}
      </div>
      
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {view === 'selector' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1.5">
              {(['printers', 'copiers', 'scanners'] as DeviceSegment[]).map(seg => (
                <button key={seg} onClick={() => setSelectedSegment(seg)} className={`flex-1 py-4 rounded-xl transition-all ${selectedSegment === seg ? 'bg-white shadow-md' : 'text-slate-400'}`}>
                  <span className="text-2xl mb-1 block">{SEGMENTS_CONFIG[seg].icon}</span>
                  <span className="font-black text-[10px] uppercase">{SEGMENTS_CONFIG[seg].name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-1/3 bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-bold">
                <option value="">كل الماركات</option>
                {currentSegmentConfig.brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <div className="flex-1 bg-white p-2 rounded-xl border border-slate-200 flex items-center shadow-sm">
                <input type="text" placeholder="ابحث عن موديل..." className="flex-1 bg-transparent px-2 text-right text-xs outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Search size={14} className="text-slate-300" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredModels.map((m, i) => (
                <button key={i} onClick={() => { setSelectedModel(m); setView('parts'); }} className="bg-white p-4 rounded-xl border border-slate-100 text-right hover:border-blue-300 transition-all font-bold text-xs shadow-sm flex justify-between items-center">
                  <ChevronLeft size={14} className="text-slate-200" /> {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'parts' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
              <button onClick={() => setView('selector')} className="p-2 bg-slate-100 rounded-lg"><ArrowRight size={18} /></button>
              <h3 className="font-black text-slate-900">{selectedModel}</h3>
            </div>
            {currentSegmentConfig.parts.map(p => (
              <button key={p.id} onClick={() => loadLesson(p)} className="w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 text-right hover:shadow-md transition-all">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-xs">{p.name}</h4>
                  <p className="text-[10px] text-slate-400">{p.description}</p>
                </div>
                <div className={`size-11 ${p.color} rounded-lg flex items-center justify-center text-white shadow-lg`}>
                  {renderIcon(p.icon, "size-5")}
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'lesson' && !isLoadingLesson && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
              <iframe src={`https://www.youtube.com/embed/${lessonContent?.videoId}`} className="w-full h-full" allowFullScreen></iframe>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-right">
              <div className="flex justify-between items-center mb-4">
                <button onClick={startCamera} className={`flex items-center gap-2 px-4 py-2 ${currentStyle.lightBg} ${currentStyle.text} rounded-full font-bold text-[10px]`}>
                   كاميرا الفحص <Camera size={14} />
                </button>
                <span className="font-black text-slate-400 text-[10px]">عرض فني للقطعة</span>
              </div>
              <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center">
                 {lessonContent?.partImageUrl ? <img src={lessonContent.partImageUrl} className="w-full h-full object-cover" /> : <Loader2 className="animate-spin text-slate-300" />}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-right">
              <h4 className="font-black text-slate-900 text-xs mb-4">خطوات الصيانة</h4>
              {lessonContent?.steps.map((s, i) => (
                <div key={i} className="flex gap-3 mb-4 last:mb-0 justify-end">
                  <p className="text-slate-700 text-xs font-bold leading-relaxed">{s}</p>
                  <span className="size-6 bg-slate-900 text-white flex items-center justify-center rounded text-[10px] font-black shrink-0">{i+1}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setView('parts')} className={`w-full py-4 ${currentStyle.bg} text-white rounded-xl font-black shadow-lg`}>تم الإنجاز</button>
          </div>
        )}
      </main>
      
      {isCameraActive && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-6 mt-10">
            <button onClick={stopCamera} className="p-4 bg-white/20 rounded-full text-white"><X size={24} /></button>
            <button onClick={captureAndAnalyze} className="p-6 bg-red-600 rounded-full text-white shadow-2xl"><Camera size={32} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;
