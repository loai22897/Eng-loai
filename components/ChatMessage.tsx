import React from 'react';
import { Message } from '../types';
import { Icons } from './Icon';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
          ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}
          shadow-lg ring-2 ring-white/10
        `}>
          {isUser ? <Icons.User size={20} className="text-white" /> : <Icons.Bot size={20} className="text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            rounded-2xl px-6 py-4 shadow-md 
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'}
          `}>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.attachments.map((att, idx) => (
                  <div key={idx} className="relative group">
                     <img 
                       src={`data:${att.mimeType};base64,${att.data}`} 
                       alt="attachment" 
                       className="max-w-[200px] max-h-[200px] rounded-lg border border-white/20 object-cover"
                     />
                  </div>
                ))}
              </div>
            )}

            {/* Text Content */}
            {isUser ? (
               <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            ) : (
               <MarkdownRenderer content={message.content} />
            )}
          </div>
          
          {/* Timestamp or Status */}
          <span className="text-xs text-slate-500 mt-2 px-1">
            {isUser ? 'You' : 'Gemini'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
