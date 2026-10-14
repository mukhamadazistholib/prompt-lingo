import React, { useState, useEffect, useCallback } from 'react';
import { PrompterConfig, PrompterScript, RubyToken } from './types/prompter';
import { PRESET_SCRIPTS } from './data/presetScripts';
import { HeaderNav } from './components/HeaderNav';
import { PrompterDisplay } from './components/PrompterDisplay';
import { ControlsBar } from './components/ControlsBar';
import { WebcamOverlay } from './components/WebcamOverlay';
import { VocabDrawer } from './components/VocabDrawer';
import { AiScriptGeneratorModal } from './components/AiScriptGeneratorModal';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DEFAULT_CONFIG: PrompterConfig = {
  mainFontSize: 44,
  readingFontSize: 18,
  translationFontSize: 14,
  textAlign: 'center',
  lineSpacing: 'relaxed',
  rubyColor: 'blue',
  speed: 3.5,
  dimInactiveLines: false,
  showRuby: true,
  showTranslation: true,
  showFocusGuide: true,
  karaokeMode: false,
  mirrorHorizontal: false,
  mirrorVertical: false,
  cameraOverlay: false,
  cameraOpacity: 0.35,
  cameraLayout: 'backdrop',
  speechRate: 0.95,
  theme: 'google-dark',
  translationLanguage: 'Indonesian',
};

