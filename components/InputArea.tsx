import React, { useRef, useState, KeyboardEvent } from 'react';
import { Icons } from './Icon';
import { Attachment, ModelType } from '../types';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[], model: ModelType) => void;
  isLoading: boolean;
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  isLoading, 
  selectedModel, 
  onModelChange 
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSend(text, attachments, selectedModel);
    setText('');
    setAttachments([]);
    // Reset textarea height
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          mimeType: file.type,
          data: base64String
        }]);
      };
      
      reader.readAsDataURL(file);
    }
    // Reset file input value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      <div className="flex flex-col gap-3 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-3xl p-4 shadow-2xl ring-1 ring-white/5">
        
        {/* Top Controls: Model Selector & Attachments */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => onModelChange(ModelType.FLASH)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedModel === ModelType.FLASH 
                  ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Icons.Zap size={14} />
              Flash 2.5
            </button>
            <button
              onClick={() => onModelChange(ModelType.FLASH_THINKING)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedModel === ModelType.FLASH_THINKING 
                  ? 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Icons.Brain size={14} />
              Thinking
            </button>
             <button
              onClick={() => onModelChange(ModelType.PRO)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedModel === ModelType.PRO
                  ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Icons.Sparkles size={14} />
              Pro 3.0
            </button>
          </div>
        </div>

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex gap-3 overflow-x-auto py-2 px-1">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group flex-shrink-0">
                <img 
                  src={`data:${att.mimeType};base64,${att.data}`} 
                  alt="preview" 
                  className="h-20 w-20 rounded-lg object-cover border border-slate-600"
                />
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <Icons.Close size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input & Actions */}
        <div className="flex items-end gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 rounded-full transition-colors mb-0.5"
            title="Attach image"
          >
            <Icons.Paperclip size={22} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
          />
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={selectedModel === ModelType.FLASH_THINKING ? "Ask a complex question..." : "Type a message..."}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-base resize-none focus:outline-none py-3 max-h-[200px]"
            rows={1}
          />
          
          <button
            onClick={handleSend}
            disabled={(!text.trim() && attachments.length === 0) || isLoading}
            className={`
              p-3 rounded-full transition-all duration-300 shadow-lg mb-0.5
              ${(!text.trim() && attachments.length === 0) || isLoading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30'}
            `}
          >
            {isLoading ? <Icons.Loader className="animate-spin" size={22} /> : <Icons.Send size={22} />}
          </button>
        </div>
      </div>
      <div className="text-center mt-3">
        <p className="text-[10px] text-slate-500">
           Gemini can make mistakes. Check important info. • Built with Gemini 2.5 & 3.0
        </p>
      </div>
    </div>
  );
};
