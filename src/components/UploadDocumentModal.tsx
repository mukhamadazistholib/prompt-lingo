import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Sparkles, Loader2, Globe2, Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { POPULAR_TRANSLATION_LANGUAGES } from '../data/translationLanguages';
import { PrompterScript } from '../types/prompter';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScriptLoaded: (script: PrompterScript) => void;
  defaultTranslationLanguage?: string;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onScriptLoaded,
  defaultTranslationLanguage = 'Indonesian',
}) => {
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [translationLang, setTranslationLang] = useState(defaultTranslationLanguage);
  const [customTransLang, setCustomTransLang] = useState('');
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content || '');
    };
    reader.readAsText(file);
  };

  const handleProcessText = async () => {
    if (!rawText.trim()) {
      setError('Please enter or upload text first.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const activeTransLang = customTransLang.trim() || translationLang;
      const userKey = localStorage.getItem('lingoprompt_gemini_api_key');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (userKey) {
        headers['x-gemini-key'] = userKey;
      }

      const res = await fetch('/api/annotate-text', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          apiKey: userKey || undefined,
          text: rawText,
          language: selectedLang.name,
          translationLanguage: activeTransLang,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process phonetics');
      }

      const annotated = json.data;
      const formattedScript: PrompterScript = {
        id: `upload-${Date.now()}`,
        title: title.trim() || annotated.title || `Uploaded Script (${selectedLang.name})`,
        language: selectedLang.name,
        languageCode: selectedLang.code,
        flag: selectedLang.flag,
        topic: 'Custom User Practice Text',
        level: 'Custom',
        type: 'passage',
        estimatedWpm: 110,
        lines: annotated.lines || [],
      };

      onScriptLoaded(formattedScript);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process document text.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] max-w-2xl bg-neutral-900 sm:border sm:border-neutral-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">Upload Text & Auto-Phonetics</h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                AI annotates pronunciation readings and generates custom 3rd text subtitle translations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-4 sm:space-y-5 text-sm text-neutral-300 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Script Language */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Text Language to Practice</span>
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedLang.id === lang.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-neutral-800/80 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle Translation Language */}
          <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800 space-y-2">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Subtitle Translation Language (3rd Text Tier)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TRANSLATION_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    setTranslationLang(lang.id);
                    setCustomTransLang('');
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                    translationLang === lang.id && !customTransLang
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
            <div className="pt-1 flex gap-2">
              <input
                type="text"
                value={customTransLang}
                onChange={(e) => setCustomTransLang(e.target.value)}
                placeholder="Or custom subtitle language (e.g. Dutch, Polish, Arabic...)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Script Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              3. Script Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Business Presentation & Welcome Address..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Area File Drop & Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                4. Document Text Content
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Choose File (.txt, .md, .srt)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.srt,.vtt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Paste or type ${selectedLang.name} text here...`}
              className="w-full p-3 sm:p-4 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-xs font-sans resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-500 font-mono">
            {rawText.length} characters
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-full text-neutral-400 hover:text-white text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProcessText}
              disabled={isLoading || !rawText.trim()}
              className="flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Process Phonetics</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
