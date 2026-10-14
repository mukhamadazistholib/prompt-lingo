import React, { useEffect, useRef, useState } from 'react';
import { PrompterScript, PrompterConfig, RubyToken, ScriptLine } from '../types/prompter';
import { Eye, User, Globe2, Loader2, RefreshCw } from 'lucide-react';
import { POPULAR_TRANSLATION_LANGUAGES } from '../data/translationLanguages';

interface PrompterDisplayProps {
  script: PrompterScript;
  config: PrompterConfig;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onTokenClick: (token: RubyToken) => void;
  onLineChange?: (lineIndex: number) => void;
  onTranslateSubtitles?: (targetLanguage: string) => void;
  isTranslatingSubtitles?: boolean;
}

export const PrompterDisplay: React.FC<PrompterDisplayProps> = ({
  script,
  config,
  isPlaying,
  onTogglePlay,
  onReset,
  onTokenClick,
  onLineChange,
  onTranslateSubtitles,
  isTranslatingSubtitles,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Smooth continuous scroll loop using requestAnimationFrame
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastTime = performance.now();

    const scrollStep = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        // Base scroll speed: speed 1 = ~25px/sec, speed 10 = ~250px/sec
        const pixelsPerSecond = config.speed * 26;
        container.scrollTop += pixelsPerSecond * delta;

        // Auto stop if reached the bottom
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
          onTogglePlay();
          return;
        }

        // Calculate currently active reading line near the 35% focus eyeline
        const focusY = container.clientHeight * 0.35 + container.scrollTop;
        const lineElements = container.querySelectorAll<HTMLElement>('.prompter-line');
        let activeIdx = 0;
        lineElements.forEach((el, idx) => {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (focusY >= top - 20 && focusY <= top + height + 20) {
            activeIdx = idx;
          }
        });
        setCurrentLineIndex(activeIdx);
        if (onLineChange) onLineChange(activeIdx);
      }

      animationFrameId.current = requestAnimationFrame(scrollStep);
    };

    animationFrameId.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, config.speed, onTogglePlay, onLineChange]);

  // Color theme styles (Google / Material 3 Style)
  const getThemeClasses = () => {
    switch (config.theme) {
      case 'google-light':
        return {
          bg: 'bg-neutral-50',
          mainText: 'text-neutral-900',
          subText: 'bg-white text-neutral-600 border-neutral-200 shadow-sm',
          subHighlight: 'bg-blue-50 text-blue-900 border-blue-200 font-medium',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          focusLine: 'border-blue-500/40 bg-blue-500/10 text-blue-600',
          headerBg: 'border-neutral-200 text-neutral-500',
          metaChip: 'bg-neutral-200/60 border-neutral-300 text-neutral-700',
        };
      case 'studio-black':
        return {
          bg: 'bg-black',
          mainText: 'text-emerald-400',
          subText: 'bg-neutral-950 text-emerald-300 border-emerald-900/40',
          subHighlight: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40 font-medium',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          focusLine: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
          headerBg: 'border-neutral-900 text-neutral-500',
          metaChip: 'bg-neutral-900 border-neutral-800 text-neutral-400',
        };
      case 'high-contrast':
        return {
          bg: 'bg-neutral-950',
          mainText: 'text-amber-300',
          subText: 'bg-neutral-900 text-amber-200 border-amber-500/40',
          subHighlight: 'bg-amber-950/80 text-amber-200 border-amber-500/50 font-medium',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          focusLine: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
          headerBg: 'border-neutral-900 text-neutral-500',
          metaChip: 'bg-neutral-900 border-neutral-800 text-amber-400',
        };
      case 'google-dark':
      default:
        return {
          bg: 'bg-[#121418]',
          mainText: 'text-neutral-100',
          subText: 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60',
          subHighlight: 'bg-blue-500/15 text-blue-200 border-blue-500/40 font-medium',
          badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
          focusLine: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
          headerBg: 'border-neutral-800 text-neutral-400',
          metaChip: 'bg-neutral-800/60 border-neutral-700/60 text-neutral-300',
        };
    }
  };

  const theme = getThemeClasses();

  // Dynamic Ruby Color
  const getRubyTextColor = () => {
    switch (config.rubyColor) {
      case 'amber':
        return 'text-amber-400';
      case 'emerald':
        return 'text-emerald-400';
      case 'purple':
        return 'text-purple-400';
      case 'white':
        return config.theme === 'google-light' ? 'text-neutral-900' : 'text-neutral-100';
      case 'blue':
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  };

  const rubyColorClass = getRubyTextColor();

  const mirrorStyle: React.CSSProperties = {
    transform: `
      ${config.mirrorHorizontal ? 'scaleX(-1)' : ''}
      ${config.mirrorVertical ? 'scaleY(-1)' : ''}
    `.trim() || undefined,
  };

  const alignmentClass =
    config.textAlign === 'left' ? 'text-left items-start justify-start' : 'text-center items-center justify-center';

  const transMeta = POPULAR_TRANSLATION_LANGUAGES.find(
    (l) => l.id.toLowerCase() === (config.translationLanguage || 'Indonesian').toLowerCase()
  );

  return (
    <div className={`relative flex-1 w-full h-full overflow-hidden ${theme.bg} select-none transition-colors duration-200`}>
      {/* Eye-line Focus Guide Bar (Google Style) */}
      {config.showFocusGuide && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-20 flex items-center justify-between px-2 sm:px-6 transition-all duration-300"
          style={{ top: '35%' }}
        >
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="mx-1.5 sm:mx-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase bg-neutral-900/85 backdrop-blur-md border border-blue-500/30 text-blue-400 flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3 h-3 text-blue-400" />
            <span className="hidden xs:inline">Focus Eye-line</span>
          </div>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </div>
      )}

      {/* Main Teleprompter Scrolling Viewport (Adaptive Responsive Padding) */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto px-3 sm:px-6 md:px-10 lg:px-16 py-14 sm:py-20 md:py-24 scrollbar-none"
        style={mirrorStyle}
      >
        <div className={`max-w-4xl mx-auto flex flex-col ${alignmentClass}`}>
          {/* Script Title & Language Meta */}
          <div className={`mb-8 sm:mb-14 pt-2 sm:pt-4 pb-4 sm:pb-6 border-b ${theme.headerBg} w-full text-center`}>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium border ${theme.metaChip}`}>
                <span>{script.flag}</span>
                <span className="font-semibold">{script.language}</span>
                <span>•</span>
                <span>{script.level}</span>
                <span>•</span>
                <span className="capitalize">{script.type}</span>
              </div>

              {/* Subtitle Translation Language Pill & Quick Retranslate */}
              {config.showTranslation && (
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-blue-500/10 border border-blue-500/25 text-blue-400">
                  <Globe2 className="w-3 h-3 text-blue-400" />
                  <span>3rd Text Subtitles:</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    {transMeta?.flag || '🌐'} {config.translationLanguage || 'Indonesian'}
                  </span>
                  {onTranslateSubtitles && (
                    <button
                      type="button"
                      disabled={isTranslatingSubtitles}
                      onClick={() => onTranslateSubtitles(config.translationLanguage || 'Indonesian')}
                      title={`Translate subtitles into ${config.translationLanguage || 'Indonesian'}`}
                      className="ml-1 p-0.5 hover:text-white rounded transition-colors cursor-pointer"
                    >
                      {isTranslatingSubtitles ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                      ) : (
                        <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            <h1 className={`text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight ${theme.mainText} px-2`}>
              {script.title}
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-neutral-400 mt-1 max-w-xl mx-auto px-2">
              Topic: {script.topic}
            </p>
          </div>

          {/* Lines Container */}
          <div className="w-full space-y-8 sm:space-y-12 md:space-y-14 pb-52 sm:pb-64">
            {script.lines.map((line: ScriptLine, lineIdx: number) => {
              const isCurrent = lineIdx === currentLineIndex;

              return (
                <div
                  key={lineIdx}
                  className={`prompter-line w-full flex flex-col ${alignmentClass} transition-all duration-300 p-2 sm:p-4 rounded-3xl ${
                    isCurrent
                      ? 'opacity-100 scale-100'
                      : isPlaying
                      ? 'opacity-55 scale-[0.98]'
                      : 'opacity-90'
                  }`}
                >
                  {/* Speaker Label */}
                  {line.speaker && (
                    <div className="mb-1.5 sm:mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide border shadow-sm ${theme.badge}`}
                      >
                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{line.speaker}</span>
                      </span>
                    </div>
                  )}

                  {/* Dual-Tier Phonetic Ruby Words Container */}
                  <div
                    className={`flex flex-wrap items-end ${
                      config.textAlign === 'left' ? 'justify-start' : 'justify-center'
                    } gap-x-1 sm:gap-x-2.5 md:gap-x-3.5 gap-y-2 sm:gap-y-3.5 max-w-3xl leading-none`}
                  >
                    {line.tokens.map((token: RubyToken, tokenIdx: number) => {
                      const hasReading = Boolean(token.reading && token.reading.trim() !== '');

                      return (
                        <div
                          key={tokenIdx}
                          onClick={() => onTokenClick(token)}
                          title={token.meaning ? `Meaning: ${token.meaning}` : 'Click to inspect pronunciation'}
                          className="inline-flex flex-col items-center group cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                        >
                          {/* 1. Secondary Top Reading Font (Ruby / Furigana / Pinyin / IPA) */}
                          {config.showRuby && (
                            <span
                              className={`ruby-font font-medium tracking-normal select-none transition-all duration-200 block text-center mb-0.5 sm:mb-1 ${
                                hasReading ? rubyColorClass : 'opacity-0'
                              } group-hover:brightness-125`}
                              style={{
                                fontSize: `clamp(10px, 2.4vw, ${config.readingFontSize}px)`,
                                minHeight: `${config.readingFontSize * 1.15}px`,
                                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                              }}
                            >
                              {token.reading || ' '}
                            </span>
                          )}

                          {/* 2. Primary Main Glyph Font (Adaptive Responsive Font Clamp) */}
                          <span
                            className={`main-glyph font-bold tracking-wide transition-colors duration-200 block text-center leading-none ${theme.mainText} group-hover:text-blue-500`}
                            style={{
                              fontSize: `clamp(20px, 5.2vw, ${config.mainFontSize}px)`,
                            }}
                          >
                            {token.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3. 3rd Text Tier: Customizable Subtitle Translation Underneath */}
                  {config.showTranslation && line.fullTranslation && (
                    <div className="mt-2.5 sm:mt-3.5 max-w-2xl px-1 sm:px-2">
                      <div
                        className={`inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl tracking-wide border backdrop-blur-md transition-all ${
                          isCurrent ? theme.subHighlight : theme.subText
                        }`}
                        style={{
                          fontSize: `clamp(11px, 2.7vw, ${config.translationFontSize || 14}px)`,
                          lineHeight: '1.4',
                        }}
                      >
                        <span className="opacity-75 mr-1 font-mono text-[10px] uppercase tracking-wider">
                          [{transMeta?.flag || '🌐'} {config.translationLanguage || 'Sub'}]:
                        </span>
                        <span>{line.fullTranslation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* End of Script indicator */}
          <div className="text-center py-12 text-neutral-500 text-xs w-full">
            <p className="font-semibold uppercase tracking-widest mb-1">— End of Script —</p>
            <p>Press Play or Spacebar to restart your speaking practice</p>
          </div>
        </div>
      </div>
    </div>
  );
};
