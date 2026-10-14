export interface RubyToken {
  text: string;
  reading: string;
  meaning?: string;
  pinyinWithTones?: string;
}

export interface ScriptLine {
  id?: string;
  speaker?: string;
  tokens: RubyToken[];
  fullTranslation?: string;
  notes?: string;
}

export interface PrompterScript {
  id: string;
  title: string;
  language: string;
  languageCode: string;
  flag: string;
  topic: string;
  level: string;
  type: 'dialogue' | 'passage' | 'speech';
  estimatedWpm: number;
  lines: ScriptLine[];
  vocabHighlights?: {
    term: string;
    reading: string;
    meaning: string;
  }[];
}

export interface PrompterConfig {
  // Typography
  mainFontSize: number;         // 20 to 96 px
  readingFontSize: number;      // 10 to 44 px
  translationFontSize: number;  // 12 to 28 px
  textAlign: 'center' | 'left';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  rubyColor: 'blue' | 'amber' | 'emerald' | 'purple' | 'white';

  // Subtitle Translation Language
  translationLanguage: string;  // 'Indonesian' | 'English' | 'Spanish' | 'French' | 'German' | 'Japanese' | 'Korean' | 'Chinese' | 'Arabic' | etc.

  // Scrolling & Prompter
  speed: number;                // 1 to 10
  dimInactiveLines: boolean;
  showRuby: boolean;
  showTranslation: boolean;
  showFocusGuide: boolean;
  karaokeMode: boolean;

  // Mirror & Rig
  mirrorHorizontal: boolean;
  mirrorVertical: boolean;

  // Camera & Shadowing
  cameraOverlay: boolean;
  cameraOpacity: number;        // 0.1 to 0.9
  cameraLayout: 'backdrop' | 'pip';

  // Audio TTS
  speechRate: number;           // 0.5 to 1.5

  // Theme
  theme: 'google-dark' | 'google-light' | 'studio-black' | 'high-contrast';
}

export interface LanguageDef {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
  scriptType: 'alphabetic' | 'logographic' | 'syllabic';
  readingLabel: string;
  defaultFont: string;
  sampleTopics: string[];
}
