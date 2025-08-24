export interface CardData {
	id: string;
	sentence: string;
	boldWord: string;
	translation: string;
}

// SM-2-like spaced repetition state per card
export interface SrsState {
	cardId: string;
	easeFactor: number; // EF ≥ 1.3
	intervalDays: number; // last interval in days
	repetition: number; // successful reviews streak
	dueAt: number; // epoch ms when due
	lapses: number; // total lapses
	status: 'new' | 'learning' | 'review' | 'relearning';
}

export type Rating = 'again' | 'good';

export interface SrsConfig {
	minEaseFactor: number; // 1.3
	goodBonus: number; // 1.3
	learningAgainDelaySeconds: number; // short delay for Again in learning/relearning
	initialGoodIntervalDays: number; // graduation interval for Good
}

export const defaultSrsConfig: SrsConfig = {
	minEaseFactor: 1.3,
	goodBonus: 1.15,
	learningAgainDelaySeconds: 30,
	initialGoodIntervalDays: 2,
};

export interface SrsProgressIndex {
	[cardId: string]: SrsState;
}

export function createInitialSrsState(cardId: string, now: number): SrsState {
	return {
		cardId,
		easeFactor: 2.5,
		intervalDays: 0,
		repetition: 0,
		dueAt: now,
		lapses: 0,
		status: 'new',
	};
}

export function sm2UpdateEaseFactor(previousEase: number, quality: number, minEase: number): number {
	// SM-2 formula: EF' = EF + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
	const diff = 5 - quality;
	const next = previousEase + 0.1 - diff * (0.08 + diff * 0.02);
	return Math.max(minEase, Math.round(next * 100) / 100);
}

function addDays(baseMs: number, days: number): number {
	return baseMs + Math.round(days * 24 * 60 * 60 * 1000);
}

function addSeconds(baseMs: number, seconds: number): number {
	return baseMs + seconds * 1000;
}

export function rateSrs(state: SrsState, rating: Rating, now: number, config: SrsConfig = defaultSrsConfig): SrsState {
	const qualityMap: Record<Rating, number> = { again: 0, good: 5 };
	const q = qualityMap[rating];
	const nextEase = sm2UpdateEaseFactor(state.easeFactor, q, config.minEaseFactor);

	// New/Learning/Relearning: use short delay for Again, graduate on Good
	if (state.repetition === 0 || state.status === 'learning' || state.status === 'relearning') {
		if (rating === 'again') {
			return {
				...state,
				easeFactor: nextEase,
				dueAt: addSeconds(now, config.learningAgainDelaySeconds),
				status: state.repetition === 0 ? 'learning' : 'relearning',
			};
		}
		// Good: graduate
		const initialDays = config.initialGoodIntervalDays;
		return {
			...state,
			easeFactor: nextEase,
			repetition: 1,
			intervalDays: initialDays,
			dueAt: addDays(now, initialDays),
			status: 'review',
		};
	}

	// Review: Again lapses; Good extends interval
	if (rating === 'again') {
		return {
			...state,
			easeFactor: nextEase,
			repetition: 0,
			intervalDays: 0,
			dueAt: addSeconds(now, config.learningAgainDelaySeconds),
			lapses: state.lapses + 1,
			status: 'relearning',
		};
	}

	const nextIntervalDays = Math.max(1, Math.round(state.intervalDays * nextEase * config.goodBonus));
	return {
		...state,
		easeFactor: nextEase,
		repetition: state.repetition + 1,
		intervalDays: nextIntervalDays,
		dueAt: addDays(now, nextIntervalDays),
		status: 'review',
	};
}

export function reconcileProgress(cards: CardData[], existing: SrsProgressIndex | undefined, now: number): SrsProgressIndex {
	const result: SrsProgressIndex = {};
	const existingMap = existing ?? {};
	for (const card of cards) {
		const prev = existingMap[card.id];
		result[card.id] = prev ? prev : createInitialSrsState(card.id, now);
	}
	return result;
}

export function getDueCards(cards: CardData[], progress: SrsProgressIndex, now: number): CardData[] {
	const due = cards.filter((c) => (progress[c.id]?.dueAt ?? 0) <= now);
	due.sort((a, b) => (progress[a.id].dueAt - progress[b.id].dueAt));
	return due;
}
