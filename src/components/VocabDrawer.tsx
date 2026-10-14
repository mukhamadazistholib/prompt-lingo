import React from 'react';
import { Volume2, X, BookOpen, Sparkles } from 'lucide-react';
import { RubyToken } from '../types/prompter';

interface VocabDrawerProps {
  token: RubyToken | null;
  languageCode: string;
  onClose: () => void;
}

export const VocabDrawer: React.FC<VocabDrawerProps> = ({ token, languageCode, onClose }) => {
  if (!token) return null;

  const playPronunciation = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(token.text);
      utterance.lang = languageCode || 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full xs:w-[85%] sm:w-96 bg-neutral-900/98 backdrop-blur-2xl border-l border-neutral-800 p-5 sm:p-6 z-50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Vocabulary Inspector</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center p-5 sm:p-6 bg-neutral-800/40 rounded-2xl border border-neutral-800">
          <span className="text-blue-400 text-sm font-semibold tracking-wider mb-1 font-mono">
            {token.reading || '—'}
          </span>
          <span className="text-white text-3xl sm:text-4xl font-extrabold tracking-wide text-center">
            {token.text}
          </span>

          <button
            onClick={playPronunciation}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen to Pronunciation</span>
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <div className="bg-neutral-800/40 p-3.5 sm:p-4 rounded-xl border border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Contextual Meaning
            </span>
            <p className="text-neutral-100 text-xs sm:text-sm font-medium">
              {token.meaning || 'Word in context'}
            </p>
          </div>

          <div className="bg-neutral-800/40 p-3.5 sm:p-4 rounded-xl border border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Articulation Guidance
            </span>
            <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed">
              Focus on natural syllable stress and steady pacing. Rehearse aloud in sync with the teleprompter scrolling rate.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-800 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Dual-Tier Phonetic Engine
        </span>
      </div>
    </div>
  );
};
