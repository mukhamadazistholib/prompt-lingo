import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Type,
  Eye,
  Camera,
  Volume2,
  Palette,
  RotateCcw,
  Check,
  AlignLeft,
  AlignCenter,
  Key,
  ExternalLink,
  Languages,
  Loader2,
  Sparkles,
  EyeOff,
} from 'lucide-react';
import { PrompterConfig } from '../types/prompter';
import { POPULAR_TRANSLATION_LANGUAGES } from '../data/translationLanguages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PrompterConfig;
  onChangeConfig: (updates: Partial<PrompterConfig>) => void;
  onResetDefaults: () => void;
  onTranslateSubtitles?: (targetLanguage: string) => void;
  isTranslatingSubtitles?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onResetDefaults,
  onTranslateSubtitles,
  isTranslatingSubtitles,
}) => {
  const [activeTab, setActiveTab] = useState<'typography' | 'translation' | 'scroll' | 'camera' | 'audio' | 'theme' | 'gemini'>('typography');
  const [userKey, setUserKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [customTransLang, setCustomTransLang] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lingoprompt_gemini_api_key');
    if (saved) setUserKey(saved);
  }, [isOpen]);

  const handleKeyUpdate = (val: string) => {
    setUserKey(val);
    localStorage.setItem('lingoprompt_gemini_api_key', val.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Material 3 Surface Card (Fully Responsive Mobile/Desktop) */}
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] max-w-3xl bg-neutral-900 sm:border sm:border-neutral-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Google Style Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-neutral-100">
                Teleprompter Settings
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-400 hidden xs:block">
                Customize typography, 3rd text translation language, speeds, and camera
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Material Segmented Navigation Bar (Horizontal Scrolling Tab) */}
        <div className="px-3 sm:px-6 py-2 bg-neutral-950/40 border-b border-neutral-800 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none text-xs shrink-0">
          {[
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'translation', label: 'Subtitle Translation (3rd Text)', icon: Languages },
            { id: 'scroll', label: 'Speed & Scroll', icon: Eye },
            { id: 'camera', label: 'Camera & Rig', icon: Camera },
            { id: 'audio', label: 'Audio (TTS)', icon: Volume2 },
            { id: 'theme', label: 'Theme', icon: Palette },
            { id: 'gemini', label: 'Gemini Key', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-sm text-neutral-300">
          {/* TAB 1: TYPOGRAPHY */}
          {activeTab === 'typography' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Main Font Size */}
              <div className="bg-neutral-800/50 p-4 sm:p-5 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">
                      1. Main Character Font Size (Center)
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Center glyphs for the target language (adaptive clamp)
                    </span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    {config.mainFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="88"
                  step="2"
                  value={config.mainFontSize}
                  onChange={(e) => onChangeConfig({ mainFontSize: Number(e.target.value) })}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Reading Font Size */}
              <div className="bg-neutral-800/50 p-4 sm:p-5 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">
                      2. Phonetic Guide Font Size (Ruby / Top)
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Pīnyīn, Furigana, Romanization, or IPA reading size
                    </span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    {config.readingFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="40"
                  step="1"
                  value={config.readingFontSize}
                  onChange={(e) => onChangeConfig({ readingFontSize: Number(e.target.value) })}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* 3rd Text: Translation Font Size */}
              <div className="bg-neutral-800/50 p-4 sm:p-5 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">
                      3. Translation Subtitle Font Size (3rd Text)
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Contextual translation sentence size underneath lines
                    </span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    {config.translationFontSize || 14}px
                  </span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="26"
                  step="1"
                  value={config.translationFontSize || 14}
                  onChange={(e) => onChangeConfig({ translationFontSize: Number(e.target.value) })}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Text Alignment & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-800">
                  <span className="font-semibold text-neutral-100 block text-xs uppercase tracking-wider mb-2">
                    Text Alignment
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ textAlign: 'center' })}
                      className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        config.textAlign === 'center'
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-sm'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      <AlignCenter className="w-4 h-4" />
                      <span>Center</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onChangeConfig({ textAlign: 'left' })}
                      className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        config.textAlign === 'left'
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-sm'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      <AlignLeft className="w-4 h-4" />
                      <span>Left</span>
                    </button>
                  </div>
                </div>

                {/* Ruby Color Accent */}
                <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-800">
                  <span className="font-semibold text-neutral-100 block text-xs uppercase tracking-wider mb-2">
                    Phonetic Accent Color
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'blue', color: 'bg-blue-500', label: 'Google Blue' },
                      { id: 'amber', color: 'bg-amber-400', label: 'Amber' },
                      { id: 'emerald', color: 'bg-emerald-400', label: 'Emerald' },
                      { id: 'purple', color: 'bg-purple-400', label: 'Purple' },
                      { id: 'white', color: 'bg-white', label: 'White' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onChangeConfig({ rubyColor: c.id as any })}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${c.color} flex items-center justify-center transition-transform cursor-pointer ${
                          config.rubyColor === c.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={c.label}
                      >
                        {config.rubyColor === c.id && (
                          <Check className={`w-3.5 h-3.5 ${c.id === 'white' ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSLATION & SUBTITLES (3RD TEXT TIER) */}
          {activeTab === 'translation' && (
            <div className="space-y-5">
              {/* Visual Architecture Preview */}
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs">
                <span className="font-semibold text-blue-300 block mb-1">
                  Three-Tier Typography Architecture
                </span>
                <p className="text-neutral-300 text-[11px] mb-3">
                  Each line in LingoPrompt displays three synchronized visual layers:
                </p>
                <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800 flex flex-col items-center text-center space-y-1">
                  <span className="text-[11px] text-blue-400 font-mono">1. /ˌæksəˈlɛreɪt/ • nǐ hǎo • ふりがな (Phonetics)</span>
                  <span className="text-lg font-bold text-white">2. ACCELERATE • 你好 • 居酒屋 (Target Language)</span>
                  <span className="text-xs text-neutral-300 bg-neutral-800/80 px-3 py-1 rounded-full border border-neutral-700">
                    3. [{config.translationLanguage || 'Indonesian'}]: Subtitle translation into your custom native language
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-800/50 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-sm">
                      Subtitle Display Toggle
                    </span>
                    <span className="text-xs text-neutral-400">
                      Show or hide the 3rd text translations in the teleprompter
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ showTranslation: !config.showTranslation })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      config.showTranslation ? 'bg-blue-600' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        config.showTranslation ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <span className="font-semibold text-neutral-100 block text-xs uppercase tracking-wider mb-2">
                    Select Subtitle Language
                  </span>
                  {/* Popular Languages Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {POPULAR_TRANSLATION_LANGUAGES.map((lang) => {
                      const isSelected =
                        (config.translationLanguage || 'Indonesian').toLowerCase() === lang.id.toLowerCase();
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => onChangeConfig({ translationLanguage: lang.id })}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/25 border-blue-500 text-white font-medium shadow-sm ring-1 ring-blue-500'
                              : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span className="text-xs truncate">{lang.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Language Input */}
                <div className="pt-2">
                  <label className="text-xs text-neutral-400 block mb-1">
                    Or type any custom language:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTransLang}
                      onChange={(e) => setCustomTransLang(e.target.value)}
                      placeholder="E.g., Dutch, Polish, Turkish, Swedish, Tagalog..."
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customTransLang.trim()) {
                          onChangeConfig({ translationLanguage: customTransLang.trim() });
                          setCustomTransLang('');
                        }
                      }}
                      disabled={!customTransLang.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* 1-Click Retranslate Current Script */}
                {onTranslateSubtitles && (
                  <div className="pt-4 border-t border-neutral-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-neutral-200 block">
                        Update Active Script Subtitles
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Translate the currently displayed script into{' '}
                        <strong className="text-blue-400">{config.translationLanguage || 'Indonesian'}</strong> right now
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isTranslatingSubtitles}
                      onClick={() => onTranslateSubtitles(config.translationLanguage || 'Indonesian')}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
                    >
                      {isTranslatingSubtitles ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Translating Subtitles...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Translate Subtitles to {config.translationLanguage || 'Indonesian'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SCROLLING */}
          {activeTab === 'scroll' && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-neutral-800/50 p-4 sm:p-5 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">Default Scrolling Speed</span>
                    <span className="text-[11px] text-neutral-400">Adjust on the fly with arrow keys [↑] and [↓]</span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-400 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    {config.speed}x (~{Math.round(config.speed * 28)} WPM)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={config.speed}
                  onChange={(e) => onChangeConfig({ speed: Number(e.target.value) })}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-800/50 border border-neutral-800">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">Eye-Line Focus Guide</span>
                    <span className="text-[11px] text-neutral-400">Horizontal reference line to keep eyes focused on camera</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ showFocusGuide: !config.showFocusGuide })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      config.showFocusGuide ? 'bg-blue-600' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        config.showFocusGuide ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-800/50 border border-neutral-800">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">Show Phonetic Guides (Ruby / IPA)</span>
                    <span className="text-[11px] text-neutral-400">Pīnyīn, Furigana, Romanization, or IPA above words</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ showRuby: !config.showRuby })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      config.showRuby ? 'bg-blue-600' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        config.showRuby ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAMERA & MIRROR */}
          {activeTab === 'camera' && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-neutral-800/50 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">Studio Video Shadowing (Webcam)</span>
                    <span className="text-[11px] text-neutral-400">Display front camera to observe mouth articulation</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ cameraOverlay: !config.cameraOverlay })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      config.cameraOverlay ? 'bg-blue-600' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        config.cameraOverlay ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {config.cameraOverlay && (
                  <div className="pt-3 border-t border-neutral-700 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-neutral-300 mb-1">
                        <span>Camera Video Opacity</span>
                        <span className="font-mono text-blue-400">{Math.round(config.cameraOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={config.cameraOpacity}
                        onChange={(e) => onChangeConfig({ cameraOpacity: Number(e.target.value) })}
                        className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-neutral-400">Layout:</span>
                      <button
                        type="button"
                        onClick={() => onChangeConfig({ cameraLayout: 'backdrop' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          config.cameraLayout === 'backdrop' ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        Full Backdrop
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeConfig({ cameraLayout: 'pip' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          config.cameraLayout === 'pip' ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        Picture-in-Picture
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hardware Mirror Rig */}
              <div className="bg-neutral-800/50 p-4 sm:p-5 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">Horizontal Mirror (Mirror X Rig)</span>
                    <span className="text-[11px] text-neutral-400">
                      Flips text for 45-degree beam splitter teleprompter glass rigs
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ mirrorHorizontal: !config.mirrorHorizontal })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      config.mirrorHorizontal ? 'bg-blue-600' : 'bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        config.mirrorHorizontal ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIO TTS */}
          {activeTab === 'audio' && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-neutral-800/50 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">Speech Pronunciation Rate</span>
                    <span className="text-[11px] text-neutral-400">Web Speech API Text-to-Speech speed</span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    {config.speechRate || 0.9}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.3"
                  step="0.05"
                  value={config.speechRate || 0.9}
                  onChange={(e) => onChangeConfig({ speechRate: Number(e.target.value) })}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 6: THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <span className="font-semibold text-neutral-100 block text-xs uppercase tracking-wider mb-2">
                Choose Visual Theme
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'google-dark',
                    title: 'Google Dark Studio',
                    desc: 'Clean dark studio surface with Google Blue accents (#1a73e8)',
                  },
                  {
                    id: 'google-light',
                    title: 'Google Clean Light',
                    desc: 'Crisp light mode inspired by Google Docs & Material Design',
                  },
                  {
                    id: 'studio-black',
                    title: 'High Contrast Studio Black',
                    desc: 'Deep 100% OLED black for high-contrast teleprompter beam splitters',
                  },
                  {
                    id: 'high-contrast',
                    title: 'High Contrast Amber',
                    desc: 'Warm amber for enhanced distance readability',
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeConfig({ theme: t.id as any })}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      config.theme === t.id
                        ? 'ring-2 ring-blue-500 bg-neutral-800'
                        : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-neutral-100">{t.title}</span>
                      {config.theme === t.id && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: GEMINI AI KEY */}
          {activeTab === 'gemini' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-800/50 border border-neutral-800 space-y-3.5">
                <div>
                  <span className="font-semibold text-neutral-100 block text-xs sm:text-sm">Personal Gemini API Key</span>
                  <span className="text-[11px] text-neutral-400">
                    Use your own Gemini API key for dedicated quota and to avoid shared 503 high-demand errors.
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={userKey}
                    onChange={(e) => handleKeyUpdate(e.target.value)}
                    placeholder="Paste your Gemini API key (AIzaSy...)"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>{userKey.trim() ? '✓ Key stored securely in your browser' : 'Using default server key if available'}</span>
                  {userKey.trim() && (
                    <button
                      type="button"
                      onClick={() => handleKeyUpdate('')}
                      className="text-red-400 hover:underline cursor-pointer"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </div>

              {/* Tutorial Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2.5">
                <span className="font-semibold text-blue-300 block text-xs sm:text-sm">How to get a Free Gemini API Key:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-xs leading-relaxed">
                  <li>
                    Visit Google AI Studio at{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      aistudio.google.com/app/apikey <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Sign in with your Google account.</li>
                  <li>Click <strong className="text-white">"Create API key"</strong> and select a project.</li>
                  <li>Copy your generated key and paste it above.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
