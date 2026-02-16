
import React, { useState } from 'react';
import { LinkedInPost } from '../types';

interface PostCardProps {
  post: LinkedInPost;
  onRegenerate?: (post: LinkedInPost) => Promise<void>;
  isRegenerating?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onRegenerate, isRegenerating }) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-500 ${isRegenerating ? 'opacity-60 grayscale' : 'hover:shadow-xl'}`}>
      {isRegenerating && (
        <div className="absolute inset-0 z-10 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Podmieniam...</span>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
              TYDZIEŃ {post.week}
            </span>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              {post.day}
            </span>
            <span className="bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
              {post.postType}
            </span>
          </div>
          
          <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">
            {post.title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Cel: <span className="text-slate-700 font-semibold">{post.businessGoal}</span>
          </div>
        </div>

        {onRegenerate && (
          <button 
            onClick={() => onRegenerate(post)}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-2 border-slate-100 rounded-xl hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all self-start whitespace-nowrap"
            title="Wymień ten post na inny"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Wymień Post
          </button>
        )}
      </div>
      
      <div className="p-8 space-y-8">
        {/* Main Content Area */}
        <div className="relative group">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Treść posta (LinkedIn Ready)</h4>
            <button 
              onClick={() => copyToClipboard(post.content, setCopiedText)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-blue-50"
            >
              {copiedText ? 'Skopiowano!' : 'Kopiuj Treść'}
            </button>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl text-base text-slate-700 whitespace-pre-wrap font-sans leading-relaxed border border-slate-100 shadow-inner">
            {renderContent(post.content)}
          </div>
        </div>

        {/* Visual Support Area */}
        <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100/50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs">Wsparcie Wizualne</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Koncepcja ({post.graphicFormat})</label>
              <p className="text-sm text-indigo-900 font-medium leading-relaxed italic">
                "{post.graphicIdea}"
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Prompt AI (Midjourney/DALL-E)</label>
                <button 
                  onClick={() => copyToClipboard(post.aiPrompt, setCopiedPrompt)}
                  className="text-[10px] font-black text-indigo-600 hover:underline uppercase"
                >
                  {copiedPrompt ? 'Skopiowano' : 'Kopiuj Prompt'}
                </button>
              </div>
              <div className="bg-indigo-900 p-3 rounded-lg text-indigo-100 text-[11px] font-mono leading-tight shadow-lg">
                {post.aiPrompt}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
