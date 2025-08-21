export interface CardData {
	id: string;
	sentence: string;
	boldWord: string;
	translation: string;
}

export interface CardProgress {
	card: CardData;
	successCount: number;
}

export function initializeQueue(cards: CardData[]): CardProgress[] {
	return cards.map((card) => ({ card, successCount: 0 }));
}

export function scheduleAgain(queue: CardProgress[]): CardProgress[] {
	if (queue.length === 0) return [];
	const [current, ...rest] = queue;
	if (rest.length < 2) {
		return [...rest, current];
	}
	const insertionIndex = 2;
	return [...rest.slice(0, insertionIndex), current, ...rest.slice(insertionIndex)];
}

export function scheduleGotIt(queue: CardProgress[]): CardProgress[] {
	if (queue.length === 0) return [];
	const [current, ...rest] = queue;
	const updated: CardProgress = {
		...current,
		successCount: current.successCount + 1,
	};
	if (updated.successCount >= 2) {
		return rest;
	}
	return [...rest, updated];
}


