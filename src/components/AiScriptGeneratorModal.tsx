import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Globe2,
  MessageSquare,
  BookOpen,
  Loader2,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle2,
  Languages,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { POPULAR_TRANSLATION_LANGUAGES } from '../data/translationLanguages';
import { PrompterScript } from '../types/prompter';

interface AiScriptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScriptGenerated: (script: PrompterScript) => void;
  defaultTranslationLanguage?: string;
}

export const AiScriptGeneratorModal: React.FC<AiScriptGeneratorModalProps> = ({
  isOpen,
  onClose,
  onScriptGenerated,
  defaultTranslationLanguage = 'Indonesian',
}) => {
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [translationLang, setTranslationLang] = useState(defaultTranslationLanguage);
  const [customTransLang, setCustomTransLang] = useState('');
  const [mode, setMode] = useState<'speech' | 'dialogue'>('speech');
  const [level, setLevel] = useState('Intermediate (B1-B2)');
  const [topic, setTopic] = useState('The Future of Artificial Intelligence and Human Learning');
  const [userPrompt, setUserPrompt] = useState('');

  // User-provided API Key state
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lingoprompt_gemini_api_key');
    if (saved) {
      setApiKey(saved);
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultTranslationLanguage) {
      setTranslationLang(defaultTranslationLanguage);
    }
  }, [defaultTranslationLanguage, isOpen]);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem('lingoprompt_gemini_api_key', val.trim());
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const activeTransLang = customTransLang.trim() || translationLang;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey.trim()) {
        headers['x-gemini-key'] = apiKey.trim();
      }

      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          language: selectedLang.name,
          languageCode: selectedLang.code,
          translationLanguage: activeTransLang,
          mode,
          topic: topic.trim() || 'General speech',
          level,
          userPrompt: userPrompt.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate script');
      }

      const generatedData = json.data;
      const formattedScript: PrompterScript = {
        id: `ai-${Date.now()}`,
        title: generatedData.title || `${selectedLang.name}: ${topic}`,
        language: selectedLang.name,
        languageCode: selectedLang.code,
        flag: selectedLang.flag,
        topic: generatedData.topic || topic,
        level: generatedData.level || level,
        type: mode,
        estimatedWpm: generatedData.estimatedWpm || 115,
        vocabHighlights: generatedData.vocabHighlights || [],
        lines: generatedData.lines || [],
      };

      onScriptGenerated(formattedScript);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the script with Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] max-w-2xl bg-neutral-900 sm:border sm:border-neutral-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Google Style Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <span>Generate Script with Gemini AI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Adaptive
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                AI creates full practice scripts with custom 3rd text subtitle translations
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

          {/* User API Key Input Section */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>Your Personal Gemini API Key</span>
              </label>

              <button
                type="button"
                onClick={() => setShowTutorial(!showTutorial)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showTutorial ? 'Hide Guide' : 'How to get key?'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Paste your Gemini API Key here (AIzaSy...)"
                className="w-full pl-3 pr-9 py-2 sm:py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                {apiKey.trim() ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Personal key active</span>
                  </>
                ) : (
                  <span>Using default server key if available</span>
                )}
              </span>
              <span>Saved in your browser</span>
            </div>

            {showTutorial && (
              <div className="mt-2 pt-2 border-t border-neutral-700/60 text-xs text-neutral-300 space-y-1.5 animate-in fade-in duration-150">
                <p className="font-semibold text-neutral-200">How to get your free Gemini API Key:</p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
                  <li>
                    Visit{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 font-medium underline inline-flex items-center gap-0.5"
                    >
                      aistudio.google.com/app/apikey <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Sign in with your Google account.</li>
                  <li>Click <strong className="text-white">"Create API key"</strong> and copy it here.</li>
                </ol>
              </div>
            )}
          </div>

          {/* 1. Target Practice Language */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Target Practice Language</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang);
                    if (lang.sampleTopics[0]) setTopic(lang.sampleTopics[0]);
                  }}
                  className={`p-2 sm:p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selectedLang.id === lang.id
                      ? 'bg-blue-600/20 border-blue-500 text-white font-medium shadow-sm'
                      : 'bg-neutral-800/50 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="truncate">
                    <p className="text-xs font-medium text-neutral-100 truncate">{lang.name}</p>
                    <p className="text-[10px] text-blue-400 font-mono truncate">{lang.readingLabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Subtitle Translation Language (User's Native Language for 3rd text) */}
          <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800 space-y-2">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Subtitle Translation Language (3rd Text Tier)</span>
            </label>
            <p className="text-[11px] text-neutral-400">
              Select which language you want the sentence translations to appear in:
            </p>
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
                placeholder="Or type custom language (e.g. Dutch, Turkish...)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 3. Format */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
              <span>3. Format</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('speech')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'speech'
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                    : 'bg-neutral-800/60 border-neutral-800 text-neutral-400'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Speech / Monologue</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('dialogue')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'dialogue'
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                    : 'bg-neutral-800/60 border-neutral-800 text-neutral-400'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conversation / Dialogue</span>
              </button>
            </div>
          </div>

          {/* 4. Topic & Nuance */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              4. Practice Topic or Custom Scenario
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g., The Future of AI and Human Learning..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              5. Custom Nuances & Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Add any specific context, vocabulary, speaking pace, or persona..."
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-xs resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-400">
            Translating to: <strong className="text-blue-400">{customTransLang.trim() || translationLang}</strong>
          </div>

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
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Script...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Script</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
