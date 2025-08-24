import { describe, it, expect } from 'vitest';
import {
	type CardData,
	type SrsProgressIndex,
	type Rating,
	reconcileProgress,
	getDueCards,
	rateSrs,
	defaultSrsConfig,
} from './scheduler';

const sampleCards: CardData[] = [
	{ id: '1', sentence: 'A', boldWord: 'A', translation: 'A' },
	{ id: '2', sentence: 'B', boldWord: 'B', translation: 'B' },
	{ id: '3', sentence: 'C', boldWord: 'C', translation: 'C' },
	{ id: '4', sentence: 'D', boldWord: 'D', translation: 'D' },
];

describe('scheduler SRS', () => {
	it('reconcileProgress initializes SRS for all cards', () => {
		const now = Date.now();
		const progress: SrsProgressIndex = reconcileProgress(sampleCards, undefined, now);
		expect(Object.keys(progress)).toHaveLength(4);
		const due: CardData[] = getDueCards(sampleCards, progress, now);
		expect(due.map((c: CardData) => c.id)).toEqual(['1', '2', '3', '4']);
	});

	it('rating again delays current card and next becomes due', () => {
		let now = Date.now();
		let progress: SrsProgressIndex = reconcileProgress(sampleCards, undefined, now);
		let due: CardData[] = getDueCards(sampleCards, progress, now);
		expect(due[0]?.id).toBe('1');

		const first: CardData = due[0] as CardData;
		const state = progress[first.id];
		progress = { ...progress, [first.id]: rateSrs(state, 'again' as Rating, now, defaultSrsConfig) };

		now = now + 1;
		due = getDueCards(sampleCards, progress, now);
		expect(due[0]?.id).toBe('2');
	});

	it('rating good graduates with interval and future due date', () => {
		const now = Date.now();
		let progress: SrsProgressIndex = reconcileProgress(sampleCards.slice(0, 1), undefined, now);
		const card: CardData = sampleCards[0];
		const state = progress[card.id];
		const after = rateSrs(state, 'good' as Rating, now, defaultSrsConfig);
		expect(after.repetition).toBeGreaterThanOrEqual(1);
		expect(after.intervalDays).toBeGreaterThanOrEqual(1);
		expect(after.dueAt).toBeGreaterThan(now);
	});
});


