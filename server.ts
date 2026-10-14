import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
// Environment constraint: Dev server must run on port 3000
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to sanitize Gemini response text in case it includes markdown code fences
function cleanJsonText(raw: string): string {
  let cleaned = (raw || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Helper to create Gemini client per request (supporting User-Provided Key or Server Default)
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No Gemini API key provided. Please enter your Gemini API key in the AI Generator or set GEMINI_API_KEY.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient fallback generator to handle 503 high demand or quota spikes
async function generateWithFallback(client: GoogleGenAI, params: any) {
  // Candidate models compliant with gemini-api skill
  const candidates = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastErr: any = null;

  for (const model of candidates) {
    try {
      return await client.models.generateContent({
        ...params,
        model,
      });
    } catch (err: any) {
      console.warn(`Model ${model} error:`, err?.message || err);
      lastErr = err;
      const msg = err?.message || '';

      // Check if invalid API key, throw immediately
      if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID') || msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
        throw new Error('The provided Gemini API Key is invalid or unauthorized. Please verify your key at https://aistudio.google.com/app/apikey');
      }

      // If 503 (high demand), 429 (rate limit), or UNAVAILABLE, try next candidate model
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('429')) {
        continue;
      }
      throw err;
    }
  }

  throw lastErr;
}

export interface RubyToken {
  text: string;
  reading: string;
  meaning?: string;
}

export interface ScriptLine {
  speaker?: string;
  tokens: RubyToken[];
  fullTranslation?: string;
  notes?: string;
}

// 1. Generate Structured Language Learning Prompter Script
app.post('/api/generate-script', async (req, res) => {
  try {
    const customApiKey = (req.headers['x-gemini-key'] as string) || req.body.apiKey;
    const client = getGeminiClient(customApiKey);

    const {
      language = 'English',
      languageCode = 'en-US',
      mode = 'speech', // 'dialogue' | 'speech'
      topic = 'The Future of Artificial Intelligence and Human Learning',
      level = 'Intermediate (B1-B2)',
      userPrompt = '',
      translationLanguage = 'Indonesian', // user's preferred native language for the 3rd tier translation
    } = req.body;

    const systemPrompt = `You are a world-class speech coach and language educator writing teleprompter practice scripts.
Your mission is to generate natural, engaging, and thorough teleprompter scripts with precise pronunciation/reading annotations (Ruby text) for learners of ANY language (both alphabet and non-alphabet).

IMPORTANT LENGTH & DEPTH GUIDELINE:
- Do NOT generate a short or truncated script. Provide a rich, immersive, and substantive practice text (around 14 to 22 natural reading lines).
- Provide sufficient depth and context so the learner has an extensive, rewarding practice session without finishing too quickly.

Phonetic Rules:
- English: The 'reading' field MUST contain IPA phonetic pronunciation (e.g., /ˌɛntrəprəˈnɜːr/, /ˈkʌmftəbl/, /ˌæksəˈlɛreɪt/) or clear syllable stress phonics for key or challenging words. For simple words, provide standard phonetic representation.
- Spanish / French / German / Italian / Portuguese / Indonesian: The 'reading' field contains phonetic syllable breakdown, stress accents, or liaison guide (e.g. French 'beaucoup' -> /boku/, German 'Gemütlichkeit' -> /ɡəˈmyːtlɪçkaɪt/).
- Chinese (Mandarin): The 'reading' field MUST be accurate Pinyin WITH tone marks (e.g., nǐ, hǎo, kāfēi, fúwùyuán).
- Japanese: The 'reading' field MUST be Furigana in Hiragana (or Katakana for loanwords).
- Korean: The 'reading' field MUST be Revised Romanization (e.g., 'an-nyeong-ha-se-yo').
- Russian: The 'reading' field MUST be Latin transliteration with stress marks (e.g., 'Zdrást-vuy-te').
- Arabic: The 'reading' field MUST be Latin romanization with macron/stress.
- Other languages: The 'reading' field should be phonetic transcription or IPA.

The script must feel authentic, engaging, and well-paced for scrolling teleprompter reading.`;

    const userInstruction = `Generate an in-depth, complete ${mode} script in ${language} (${level}) about: "${topic}".
User instructions / custom nuances: ${userPrompt || 'Make it realistic, immersive, conversational, and rich in vocabulary.'}
Generate a rich, substantive practice script with around 10 to 14 lines.
CRITICAL: The 'fullTranslation' field for EVERY line MUST be translated into ${translationLanguage} so the user understands the exact meaning in their preferred language.
Also each token's 'meaning' field should be translated into ${translationLanguage}.

Return STRICT JSON matching the schema:
- title: catchy title in English & target language
- language: string
- languageCode: BCP-47 tag (e.g., en-US, es-ES, zh-CN, ja-JP, ko-KR, ru-RU, ar-SA, etc.)
- topic: string
- level: string
- type: "${mode}"
- estimatedWpm: speaking speed for this level (typically 100-130 WPM)
- vocabHighlights: array of 4-6 key vocabulary items with term, reading, meaning (meaning in ${translationLanguage})
- lines: array of script lines. For dialogue, include 'speaker'. Each line has 'tokens' (array of { text, reading, meaning in ${translationLanguage} }) and 'fullTranslation' (translated into ${translationLanguage}).`;

    const response = await generateWithFallback(client, {
      contents: userInstruction,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            language: { type: Type.STRING },
            languageCode: { type: Type.STRING },
            topic: { type: Type.STRING },
            level: { type: Type.STRING },
            type: { type: Type.STRING },
            estimatedWpm: { type: Type.NUMBER },
            vocabHighlights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                },
                required: ['term', 'reading', 'meaning'],
              },
            },
            lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  fullTranslation: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  tokens: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        reading: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                      },
                      required: ['text', 'reading'],
                    },
                  },
                },
                required: ['tokens', 'fullTranslation'],
              },
            },
          },
          required: ['title', 'language', 'languageCode', 'lines'],
        },
      },
    });

    const cleaned = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating script:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate script. Please check your Gemini API key or try again.',
    });
  }
});

