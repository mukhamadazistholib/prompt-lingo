import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Settings,
  ChevronDown,
  Menu,
  X,
  Languages,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { PrompterScript } from '../types/prompter';
import { POPULAR_TRANSLATION_LANGUAGES } from '../data/translationLanguages';

interface HeaderNavProps {
  currentScript: PrompterScript;
  availableScripts: PrompterScript[];
  onSelectScript: (script: PrompterScript) => void;
  onOpenAiGenerator: () => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  isFullscreen: boolean;
  theme: string;
  translationLanguage: string;
  onChangeTranslationLanguage: (lang: string) => void;
  onTranslateSubtitles?: (targetLanguage: string) => void;
  isTranslatingSubtitles?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentScript,
  availableScripts,
  onSelectScript,
  onOpenAiGenerator,
  onOpenUpload,
  onOpenSettings,
  isFullscreen,
  theme,
  translationLanguage,
  onChangeTranslationLanguage,
  onTranslateSubtitles,
  isTranslatingSubtitles,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transDropdownOpen, setTransDropdownOpen] = useState(false);
  const [customLangInput, setCustomLangInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close translation dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTransDropdownOpen(false);
      }
    };
    if (transDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [transDropdownOpen]);

  if (isFullscreen) return null;

  const isLight = theme === 'google-light';

  const currentTransMeta = POPULAR_TRANSLATION_LANGUAGES.find(
    (l) => l.id.toLowerCase() === translationLanguage.toLowerCase()
  ) || {
    id: translationLanguage,
    name: translationLanguage,
    nativeName: translationLanguage,
    flag: '🌐',
  };

  return (
    <header
      className={`w-full px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 flex items-center justify-between z-30 sticky top-0 transition-colors border-b ${
        isLight
          ? 'bg-white/95 border-neutral-200 text-neutral-800 backdrop-blur-md'
          : 'bg-[#181a1f]/95 border-neutral-800 text-neutral-100 backdrop-blur-md'
      }`}
    >
      {/* Brand & Product Identity */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/25 text-xs sm:text-sm shrink-0">
          <span className="tracking-tighter">LP</span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`font-semibold text-xs sm:text-sm md:text-base tracking-tight truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              LingoPrompt
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
              {currentScript.flag} <span className="hidden xs:inline">{currentScript.language.split(' ')[0]}</span>
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 hidden lg:block truncate">
            Responsive Language Prompter • Dual Phonetics & Custom Subtitles
          </p>
        </div>
      </div>

      {/* Script Selector Dropdown (Tablet & Desktop) */}
      <div className="hidden md:flex items-center mx-2 max-w-xs xl:max-w-sm">
        <div className="relative w-full">
          <select
            value={currentScript.id}
            onChange={(e) => {
              const found = availableScripts.find((s) => s.id === e.target.value);
              if (found) onSelectScript(found);
            }}
            className={`w-full appearance-none text-xs font-medium pl-3 pr-8 py-1.5 rounded-full border transition-all cursor-pointer truncate ${
              isLight
                ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-300 text-neutral-800 focus:border-blue-600 focus:bg-white'
                : 'bg-neutral-800 hover:bg-neutral-700/80 border-neutral-700 text-neutral-200 focus:border-blue-500'
            }`}
          >
            {availableScripts.map((s) => (
              <option key={s.id} value={s.id} className="bg-neutral-900 text-white">
                {s.flag} {s.title} ({s.language})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Subtitle Translation Language Switcher (Desktop & Tablet) */}
      <div className="relative hidden sm:block shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setTransDropdownOpen(!transDropdownOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
            isLight
              ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'
              : 'bg-blue-950/40 hover:bg-blue-900/40 border-blue-500/30 text-blue-300'
          }`}
          title="Customize 3rd text subtitle translation language"
        >
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline text-neutral-400 font-normal">Subtitles:</span>
          <span>{currentTransMeta.flag}</span>
          <span className="font-semibold max-w-[90px] truncate">{currentTransMeta.name}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {/* Translation Language Dropdown Menu */}
        {transDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 p-3 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
              <span className="font-semibold text-neutral-200 text-xs flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-blue-400" />
                Subtitle Language (3rd Text)
              </span>
              <span className="text-[10px] text-neutral-400">Customizable</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-none">
              {POPULAR_TRANSLATION_LANGUAGES.map((lang) => {
                const isSelected = translationLanguage.toLowerCase() === lang.id.toLowerCase();
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      onChangeTranslationLanguage(lang.id);
                      if (onTranslateSubtitles) {
                        onTranslateSubtitles(lang.id);
                      }
                      setTransDropdownOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-medium'
                        : 'hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                      <span className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-neutral-500'}`}>
                        ({lang.nativeName})
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Language input */}
            <div className="pt-2 mt-2 border-t border-neutral-800">
              <label className="text-[10px] text-neutral-400 block mb-1">Other Language:</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customLangInput}
                  onChange={(e) => setCustomLangInput(e.target.value)}
                  placeholder="e.g. Dutch, Polish, Turkish"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customLangInput.trim()) {
                      onChangeTranslationLanguage(customLangInput.trim());
                      if (onTranslateSubtitles) {
                        onTranslateSubtitles(customLangInput.trim());
                      }
                      setCustomLangInput('');
                      setTransDropdownOpen(false);
                    }
                  }}
                  disabled={!customLangInput.trim()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Action Buttons */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Gemini AI Script Generator */}
        <button
          onClick={onOpenAiGenerator}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>AI Generate</span>
        </button>

        {/* Upload Document / Custom Text */}
        <button
          onClick={onOpenUpload}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700'
              : 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Upload</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Teleprompter & Translation Settings"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700'
              : 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden md:inline">Settings</span>
        </button>
      </div>

      {/* Mobile Actions (< 640px) */}
      <div className="flex sm:hidden items-center gap-1.5">
        {/* Quick Subtitle Language Pill on Mobile */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          title="Subtitle Language"
        >
          <span>{currentTransMeta.flag}</span>
          <span className="text-[11px] font-mono">{currentTransMeta.name.slice(0, 3).toUpperCase()}</span>
        </button>

        {/* AI Generate Button Mobile */}
        <button
          onClick={onOpenAiGenerator}
          title="AI Generate Script"
          className="p-2 rounded-full bg-blue-600 text-white text-xs shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Hamburger Mobile Menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-full border text-xs cursor-pointer ${
            isLight ? 'bg-neutral-100 border-neutral-300 text-neutral-700' : 'bg-neutral-800 border-neutral-700 text-neutral-300'
          }`}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer / Sheet (< 640px) */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 p-4 bg-neutral-900 border-b border-neutral-800 shadow-2xl flex flex-col gap-3.5 animate-in slide-in-from-top-2 duration-150 text-xs z-50">
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Select Script
            </label>
            <select
              value={currentScript.id}
              onChange={(e) => {
                const found = availableScripts.find((s) => s.id === e.target.value);
                if (found) {
                  onSelectScript(found);
                  setMobileMenuOpen(false);
                }
              }}
              className="w-full bg-neutral-800 border border-neutral-700 text-white p-2.5 rounded-xl font-medium"
            >
              {availableScripts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.flag} {s.title} ({s.language})
                </option>
              ))}
            </select>
          </div>

          {/* Subtitle Translation Language Selector on Mobile */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
              <span>Subtitle Translation (3rd Text)</span>
              {isTranslatingSubtitles && (
                <span className="text-blue-400 flex items-center gap-1 font-normal lowercase">
                  <Loader2 className="w-3 h-3 animate-spin" /> translating...
                </span>
              )}
            </label>
            <select
              value={translationLanguage}
              onChange={(e) => {
                const newLang = e.target.value;
                onChangeTranslationLanguage(newLang);
                if (onTranslateSubtitles) {
                  onTranslateSubtitles(newLang);
                }
              }}
              className="w-full bg-neutral-800 border border-blue-500/40 text-blue-300 p-2.5 rounded-xl font-medium"
            >
              {POPULAR_TRANSLATION_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800">
            <button
              onClick={() => {
                onOpenUpload();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 flex items-center justify-center gap-2 font-medium"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload Text</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 flex items-center justify-center gap-2 font-medium"
            >
              <Settings className="w-4 h-4 text-neutral-300" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
