## Flash Cards App (React + TypeScript + Tailwind)

Minimal flashcards web app with an SM-2–style spaced repetition scheduler and simple card management. Built with React, TypeScript, Vite, and Tailwind CSS.

### Features
- Local cards with management UI (Add/Manage)
  - Add Card modal: enter bold word (target learning word), sentence with the word, translation of the sentence
  - Manage modal: edit/delete existing cards
  - Formatting: convert lines of sentences to Bullet/Number lists
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

### Install & Run
```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

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
- `src/components/Flashcard.tsx`: flip card UI
- `src/components/CardManager.tsx`: manage modal (edit/delete, list helpers, due preview)
- `src/components/AddCardModal.tsx`: add modal (generate, list helpers)
- `src/hooks/useFlashcardQueue.ts`: SRS-driven study queue
- `src/index.css`: flip animation styles
