import React from 'react';

export interface FlashcardProps {
	sentence: string;
	boldWord: string;
	translation: string;
	isFlipped: boolean;
	onClick: () => void;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlightedSentence(sentence: string, word: string): React.ReactNode {
	if (!word) return sentence;
	const pattern = new RegExp(`\\b(${escapeRegExp(word)})\\b`, 'i');
	const match = sentence.match(pattern);
	if (!match) return sentence;
	const index = match.index ?? 0;
	const before = sentence.slice(0, index);
	const found = sentence.slice(index, index + match[0].length);
	const after = sentence.slice(index + match[0].length);
	return (
		<span>
			{before}
			<strong className="font-semibold text-slate-900 dark:text-slate-100">{found}</strong>
			{after}
		</span>
	);
}

export const Flashcard: React.FC<FlashcardProps> = ({ sentence, boldWord, translation, isFlipped, onClick }) => {
	return (
		<div
			className={`flip-card ${isFlipped ? 'flipped' : ''} mx-auto`}
			style={{ width: 'min(90vw, 28rem)', height: 'min(60vh, 18rem)' }}
		>
			<div className="flip-card-inner relative w-full h-full">
				<button
					type="button"
					onClick={onClick}
					className="flip-card-face absolute inset-0 rounded-xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200 p-6 flex items-center justify-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
					aria-pressed={isFlipped}
				>
					<span className="text-xl md:text-2xl leading-relaxed">
						{renderHighlightedSentence(sentence, boldWord)}
					</span>
				</button>

				<button
					type="button"
					onClick={onClick}
					className="flip-card-face flip-card-back absolute inset-0 rounded-xl bg-slate-900 text-slate-50 shadow-xl ring-1 ring-slate-800 p-6 flex items-center justify-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
				>
					<span className="text-xl md:text-2xl leading-relaxed">{translation}</span>
				</button>
			</div>
		</div>
	);
};


