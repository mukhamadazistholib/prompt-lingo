import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Languages,
} from 'lucide-react';
import { PrompterConfig } from '../types/prompter';

interface ControlsBarProps {
  config: PrompterConfig;
  onChangeConfig: (updates: Partial<PrompterConfig>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onPlayTts: () => void;
  isTtsPlaying: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  config,
  onChangeConfig,
  isPlaying,
  onTogglePlay,
  onReset,
  onPlayTts,
  isTtsPlaying,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
}) => {
  const isLight = config.theme === 'google-light';

  return (
    <div className="fixed bottom-3 sm:bottom-6 inset-x-0 mx-auto w-[96%] sm:w-[90%] max-w-xl z-40 transition-all duration-300">
      {/* Material 3 Floating Pill Navigation Dock */}
      <div
        className={`px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-2xl flex items-center justify-between gap-1 sm:gap-3 border transition-colors ${
          isLight
            ? 'bg-white/95 border-neutral-300/80 text-neutral-800 backdrop-blur-xl shadow-neutral-400/20'
            : 'bg-neutral-900/95 border-neutral-800 text-neutral-200 backdrop-blur-xl shadow-black/60'
        }`}
      >
        {/* Left: Reset & Speed Controller */}
        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          <button
            onClick={onReset}
            title="Reset to Start (R)"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isLight
                ? 'hover:bg-neutral-100 text-neutral-600'
                : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Speed Control (Adaptive: compact stepper on mobile, range slider on tablet/desktop) */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-0.5 rounded-full text-xs">
            <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium hidden md:inline">
              Speed:
            </span>

            {/* Range Slider for screens >= 480px */}
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={config.speed}
              onChange={(e) => onChangeConfig({ speed: Number(e.target.value) })}
              className="w-12 sm:w-20 md:w-24 h-1.5 bg-neutral-700/60 rounded-lg appearance-none cursor-pointer accent-blue-600 hidden xs:block"
            />

            <span className="font-mono text-[11px] sm:text-xs font-semibold text-blue-500 w-6 text-center">
              {config.speed}x
            </span>
          </div>
        </div>

        {/* Center: Play/Pause Pill Button (Touch-optimized min 44px touch target) */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm shadow-md transition-all transform active:scale-95 cursor-pointer shrink-0 ${
              isPlaying
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                <span>Play</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Subtitle Toggle, TTS, Settings & Fullscreen */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          {/* Quick Subtitle Translation Toggle */}
          <button
            onClick={() => onChangeConfig({ showTranslation: !config.showTranslation })}
            title={config.showTranslation ? 'Hide 3rd Text Subtitles' : 'Show 3rd Text Subtitles'}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              config.showTranslation
                ? 'text-blue-500 bg-blue-500/15'
                : isLight
                ? 'hover:bg-neutral-100 text-neutral-400'
                : 'hover:bg-neutral-800 text-neutral-500'
            }`}
          >
            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Native Text-to-Speech */}
          <button
            onClick={onPlayTts}
            title={isTtsPlaying ? 'Stop Audio Playback' : 'Listen to Audio (TTS)'}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isTtsPlaying
                ? 'bg-blue-600 text-white animate-pulse'
                : isLight
                ? 'hover:bg-neutral-100 text-neutral-600'
                : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            {isTtsPlaying ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Settings Shortcut */}
          <button
            onClick={onOpenSettings}
            title="Open Settings"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isLight
                ? 'hover:bg-neutral-100 text-neutral-600'
                : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Fullscreen (desktop & tablet) */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full hidden sm:flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isLight
                ? 'hover:bg-neutral-100 text-neutral-600'
                : 'hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
