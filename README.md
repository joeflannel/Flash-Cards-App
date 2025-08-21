## Flash Cards App (React + TypeScript + Tailwind)

Minimal flashcards web app with a built-in spaced repetition-like scheduler. Uses React, TypeScript, Vite, and Tailwind CSS.

### Features
- Fixed set of 10 pre-defined cards
- Front: sentence with one word in bold; Back: translation
- Click card to flip; after flip choose: Again or Got it
- Scheduling:
  - Again: reinsert 2 positions later (no increment)
  - Got it: increment successCount; if < 2 → move to end; if ≥ 2 → remove from session
- Session ends when queue is empty
- Counter of remaining cards
- Smooth flip animation
- Clean UI with Tailwind

### Requirements
- Node.js ≥ 18

### Install & Run
```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

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
- `src/data/cards.ts`: predefined cards
- `src/utils/scheduler.ts`: queue manipulation
- `src/components/Flashcard.tsx`: flip card UI
- `src/App.tsx`: app state and controls
- `src/hooks/useFlashcardQueue.ts`: encapsulated queue state/actions
