import React from 'react';
import type { CardData, Rating, SrsProgressIndex } from '../utils/scheduler';
import { getDueCards, rateSrs, reconcileProgress, defaultSrsConfig } from '../utils/scheduler';

export interface UseFlashcardQueue {
	current: { card: CardData } | null;
	remaining: number;
	isFlipped: boolean;
	flip: () => void;
	rate: (rating: Rating) => void;
	restart: () => void;
}

export function useFlashcardQueue(initialCards: CardData[]): UseFlashcardQueue {
	const [cards, setCards] = React.useState<CardData[]>(initialCards);
	const [progress, setProgress] = React.useState<SrsProgressIndex>(() => {
		const now = Date.now();
		try {
			const raw = window.localStorage.getItem('flashcards.srs');
			const parsed = raw ? (JSON.parse(raw) as SrsProgressIndex) : undefined;
			return reconcileProgress(initialCards, parsed, now);
		} catch {
			return reconcileProgress(initialCards, undefined, now);
		}
	});
	const [isFlipped, setIsFlipped] = React.useState(false);

	const now = Date.now();
	const due = React.useMemo(() => getDueCards(cards, progress, now), [cards, progress, now]);
	const current = due[0] ? { card: due[0] } : null;
	const remaining = due.length;

	const flip = React.useCallback(() => {
		setIsFlipped((prev) => !prev);
	}, []);

	const rate = React.useCallback((rating: Rating) => {
		setProgress((prev) => {
			const nowTs = Date.now();
			const currentCard = getDueCards(cards, prev, nowTs)[0];
			if (!currentCard) return prev;
			const s = prev[currentCard.id];
			const updated = rateSrs(s, rating, nowTs, defaultSrsConfig);
			const next = { ...prev, [currentCard.id]: updated };
			try { window.localStorage.setItem('flashcards.srs', JSON.stringify(next)); } catch {}
			return next;
		});
		setIsFlipped(false);
	}, [cards]);

	const restart = React.useCallback(() => {
		const nowTs = Date.now();
		setProgress(reconcileProgress(cards, undefined, nowTs));
		setIsFlipped(false);
		try { window.localStorage.removeItem('flashcards.srs'); } catch {}
	}, [cards]);

	// Reconcile on cards prop change
	React.useEffect(() => {
		setCards(initialCards);
		const nowTs = Date.now();
		setProgress((prev) => reconcileProgress(initialCards, prev, nowTs));
		setIsFlipped(false);
	}, [initialCards]);

	return { current, remaining, isFlipped, flip, rate, restart };
}


