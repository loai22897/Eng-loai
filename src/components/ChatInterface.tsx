
import React, { useState, useRef, useEffect } from 'react';
import { Message, FaultRecord } from '../types';
import { streamChatResponse, analyzeMultimodal } from '../services/geminiService';
import { Save, Send, Camera, Loader2 } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let extractedName = '';
    if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = (window as any).Telegram.WebApp.initDataUnsafe.user;
      extractedName = user.first_name || '';
      setUserName(extractedName);
    }
    const greeting = extractedName ? `أهلاً بك يا م. ${extractedName} 👋` : 'أهلاً بك يا هندسة 👋';
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        type: 'text',
        content: `${greeting}\nأنا مساعدك الذكي (AI Print) لصيانة الطابعات. تفضل، كيف يمكنني خدمتك؟`,
        timestamp: new Date()
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveToHistory = (msg: Message) => {
    const history = JSON.parse(localStorage.getItem('ai_print_history') || '[]');
    const newRecord: FaultRecord = {
      id: Date.now().toString(),
      title: msg.content.substring(0, 30) + '...',
      cause: 'تشخيص آلي',
      solution: msg.content,
      estimatedTime: '15-30 دقيقة',
      partsNeeded: 'راجع التفاصيل',
      timestamp: new Date()
    };
    localStorage.setItem('ai_print_history', JSON.stringify([newRecord, ...history]));
    alert('تم حفظ التشخيص بنجاح ✅');
  };

  const handleSendText = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', content: inputText, timestamp: new Date() };
    const prompt = inputText;
    setInputText('');
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: Message = { id: botMsgId, role: 'model', type: 'text', content: '', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
      await streamChatResponse(prompt, (currentText) => {
        setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, content: currentText } : msg));
      }, userName);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', type: 'image', content: 'صورة للتحليل', timestamp: new Date(), metadata: { imageUrl: base64String } }]);
      setIsLoading(true);
      try {
        const responseText = await analyzeMultimodal("حلل الصورة. ما العطل؟ وما الحل؟", base64Data, file.type, userName);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', type: 'text', content: responseText, timestamp: new Date() }]);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`relative max-w-[90%] md:max-w-[75%] rounded-[2rem] p-5 shadow-sm transition-all hover:shadow-md ${
              msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
            }`}>
              {msg.type === 'image' && msg.metadata?.imageUrl && (
                <img src={msg.metadata.imageUrl} alt="Uploaded" className="max-w-full rounded-2xl mb-3 max-h-64 object-cover" />
              )}
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-medium">
                {msg.content}
              </div>
              {msg.role === 'model' && msg.id !== 'welcome' && (
                <button 
                  onClick={() => saveToHistory(msg)}
                  className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-all"
                >
                  <Save size={12} /> حفظ في سجل الصيانات
                </button>
              )}
              <div className={`text-[10px] mt-3 opacity-60 font-bold ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && <Loader2 className="animate-spin text-blue-600 mx-auto" />}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-white border-t border-slate-100 shadow-2xl">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-100 text-slate-500 hover:text-blue-600 rounded-2xl transition-all active:scale-90"><Camera size={22} /></button>
          <input
            type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="صف العطل..." className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium shadow-inner"
          />
          <button onClick={handleSendText} disabled={!inputText.trim() || isLoading} className={`p-4 rounded-2xl transition-all active:scale-95 ${!inputText.trim() || isLoading ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'}`}><Send size={22} /></button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
