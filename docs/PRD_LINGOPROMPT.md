# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# LingoPrompt AI — Language Learning Teleprompter Platform

**Dokumen Versi:** 1.0.0  
**Tanggal:** 14 Oktober 2026  
**Status:** Approved for Implementation  
**Target Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Google Gemini 3.8 Flash + Web Speech API  
**Target Pengguna:** Pembelajar Bahasa Asing, Konten Kreator Edukasi (TikTok/Reels/YouTube Shorts), Presenter & Siswa Ujian Bicara (JLPT, HSK, TOPIK, TORFL)

---

## 1. Executive Summary & Visi Produk

### 1.1 Latar Belakang Masalah
Mempelajari dan mempraktikkan kemampuan berbicara (*speaking & reading aloud*) dalam bahasa-bahasa non-alfabet (seperti Mandarin, Jepang, Korea, dan Rusia) memiliki hambatan kognitif yang sangat tinggi:
1. **Beban Pengenalan Karakter:** Pembelajar pemula hingga menengah sering tersendat ketika membaca karakter logografis (Hanzi/Kanji) atau alfabet alternatif (Hangul/Sirilik) karena ragu akan cara bacanya (*phonetic pronunciation*).
2. **Ketiadaan Alat Latihan Berbicara yang Mengalir:** Teleprompter konvensional hanya menampilkan satu baris teks biasa tanpa panduan fonetik atas karakter (*ruby text / furigana / pinyin*), membuat pembelajar kehilangan tempo dan irama alami bicara.
3. **Keterbatasan Materi Latihan:** Sangat sulit menemukan teks bacaan atau percakapan yang pas dengan tingkat kemampuan (HSK/JLPT/TOPIK), bertopik spesifik, dan sekaligus memiliki transkripsi cara baca yang presisi per kata.

### 1.2 Solusi: LingoPrompt AI
**LingoPrompt AI** adalah platform teleprompter cerdas berbasis web yang dirancang khusus untuk pembelajaran bahasa asing. Menghadirkan **Dual-Tier Phonetic Typography** (teks utama di tengah dan teks cara baca sekunder di atasnya dengan ukuran proporsional), generator materi percakapan dan bacaan bertenaga **Google Gemini AI**, dukungan unggah dokumen, serta fitur pelengkap seperti *Studio Shadowing with Webcam*, *Native TTS Playback*, dan *Mirror Rig Mode*.

---

## 2. Target Pengguna & Persona

| Persona | Profil & Kebutuhan | Pain Point Utama |
|---|---|---|
| **Rian (22 th) - Pelajar Bahasa Jepang & Mandarin** | Sedang mempersiapkan ujian JLPT N3 dan HSK 3, butuh latihan kelancaran membaca naskah percakapan. | Sering lupa cara baca Kanji/Hanzi saat membaca cepat; teks prompter biasa tidak menyediakan furigana/pinyin. |
| **Sarah (27 th) - Edukator / Konten Kreator Bahasa** | Membuat video edukasi bahasa Korea dan Rusia untuk media sosial (Reels/TikTok/YouTube). | Sulit membaca teks sambil menatap lensa kamera tanpa terlihat kaku atau salah sebut pelafalan. |
| **Budi (34 th) - Profesional Bisnis Global** | Menyiapkan pidato pembukaan dan presentasi dalam bahasa Rusia dan Mandarin untuk klien internasional. | Butuh naskah topik bisnis dengan kontrol kecepatan kata per menit (WPM) dan panduan intonasi. |

---

## 3. Arsitektur Teknis & Tech Stack

