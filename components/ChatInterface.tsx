
import React, { useState, useRef, useEffect } from 'react';
import { Message, InvoiceData, PartLookupData } from '../types';
import { streamChatResponse, analyzeMultimodal } from '../services/geminiService';
import InvoiceCard from './InvoiceCard';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userName, setUserName] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize User Info from Telegram and Set Welcome Message
  useEffect(() => {
    let extractedName = '';
    
    // Check if running inside Telegram - casting window to any
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
        content: `${greeting}
أنا مساعدك الذكي (AI Print by Loai) لصيانة الطابعات.

يمكنني مساعدتك في:
🔹 تشخيص الأعطال بالصور أو الصوت.
🔹 العثور على **روابط التعريفات** الرسمية مباشرة.
🔹 إنشاء **فواتير صيانة** احترافية للعملاء.
🔹 **البحث عن أرقام قطع الغيار (PN)** بالوصف فقط.

تفضل، كيف يمكنني خدمتك اليوم؟`,
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

  const handleSendText = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: inputText,
      timestamp: new Date()
    };

    const prompt = inputText;
    setInputText('');
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Create a placeholder message for the bot
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botMsgId,
        role: 'model',
        type: 'text',
        content: '',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);

      // Stream the response - updated streamChatResponse signature is now handled
      await streamChatResponse(
        prompt, 
        (currentText) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMsgId 
                ? { ...msg, content: currentText } 
                : msg
            )
          );
        }, 
        userName,
        (invoiceData: InvoiceData) => {
           const invoiceMsg: Message = {
              id: (Date.now() + 5).toString(),
              role: 'model',
              type: 'invoice',
              content: 'فاتورة صيانة',
              timestamp: new Date(),
              invoiceData: invoiceData
           };
           setMessages(prev => [...prev, invoiceMsg]);
        },
        (partData: PartLookupData) => {
            // Render Part Data Card
            const partMsg: Message = {
                id: (Date.now() + 6).toString(),
                role: 'model',
                type: 'part_lookup',
                content: 'نتيجة بحث قطعة الغيار',
                timestamp: new Date(),
                partData: partData
            };
            setMessages(prev => [...prev, partMsg]);
        }
      );

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        type: 'text',
        content: "عذراً، حدث خطأ ما. حاول مرة أخرى.",
        timestamp: new Date()
      };
       setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input
    event.target.value = '';

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      const mimeType = file.type;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        type: 'image',
        content: 'صورة للتحليل',
        timestamp: new Date(),
        metadata: { imageUrl: base64String }
      };

      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const responseText = await analyzeMultimodal(
          "حلل الصورة. ما العطل؟ وما الحل؟ (اشرح بأسلوب مهندس لمهندس)",
          base64Data,
          mimeType,
          userName
        );
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          type: 'text',
          content: responseText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); 
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          const mimeType = audioBlob.type.includes('wav') ? 'audio/wav' : 'audio/webm'; 

          const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            type: 'audio',
            content: 'تسجيل صوتي',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, userMsg]);
          setIsLoading(true);

          try {
             const responseText = await analyzeMultimodal(
              "اسمع الصوت. حدد المشكلة والقطعة التالفة.",
              base64Data,
              mimeType,
              userName
            );
            const botMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              type: 'text',
              content: responseText,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("لا يمكن الوصول للميكروفون.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.type === 'invoice' || msg.type === 'part_lookup'
                ? 'bg-transparent shadow-none p-0 w-full max-w-xl' 
                : msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              {msg.type === 'image' && msg.metadata?.imageUrl && (
                <img 
                  src={msg.metadata.imageUrl} 
                  alt="Uploaded" 
                  className="max-w-full rounded-lg mb-2 max-h-64 object-contain bg-black/10" 
                />
              )}
              
              {msg.type === 'audio' && (
                <div className="flex items-center space-x-2 space-x-reverse mb-2 bg-white/20 p-2 rounded">
                  <span>🎤</span>
                  <span>تسجيل صوتي</span>
                </div>
              )}

              {/* Render content as Markdown for links and bold text if NOT invoice or part lookup */}
              {msg.type !== 'invoice' && msg.type !== 'part_lookup' && (
                  <div 
                    className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-medium prose prose-slate max-w-none prose-p:my-1 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-headings:text-slate-800 prose-strong:text-slate-900"
                    dangerouslySetInnerHTML={{ 
                        // Basic markdown parser for links and bold
                        __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // Links
                            .replace(/\n/g, '<br/>')
                    }} 
                  />
              )}
              
              {/* Invoice Rendering */}
              {msg.type === 'invoice' && msg.invoiceData && (
                <InvoiceCard data={msg.invoiceData} />
              )}

              {/* Part Lookup Rendering */}
              {msg.type === 'part_lookup' && msg.partData && (
                 <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg mt-2 text-right">
                    <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between">
                       <h3 className="font-bold text-amber-800">نتيجة البحث عن قطعة غيار</h3>
                       <span className="text-2xl">⚙️</span>
                    </div>
                    <div className="p-4 space-y-4">
                       <div>
                          <label className="text-xs text-slate-500 font-bold uppercase block mb-1">الاسم الرسمي (Official Name)</label>
                          <div className="text-lg font-bold text-slate-800">{msg.partData.partName}</div>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                          <span className="font-mono text-xl font-bold text-indigo-600">{msg.partData.partNumber}</span>
                          <span className="text-xs text-slate-400 font-bold uppercase">Part Number (PN)</span>
                       </div>
                       <div>
                          <label className="text-xs text-slate-500 font-bold uppercase block mb-1">التوافق (Compatibility)</label>
                          <div className="text-sm text-slate-700">{msg.partData.compatibility}</div>
                       </div>
                       {msg.partData.estimatedPrice && (
                           <div>
                              <label className="text-xs text-slate-500 font-bold uppercase block mb-1">السعر التقريبي</label>
                              <div className="text-sm font-medium text-green-600">{msg.partData.estimatedPrice}</div>
                           </div>
                       )}
                    </div>
                 </div>
              )}
              
              <div className={`text-[10px] mt-2 opacity-70 flex justify-between items-center ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                <span>{msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.role === 'model' && msg.type !== 'invoice' && msg.type !== 'part_lookup' && (
                  <span className="mr-2 flex items-center gap-1">
                    AI Print by Loai 🤖 <span className="font-serif italic text-indigo-400 opacity-90 mx-1">ℓσαι 𝒜𝓂𝓮𝓻</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
             <div className="bg-white p-2 px-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-200">
               <div className="flex space-x-1 space-x-reverse items-center h-6">
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center space-x-2 space-x-reverse max-w-4xl mx-auto">
          
          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isRecording}
            className="p-3 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
            title="إرفاق صورة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>

          {/* Audio Record */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`p-3 rounded-full transition-all duration-200 active:scale-90 ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse shadow-lg ring-4 ring-red-200' 
                : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
            }`}
            title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوت'}
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            )}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder={userName ? `اكتب سؤالك يا ${userName}...` : "صف المشكلة أو اطلب تعريفاً أو فاتورة..."}
            disabled={isLoading || isRecording}
            className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />

          {/* Send Button */}
          <button
            onClick={handleSendText}
            disabled={!inputText.trim() || isLoading || isRecording}
            className={`p-3 rounded-full transition-all active:scale-90 ${
              !inputText.trim() || isLoading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 rotate-180 transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
