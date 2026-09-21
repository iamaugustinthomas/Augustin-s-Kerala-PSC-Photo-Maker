# Kerala PSC Exam Photo Maker

A privacy-focused, client-side web application designed to create official passport photographs conforming strictly to **Kerala Public Service Commission (Kerala PSC) One Time Registration (OTR)** guidelines and other government examination portals (SSC, State PSCs, UPSC).

![Chef Hat Logo](public/favicon.svg)

---

## Key Features

- **Strict Kerala PSC Dimensions**: Generates photos with exact **150 × 200 pixels** (width × height).
- **Strict File Size Compliance**: Automatically optimizes compression to ensure output is guaranteed **under 30 KB** (typically 18–28 KB) in standard **JPEG / JPG** format.
- **Candidate Name & Date Stamp**: Automatically embeds candidate's full name in uppercase and the date the photograph was taken in black text over a clean white bottom strip.
- **Interactive Photo Framing**:
  - Drag to position and center your face and shoulders.
  - Smooth zoom controls (in, out, reset).
  - 90-degree photo rotation.
  - Proportional face alignment guide overlay to follow the ~70% face height guideline.
  - Toggle between **1× Actual Size** and **1.5× Zoomed View**.
- **Multiple Input Methods**:
  - Upload existing photo files (JPG, JPEG, PNG, WEBP) with drag-and-drop.
  - Live **Web Camera Capture** with head alignment guide oval, countdown timer, and front/back camera switching.
  - Sample template for quick testing.
- **Instant Output & Export**:
  - One-click `.jpg` download ready for portal upload.
  - Copy directly to clipboard.
  - Printable **8-Photo Sheet** formatted for standard 4×6 inch photo paper.
- **100% Client-Side & Private**: All image processing runs locally in the browser via the HTML5 Canvas API. No images are uploaded to any server or external cloud storage.

---

## Official Kerala PSC Photo Requirements

| Parameter | Kerala PSC Requirement | App Default |
| :--- | :--- | :--- |
| **Dimensions** | 150 px (W) × 200 px (H) | Exactly 150 × 200 px |
| **File Format** | JPG / JPEG | JPEG (`image/jpeg`) |
| **File Size** | Maximum 30 KB | Optimized under 30 KB |
| **Bottom Strip** | Candidate Name & Photo Date | Crisp white bar with black text |
| **Date Format** | DD-MM-YYYY or DD/MM/YYYY | Configurable date formats |

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Canvas Processing**: Native HTML5 Canvas 2D API with binary search JPEG compression

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/iamaugustinthomas/Augustin-s-KERALA-PSC-Photo-Maker.git
   cd Augustin-s-KERALA-PSC-Photo-Maker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port indicated in your terminal).

---

## Building for Production

To create an optimized production build:

```bash
npm run build
```

The output files will be created in the `dist/` directory, ready to be hosted on any static hosting provider (Vercel, Netlify, GitHub Pages, Cloudflare Pages, Firebase Hosting, etc.).

### Deploying to Vercel

This repository is pre-configured for zero-config Vercel deployment:
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install` (with `.npmrc` handling peer dependencies)

---

## Project Structure

```text
├── public/
│   └── favicon.svg           # Chef Hat vector favicon and app icon
├── src/
│   ├── components/
│   │   ├── CameraCaptureModal.tsx  # Live webcam capture with alignment oval
│   │   ├── PhotoEditor.tsx         # Interactive pan/zoom viewport
│   │   └── PrintSheetModal.tsx     # 8-copy 4x6 inch printable sheet
│   ├── utils/
│   │   └── photoCanvas.ts          # Core 150x200 canvas rendering & size optimization
│   ├── App.tsx                     # Main application layout and state
│   ├── types.ts                    # TypeScript definitions
│   └── main.tsx                    # React application entry point
├── index.html                      # HTML entry point with SEO & OpenGraph tags
├── package.json
└── vite.config.ts
```

---

## License

MIT License. Free to use for personal, educational, and public service examination purposes.