### 3.1 Diagram Arsitektur
```
┌─────────────────────────────────────────────────────────────┐
│                      Client Frontend                        │
│   Next.js 15 (App Router) + React 19 + Tailwind CSS v4      │
│                                                             │
│   ┌───────────────────┐ ┌──────────────────┐ ┌────────────┐ │
│   │ Teleprompter Core │ │ Dual-Tier Ruby   │ │ Camera     │ │
│   │ (RAF Smooth Scroll│ │ Typography Engine│ │ Shadowing  │ │
│   │  & Speed Controller│ │ (Hanzi/Pinyin/etc│ │ Overlay    │ │
│   └───────────────────┘ └──────────────────┘ └────────────┘ │
│            │                      │                 │       │
│            ▼                      ▼                 ▼       │
│   ┌───────────────────┐ ┌──────────────────┐ ┌────────────┐ │
│   │ Web Speech API    │ │ Audio Visualizer │ │ Storage    │ │
│   │ Native TTS Engine │ │ & Pitch/WPM Metre│ │ Local/Cloud│ │
│   └───────────────────┘ └──────────────────┘ └────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON Stream
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Server API Layer (Next.js / Express)        │
│                                                             │
│  POST /api/generate-script  ──┐                             │
│  POST /api/annotate-text    ──┼──► Google GenAI SDK         │
│                               │    (gemini-3.8-flash)       │
│                               │    - JSON Structured Schema │
│                               │    - Phonetic Tokenizer     │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Spesifikasi Teknologi
- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (menggunakan CSS variables modern, subgrid, dan fluid typography)
- **AI Engine:** Google Gemini (`gemini-3.8-flash`) via official `@google/genai` TypeScript SDK
- **Speech Synthesis:** Web Speech API (`speechSynthesis`) dengan deteksi aksen lokal native (`zh-CN`, `ja-JP`, `ko-KR`, `ru-RU`, dll.)
- **Media Capture:** WebRTC `navigator.mediaDevices.getUserMedia` untuk *Webcam Shadowing Overlay*
- **State Management:** React Context / Zustand untuk prompter playback states & typography preferences

---

## 4. Fitur Utama & Spesifikasi Fungsional

### 4.1 Dual-Tier Phonetic Typography Engine (Fitur Inti)
Layout teks teleprompter dirancang secara hierarkis:
1. **Tier 1 (Main Character / Center Font):**
   - Menampilkan karakter asli bahasa target (Hanzi, Kanji, Hangul, Sirilik, Arab, dll.).
   - Rentang ukuran font (*customizable*): `24px` hingga `96px` (slider responsif).
   - Tipografi: Noto Sans SC, Noto Sans JP, Noto Sans KR, JetBrains Mono, Inter.
2. **Tier 2 (Phonetic Ruby / Top Secondary Font):**
   - Berada persis di atas setiap unit kata / karakter dengan posisi tengah sejajar (*ruby annotation*).
   - Menampilkan cara baca fonetik:
     - **Mandarin:** Pinyin lengkap dengan tanda nada (*tone marks*: ā, á, ǎ, à).
     - **Jepang:** Furigana (Hiragana untuk Kanji, Katakana untuk gairaigo/nama asing).
     - **Korea:** Alih aksara resmi *Revised Romanization of Korean* (RR).
     - **Rusia:** Transliterasi Latin dengan penanda suku kata bertekanan (*stress accent*).
     - **Arab:** Romanisasi ALA-LC / DIN dengan tanda harakat/tashkeel.
   - Rentang ukuran font: `12px` hingga `44px` (rasio ideal: 40% - 60% dari ukuran font utama).
   - Opsi warna sekunder kontras tinggi (misal: kuning amber di atas teks putih latar gelap).
3. **Tier 3 (Sub-Line Translation / Optional Meaning):**
   - Terjemahan kalimat (Bahasa Indonesia / Inggris) di bagian bawah baris untuk pemahaman konteks cepat. Dapat diaktifkan atau dinonaktifkan (*toggle switch*).

### 4.2 Smooth Auto-Scrolling Teleprompter Engine
- **Mekanisme Gerak:** Menggunakan `requestAnimationFrame` untuk pergerakan mulus tanpa patah-patah (*zero-stutter 60fps scrolling*).
- **Kontrol Kecepatan Adaptif:**
  - Satuan: Words Per Minute (WPM) mulai dari 30 WPM (sangat santai/pemula) hingga 250 WPM (pembaca cepat).
  - Slider kecepatan 1 - 10 dengan tombol pintas keyboard `[+]` dan `[-]` atau `[↑]` dan `[↓]`.
- **Focus Reading Guide (Garis Baca / Eye-line Indicator):**
  - Garis penunjuk horizontal atau penanda kotak transparan di sepertiga atas layar agar mata pembaca terarah ke titik lensa kamera.
  - Opsi peredupan baris teks sebelum dan sesudah baris aktif (*dim non-active lines*).
- **Karaoke / Shadowing Mode:**
  - Penyorotan kata per kata (*word-by-word highlight glow*) yang sinkron dengan kecepatan baca.
- **Hardware Teleprompter Rig Mirroring:**
  - **Mirror X (Horizontal Flip):** Membalik teks horizontal seperti cermin untuk digunakan pada perangkat teleprompter fisik kaca miring 45 derajat (beam splitter glass).
  - **Mirror Y (Vertical Flip):** Membalik teks secara vertikal bila dibutuhkan oleh posisi refleksi cermin atas/bawah.

### 4.3 Integrasi AI Gemini (Gemini 3.8 Flash)
Modul generasi naskah bertenaga AI dengan *system instruction* khusus bahasa:
1. **Mode Konten:**
   - **Percakapan / Dialog:** Naskah multi-pembicara (A & B) dengan penanda nama pembicara, konteks sosial, dan intonasi.
   - **Bacaan / Monolog:** Naskah pidato, ringkasan berita, cerita rakyat, ulasan produk, atau presentasi kerja.
2. **Kustomisasi Topik Fleksibel:**
   - Preset topik siap pakai: *Ordering Coffee & Food*, *Job Interview*, *Airport & Hotel Check-in*, *Hospital & Doctor Consultation*, *Tech Startup Pitch*, *Daily Casual Gossip*, *Weather & Travel*.
   - Input topik bebas sesuai kebutuhan pengguna.
3. **Pemilihan Tingkat Kemahiran (CEFR & Framework Standar):**
   - Beginner (A1-A2 / HSK 1-2 / JLPT N5-N4 / TOPIK I)
   - Intermediate (B1-B2 / HSK 3-4 / JLPT N3 / TOPIK II Level 3-4)
   - Advanced (C1-C2 / HSK 5-6 / JLPT N1-N2 / TOPIK II Level 5-6)
4. **Structured JSON Output:**
   - Menggunakan schema `Type.OBJECT` dari `@google/genai` untuk menjamin token teks dan ruby terpisah rapi tanpa perlu pemotongan teks secara manual.

### 4.4 Modul Unggah Dokumen & Import Teks Kustom
- Mendukung unggah berkas teks: `.txt`, `.srt`, `.vtt`, `.md`, dan *paste* langsung dari clipboard.
- **Fitur AI Auto-Annotator:**
  - Ketika pengguna mengunggah teks bahasa Mandarin/Jepang/Korea/Rusia mentah tanpa cara baca, sistem otomatis mengirimkan teks ke backend Gemini untuk diberi tokenisasi ruby secara instan!

---

## 5. Fitur-Fitur Tambahan Unggulan (Nilai Tambah Inovatif)

Berikut adalah 6 fitur unggulan bernilai tinggi yang diimplementasikan pada aplikasi:

### 5.1 Mode Studio Shadowing & Rekam Kamera (Webcam Mirror Overlay)
- Menampilkan *feed* kamera depan (webcam) pengguna tepat di belakang teks teleprompter yang semi-transparan (atau mode *split screen* pip).
- **Tujuan Pembelajaran:**
  - Memungkinkan pembelajar melihat artikulasi bentuk bibir dan lidah sendiri saat membaca.
  - Menjaga kontak mata langsung ke arah kamera seperti presenter berita profesional.
  - Tombol rekam video (*record performance*) dengan audio mikrofon agar siswa dapat memutar ulang hasil bacaan mereka untuk evaluasi.

### 5.2 Native Text-to-Speech (TTS) Pacing & Pronunciation Audio
- Pemutaran audio suara penutur asli menggunakan Web Speech API dengan pemilihan suara sesuai kode bahasa (`zh-CN`, `ja-JP`, `ko-KR`, `ru-RU`, `ar-SA`).
- Mode "Listen First" untuk mendengarkan pelafalan ideal sebelum mulai membaca sendiri.
- Tombol play/pause audio sinkron dengan jalannya scrolling teleprompter.

### 5.3 Speedometer WPM & Estimasi Waktu Bicara
- Penghitung durasi bacaan total berdasarkan panjang teks dan kecepatan terpilih.
- Penanda *Elapsed Time* dan *Remaining Time* agar pengguna tahu persis kapan waktu latihan atau rekaman mereka selesai.

### 5.4 Kamus Cepat Interaktif (Interactive Vocabulary Drawer)
- Setiap kata atau karakter dapat diklik untuk membuka panel samping yang menjelaskan:
  - Cara baca detail & pemecahan suku kata.
  - Arti kata dalam konteks kalimat.
  - Catatan tata bahasa (*grammar hint*) atau tingkat formalitas kata.

### 5.5 Preset Perpustakaan Naskah Multibahasa Terkurasi
- Koleksi naskah siap pakai dalam 5 bahasa utama:
  - **Mandarin:** Memesan Dim Sum & Perkenalan Diri Bisnis.
  - **Jepang:** Percakapan di Izakaya & Wawancara Kerja.
  - **Korea:** Dialog Kafe di Hongdae & Percakapan Drama Realistis.
  - **Rusia:** Pertemuan di Kafe Moskow & Cerita Klasik Rusia.
  - **Arab:** Menyapa & Berbelanja di Pasar Tradisional.

### 5.6 Pintasan Keyboard Lengkap (Studio Hotkeys)
- `Space`: Mulai / Berhenti Berjalan (Play / Pause)
- `↑` / `↓`: Naikkan / Turunkan Kecepatan Scrolling
- `F`: Mode Layar Penuh (Fullscreen Teleprompter)
- `M`: Toggle Horizontal Mirroring (Untuk Kaca Teleprompter)
- `R`: Reset Scroll ke Posisi Awal
- `C`: Toggle Mode Kamera / Webcam Shadowing

---

## 6. Desain Antarmuka & Tema Visual (UI/UX)

1. **Dark Studio Mode (Default):** Latar belakang hitam pekat `#0B0F17` dengan teks putih kristal dan aksen *amber-yellow* `#F59E0B` untuk ruby text, meminimalkan kelelahan mata (*eye fatigue*) di dalam ruangan studio gelap.
2. **High-Contrast Green Screen Mode:** Latar belakang hitam dengan teks hijau neon `#10B981` untuk keterbacaan ekstra tinggi dari jarak 2 - 3 meter.
3. **Warm Paper Sepia:** Latar hangat `#FBF7EE` dengan teks abu gelap untuk mode santai di siang hari.
4. **Desain Kontrol Mengambang (Floating Glass Bar):** Panel kontrol transparan (*frosted glass*) di bagian bawah layar yang otomatis memudar (*auto-hide*) ketika prompter sedang berjalan, sehingga pandangan pengguna tidak terhalang.

