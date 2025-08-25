## Flash Cards App (React + TypeScript + Tailwind)

Minimal flashcards web app with an SM-2–style spaced repetition scheduler and simple card management. Built with React, TypeScript, Vite, and Tailwind CSS.

### Features
- Local cards with management UI (Add/Manage)
  - Add Card modal: enter bold word (target learning word), sentence with the word, translation of the sentence
  - Manage modal: edit/delete existing cards
  - Formatting: convert lines of sentences to Bullet/Number lists
- **NEW: AI-Powered Sentence Generation**
  - Generate contextual sentences using OpenAI GPT API
  - Bulk import words and auto-generate sentences for multiple words at once
  - Support for multiple languages (Spanish/English by default)
- Study flow
  - Front: sentence with one word in bold; Back: translation
  - Click the card to flip; rate with: Again or Good
  - Remaining counter shown under the card
  - Session page shows “No cards are due right now. Come back later.”
- SRS (Spaced Repetition System)
  - Ratings: Again or Good
  - Learning Again delay: 30s; Good graduation: 2 days; Good growth bonus: 1.15
  - Progress persists in localStorage under `flashcards.srs`
- Smooth flip animation (250ms)
- Tailwind-based UI

### Requirements
- Node.js ≥ 18
- Hugging Face API key (optional, for AI-powered sentence generation - completely free!)

### Install & Run
```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

### AI-Powered Sentence Generation Setup (Optional)

To enable AI-powered sentence generation:

1. Get a **free** Hugging Face API key from [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a `.env` file in the project root:
   ```bash
   VITE_HUGGINGFACE_API_KEY=your_actual_api_key_here
   ```
3. Restart the development server

**Note:** Without an API key, the AI generation feature will be disabled and you'll need to manually enter sentences and translations. The Hugging Face API is completely free with no usage limits!

### One-click server scripts (Windows)
- Start (double-click): `scripts/start-dev.bat`
- Start (PowerShell): `./scripts/start-dev.ps1 -Port 5173 -HostAddress 127.0.0.1`
- Stop: `scripts/stop-dev.bat` or `./scripts/stop-dev.ps1`
- Create desktop shortcut: `./scripts/create-desktop-shortcut.ps1`
- Auto-start on login: `./scripts/enable-autostart.ps1` (disable with `./scripts/disable-autostart.ps1`)

If PowerShell blocks scripts, run once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser Bypass -Force
```

### Build
```bash
npm run build
npm run preview
```

### Test
```bash
npm run test
```

### Structure
- `src/data/cards.ts`: seed cards
- `src/utils/scheduler.ts`: SRS state and rating (`again` | `good`), progress reconciliation, due selection
- `src/utils/aiService.ts`: Hugging Face API integration for sentence generation (free!)

- `src/components/Flashcard.tsx`: flip card UI
- `src/components/CardManager.tsx`: manage modal (edit/delete, list helpers, due preview)
- `src/components/AddCardModal.tsx`: add modal (generate, list helpers, AI-powered generation)
- `src/components/BulkWordImporter.tsx`: bulk word import with sentence generation
- `src/hooks/useFlashcardQueue.ts`: SRS-driven study queue
- `src/index.css`: flip animation styles