export default function App() {
  const [availableScripts, setAvailableScripts] = useState<PrompterScript[]>(PRESET_SCRIPTS);
  // Default is English Keynote Speech!
  const [currentScript, setCurrentScript] = useState<PrompterScript>(PRESET_SCRIPTS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [, setCurrentLineIndex] = useState(0);
  const [selectedToken, setSelectedToken] = useState<RubyToken | null>(null);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Subtitle Translation State
  const [isTranslatingSubtitles, setIsTranslatingSubtitles] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Prompter Configuration State
  const [config, setConfig] = useState<PrompterConfig>(DEFAULT_CONFIG);

  const handleUpdateConfig = (updates: Partial<PrompterConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    if (isTtsPlaying && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTtsPlaying(false);
    }
    const container = document.querySelector('.prompter-line');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isTtsPlaying]);

  // Translate subtitles dynamically to the user's customized language
  const handleTranslateSubtitles = async (targetLanguage: string) => {
    if (!targetLanguage || isTranslatingSubtitles) return;
    try {
      setIsTranslatingSubtitles(true);
      const userKey = localStorage.getItem('lingoprompt_gemini_api_key');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (userKey) {
        headers['x-gemini-key'] = userKey;
      }

      const res = await fetch('/api/translate-script', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          apiKey: userKey || undefined,
          lines: currentScript.lines,
          targetLanguage,
        }),
      });

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errJson = await res.json().catch(() => null);
          if (errJson?.error) errorMsg = errJson.error;
        } else {
          const rawText = await res.text().catch(() => '');
          if (rawText.includes('503') || rawText.includes('high demand') || rawText.includes('UNAVAILABLE')) {
            errorMsg = 'Gemini model is currently under high demand. Please try again or enter your personal Gemini API key in Settings.';
          } else {
            errorMsg = `Server returned status ${res.status}. Please check your connection or Gemini API key.`;
          }
        }
        throw new Error(errorMsg);
      }

      let json: any;
      try {
        json = await res.json();
      } catch {
        throw new Error('Server returned an invalid response format. Please try again.');
      }

      if (!json.success) {
        throw new Error(json.error || 'Failed to translate script subtitles');
      }

      const updatedLines = json.lines;
      const updatedScript: PrompterScript = {
        ...currentScript,
        lines: updatedLines,
      };

      setCurrentScript(updatedScript);
      setAvailableScripts((prev) =>
        prev.map((s) => (s.id === updatedScript.id ? updatedScript : s))
      );
      setConfig((prev) => ({ ...prev, translationLanguage: targetLanguage }));

      setToastMessage({
        text: `Subtitles updated to ${targetLanguage}`,
        type: 'success',
      });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error('Subtitle translation error:', err);
      setToastMessage({
        text: err.message || 'Failed to translate subtitles. Please check your Gemini key or try again.',
        type: 'error',
      });
      setTimeout(() => setToastMessage(null), 4500);
    } finally {
      setIsTranslatingSubtitles(false);
    }
  };

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setConfig((prev) => ({ ...prev, speed: Math.min(10, Number((prev.speed + 0.5).toFixed(1))) }));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setConfig((prev) => ({ ...prev, speed: Math.max(1, Number((prev.speed - 0.5).toFixed(1))) }));
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        setConfig((prev) => ({ ...prev, mirrorHorizontal: !prev.mirrorHorizontal }));
      } else if (e.key === 'c' || e.key === 'C') {
        setConfig((prev) => ({ ...prev, cameraOverlay: !prev.cameraOverlay }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleReset]);

  // Fullscreen management
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Text-to-Speech (TTS)
  const handlePlayTts = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support the Web Speech Synthesis API');
      return;
    }

    if (isTtsPlaying) {
      window.speechSynthesis.cancel();
      setIsTtsPlaying(false);
      return;
    }

    const fullText = currentScript.lines
      .map((l) => l.tokens.map((t) => t.text).join(' '))
      .join('. ');

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = currentScript.languageCode || 'en-US';
    utterance.rate = config.speechRate || 0.95;

    utterance.onstart = () => {
      setIsTtsPlaying(true);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsTtsPlaying(false);
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsTtsPlaying(false);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`flex flex-col h-[100dvh] w-screen overflow-hidden font-sans antialiased relative transition-colors duration-200 ${
        config.theme === 'google-light'
          ? 'bg-neutral-50 text-neutral-900'
          : 'bg-[#121418] text-neutral-100'
      }`}
    >
      {/* Toast Notification for Subtitle Translation & Actions */}
      {toastMessage && (
        <div
          className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-blue-600/95 text-white border-blue-400/40 shadow-blue-500/25'
              : 'bg-red-600/95 text-white border-red-400/40 shadow-red-500/25'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Google Material Top App Bar */}
      <HeaderNav
        currentScript={currentScript}
        availableScripts={availableScripts}
        onSelectScript={(script) => {
          setCurrentScript(script);
          handleReset();
        }}
        onOpenAiGenerator={() => setIsAiModalOpen(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isFullscreen={isFullscreen}
        theme={config.theme}
        translationLanguage={config.translationLanguage}
        onChangeTranslationLanguage={(lang) => handleUpdateConfig({ translationLanguage: lang })}
        onTranslateSubtitles={handleTranslateSubtitles}
        isTranslatingSubtitles={isTranslatingSubtitles}
      />

      {/* Main Teleprompter Body */}
      <main className="relative flex-1 flex overflow-hidden">
        {/* Webcam Shadowing Video Feed */}
        <WebcamOverlay
          enabled={config.cameraOverlay}
          opacity={config.cameraOpacity}
          layout={config.cameraLayout}
          mirrorHorizontal={config.mirrorHorizontal}
        />

        {/* Central Scrolling Prompter Display */}
        <PrompterDisplay
          script={currentScript}
          config={config}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onTokenClick={(token) => setSelectedToken(token)}
          onLineChange={(idx) => setCurrentLineIndex(idx)}
          onTranslateSubtitles={handleTranslateSubtitles}
          isTranslatingSubtitles={isTranslatingSubtitles}
        />

        {/* Vocab Details Drawer */}
        <VocabDrawer
          token={selectedToken}
          languageCode={currentScript.languageCode}
          onClose={() => setSelectedToken(null)}
        />
      </main>

      {/* Google Floating Pill Controls Dock */}
      <ControlsBar
        config={config}
        onChangeConfig={handleUpdateConfig}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onPlayTts={handlePlayTts}
        isTtsPlaying={isTtsPlaying}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Gemini AI Script Generator Modal */}
      <AiScriptGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        defaultTranslationLanguage={config.translationLanguage}
        onScriptGenerated={(newScript) => {
          setAvailableScripts((prev) => [newScript, ...prev]);
          setCurrentScript(newScript);
          handleReset();
        }}
      />

      {/* Upload Document / Custom Text Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultTranslationLanguage={config.translationLanguage}
        onScriptLoaded={(newScript) => {
          setAvailableScripts((prev) => [newScript, ...prev]);
          setCurrentScript(newScript);
          handleReset();
        }}
      />

      {/* Dedicated Comprehensive Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onChangeConfig={handleUpdateConfig}
        onResetDefaults={handleResetDefaults}
        onTranslateSubtitles={handleTranslateSubtitles}
        isTranslatingSubtitles={isTranslatingSubtitles}
      />
    </div>
  );
}
