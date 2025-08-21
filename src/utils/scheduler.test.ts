import { describe, it, expect } from 'vitest';
import { initializeQueue, scheduleAgain, scheduleGotIt, type CardData } from './scheduler';

const sampleCards: CardData[] = [
	{ id: '1', sentence: 'A', boldWord: 'A', translation: 'A' },
	{ id: '2', sentence: 'B', boldWord: 'B', translation: 'B' },
	{ id: '3', sentence: 'C', boldWord: 'C', translation: 'C' },
	{ id: '4', sentence: 'D', boldWord: 'D', translation: 'D' },
];

describe('scheduler', () => {
	it('initializeQueue sets successCount to 0', () => {
		const q = initializeQueue(sampleCards);
		expect(q).toHaveLength(4);
		expect(q.every((cp) => cp.successCount === 0)).toBe(true);
	});

	it('Again reinserts current 2 positions later when possible', () => {
		const q = initializeQueue(sampleCards);
		const after = scheduleAgain(q);
		// Expected: B, C, A, D
		expect(after.map((c) => c.card.id)).toEqual(['2', '3', '1', '4']);
	});

	it('Again appends to end if fewer than 2 cards remain', () => {
		const small = initializeQueue(sampleCards.slice(0, 2)); // [1,2]
		const afterSmall = scheduleAgain(small);
		// Expected: 2,1
		expect(afterSmall.map((c) => c.card.id)).toEqual(['2', '1']);

		const single = initializeQueue(sampleCards.slice(0, 1)); // [1]
		const afterSingle = scheduleAgain(single);
		// Expected: still [1] → but as append semantics
		expect(afterSingle.map((c) => c.card.id)).toEqual(['1']);
	});

	it('Got it increments and moves to end when successCount < 2', () => {
		const q = initializeQueue(sampleCards);
		const after = scheduleGotIt(q);
		expect(after).toHaveLength(4);
		expect(after[after.length - 1].card.id).toBe('1');
		expect(after[after.length - 1].successCount).toBe(1);
	});

	it('Got it removes card once successCount reaches 2', () => {
		let q = initializeQueue(sampleCards.slice(0, 1)); // [1]
		q = scheduleGotIt(q); // success 1 → back to end (still only one)
		q = scheduleGotIt(q); // success 2 → removed
		expect(q).toHaveLength(0);
	});
});