// 2. Convert Raw Text / Document into Phonetic Ruby Tokens
app.post('/api/annotate-text', async (req, res) => {
  try {
    const customApiKey = (req.headers['x-gemini-key'] as string) || req.body.apiKey;
    const client = getGeminiClient(customApiKey);

    const { text, language = 'English', translationLanguage = 'Indonesian' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const systemPrompt = `You are an automated phonetic parser for teleprompters.
Convert raw input text in ${language} into segmented sentences and words with dual-layer phonetic ruby annotations.
- English: IPA phonetic symbols or readable syllable stress for words (e.g. "comfortable" -> /ˈkʌmftəbl/, "technology" -> /tɛkˈnɒlədʒi/).
- Spanish/French/German/Italian/Indonesian: Syllable breakdown or IPA phonetic guide.
- Chinese: Pinyin with tone marks for each word segment.
- Japanese: Hiragana furigana for kanji compounds.
- Korean: Revised Romanization for word tokens.
- Russian: Cyrillic with Latin transliteration and stress.
- Arabic: Harakat and Latin romanization.
- Other languages: Phonetic guides.

CRITICAL: Translate the 'fullTranslation' field of each line into ${translationLanguage}.
Also translate each token's 'meaning' into ${translationLanguage}.
Preserve speaker labels if dialogue format (e.g. "A:", "B:", "Alice:").
Group natural word segments so reading stays aligned with the main characters.`;

    const response = await generateWithFallback(client, {
      contents: `Annotate this ${language} text into teleprompter lines with fullTranslation in ${translationLanguage}:\n\n${text.slice(0, 4000)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            language: { type: Type.STRING },
            languageCode: { type: Type.STRING },
            lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  fullTranslation: { type: Type.STRING },
                  tokens: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        reading: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                      },
                      required: ['text', 'reading'],
                    },
                  },
                },
                required: ['tokens'],
              },
            },
          },
          required: ['lines'],
        },
      },
    });

    const cleaned = cleanJsonText(response.text || '{}');
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error annotating text:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to annotate text. Please check your Gemini API key or try again.',
    });
  }
});

// 3. Dynamic Script Translation: Translate 3rd-tier Subtitle and Word Meanings to User's Custom Language
app.post('/api/translate-script', async (req, res) => {
  try {
    const customApiKey = (req.headers['x-gemini-key'] as string) || req.body.apiKey;
    const client = getGeminiClient(customApiKey);

    const { lines, targetLanguage = 'Indonesian' } = req.body;
    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ success: false, error: 'Lines array is required' });
    }

    const sentencesToTranslate = lines.map((l: any, i: number) => ({
      index: i,
      speaker: l.speaker || '',
      originalText: l.tokens.map((t: any) => t.text).join(' '),
    }));

    const response = await generateWithFallback(client, {
      contents: `Translate the following teleprompter lines into ${targetLanguage} for the subtitle display.
Return JSON array with the exact translated lines corresponding to each index.
Input lines:
${JSON.stringify(sentencesToTranslate, null, 2)}`,
      config: {
        systemInstruction: `You are a professional subtitle translator. Provide natural, accurate translations into ${targetLanguage}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              translatedText: { type: Type.STRING },
            },
            required: ['index', 'translatedText'],
          },
        },
      },
    });

    const cleaned = cleanJsonText(response.text || '[]');
    const translations: { index: number; translatedText: string }[] = JSON.parse(cleaned);
    const translationMap = new Map<number, string>();
    translations.forEach((t) => translationMap.set(t.index, t.translatedText));

    const updatedLines = lines.map((l: any, i: number) => ({
      ...l,
      fullTranslation: translationMap.get(i) || l.fullTranslation,
    }));

    res.json({ success: true, lines: updatedLines, targetLanguage });
  } catch (error: any) {
    console.error('Error translating script:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to translate script subtitles.',
    });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LingoPrompt server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
