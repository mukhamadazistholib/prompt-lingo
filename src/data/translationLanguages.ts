export interface TranslationLanguage {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const POPULAR_TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  { id: 'Indonesian', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { id: 'English', name: 'English', nativeName: 'English (US/UK)', flag: '🇺🇸' },
  { id: 'Spanish', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { id: 'French', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { id: 'German', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { id: 'Japanese', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { id: 'Korean', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { id: 'Chinese', name: 'Chinese', nativeName: '中文 (Mandarin)', flag: '🇨🇳' },
  { id: 'Arabic', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { id: 'Russian', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { id: 'Portuguese', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { id: 'Italian', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { id: 'Dutch', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { id: 'Vietnamese', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'Turkish', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { id: 'Hindi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];
