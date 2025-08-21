import React from 'react';
import type { CardData, CardProgress } from '../utils/scheduler';
import { initializeQueue, scheduleAgain, scheduleGotIt } from '../utils/scheduler';

export interface UseFlashcardQueue {
	current: CardProgress | null;
	remaining: number;
	isFlipped: boolean;
	flip: () => void;
	again: () => void;
	gotIt: () => void;
	restart: () => void;
}

export function useFlashcardQueue(initialCards: CardData[]): UseFlashcardQueue {
	const [queue, setQueue] = React.useState<CardProgress[]>(() => initializeQueue(initialCards));
	const [isFlipped, setIsFlipped] = React.useState(false);

	const current = queue[0] ?? null;
	const remaining = queue.length;

	const flip = React.useCallback(() => {
		setIsFlipped((prev) => !prev);
	}, []);

	const again = React.useCallback(() => {
		setQueue((q) => scheduleAgain(q));
		setIsFlipped(false);
	}, []);

	const gotIt = React.useCallback(() => {
		setQueue((q) => scheduleGotIt(q));
		setIsFlipped(false);
	}, []);

	const restart = React.useCallback(() => {
		setQueue(initializeQueue(initialCards));
		setIsFlipped(false);
	}, [initialCards]);

	return { current, remaining, isFlipped, flip, again, gotIt, restart };
}