---

## 7. Skema Data & Spesifikasi Antarmuka (TypeScript Interfaces)

```typescript
export interface RubyToken {
  text: string;         // Karakter utama (misal: "咖啡", "私", "안녕하세요", "Здравствуйте")
  reading: string;      // Fonetik atas (misal: "kāfēi", "わたし", "an-nyeong-ha-se-yo", "Zdrást-vuy-te")
  meaning?: string;     // Terjemahan singkat per kata
}

export interface ScriptLine {
  speaker?: string;     // Nama pembicara (misal: "Pelayan", "Pelanggan", "Presenter")
  tokens: RubyToken[];  // Kumpulan kata bertingkat
  fullTranslation?: string; // Terjemahan satu baris utuh
  notes?: string;       // Catatan aksentuasi atau nada
}

export interface PrompterScript {
  id: string;
  title: string;
  language: string;     // "Mandarin Chinese" | "Japanese" | "Korean" | "Russian" | dll
  languageCode: string; // "zh-CN" | "ja-JP" | "ko-KR" | "ru-RU"
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
  mainFontSize: number;      // 24 - 96 px
  readingFontSize: number;   // 12 - 44 px
  speed: number;             // 1 - 10
  mirrorHorizontal: boolean;
  mirrorVertical: boolean;
  showRuby: boolean;
  showTranslation: boolean;
  showFocusGuide: boolean;
  theme: 'studio-dark' | 'neon-green' | 'warm-sepia';
  cameraOverlay: boolean;
}
```

---

## 8. Persyaratan Non-Fungsional (NFR)

1. **Performa Tampilan & Latensi:**
   - Animasi *smooth scrolling* harus menjaga kecepatan 60 fps stabil tanpa jitter pada resolusi layar hingga 4K.
   - Respon API Gemini untuk pembuatan naskah baru berkisar antara 2-4 detik dengan indikator animasi pemuatan yang informatif.
2. **Aksesibilitas (WCAG 2.1 AA):**
   - Rasio kontras teks minimum 4.5:1 untuk teks biasa dan 7:1 untuk teks studio teleprompter.
   - Seluruh kontrol pemutar dapat diakses penuh melalui keyboard shortcut.
3. **Privasi & Keamanan Data:**
   - Umpan kamera dan mikrofon diproses secara 100% lokal di browser pengguna (*client-side MediaStream*), tidak pernah diunggah ke server mana pun.
   - Kunci API Gemini disimpan aman di server-side environment (`process.env.GEMINI_API_KEY`) dan tidak pernah terekspos ke bundle browser client.

---

## 9. Roadmap Pengembangan & Implementasi

| Fase | Durasi | Milestone & Deliverable |
|---|---|---|
| **Fase 1: MVP Core (Rilis Saat Ini)** | Selesai | Teleprompter engine dual-tier font (main + ruby), kontrol ukuran font terpisah, pemilih bahasa (Mandarin, Jepang, Korea, Rusia), integrasi Gemini 3.8 Flash untuk dialog & bacaan, upload dokumen, Web Speech TTS, dan Mirror mode. |
| **Fase 2: Studio Video & Advanced Speech** | +3 Minggu | Perekaman video lokal (.webm) dengan sinkronisasi prompter, evaluasi pengucapan otomatis (*speech-to-text accuracy scoring*), dan ekspor naskah ke PDF beranotasi. |
| **Fase 3: Multi-device & Remote Control** | +5 Minggu | WebRTC Remote Control via smartphone (mengontrol jalannya prompter laptop/tablet dari ponsel pintar via QR Code), sinkronisasi awan akun pengguna. |

---
*Dokumen ini merupakan panduan implementasi resmi untuk tim engineering dan produk.*
