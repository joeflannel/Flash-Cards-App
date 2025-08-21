import React from 'react';
import { Flashcard } from './components/Flashcard';
import { cards } from './data/cards';
import { useFlashcardQueue } from './hooks/useFlashcardQueue';

export default function App(): JSX.Element {
	const { current, remaining, isFlipped, flip, again, gotIt, restart } = useFlashcardQueue(cards);

	return (
		<div className="min-h-screen flex flex-col">
			<header className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800">
				<div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
					<h1 className="text-xl font-semibold tracking-tight">Flash Cards</h1>
					<div className="text-sm text-slate-600 dark:text-slate-300">Remaining: <span className="font-medium">{remaining}</span></div>
				</div>
			</header>

			<main className="flex-1 px-4 sm:px-6 py-8">
				<div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
					{current ? (
						<>
							<Flashcard
								sentence={current.card.sentence}
								boldWord={current.card.boldWord}
								translation={current.card.translation}
								isFlipped={isFlipped}
								onClick={flip}
							/>
							{isFlipped && (
								<div className="flex items-center gap-3">
									<button
										onClick={again}
										className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm ring-1 ring-slate-300 dark:ring-slate-700 bg-white text-slate-900 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100"
									>
										Again
									</button>
									<button
										onClick={gotIt}
										className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
									>
										Got it
									</button>
								</div>
							)}
						</>
					) : (
						<div className="w-full max-w-xl text-center">
							<div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 bg-white dark:bg-slate-800 shadow-sm">
								<h2 className="text-2xl font-semibold mb-2">Session complete</h2>
								<p className="text-slate-600 dark:text-slate-300 mb-6">All cards reached two successes. Great job!</p>
								<button onClick={restart} className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Restart</button>
							</div>
						</div>
					)}
				</div>
			</main>

			<footer className="px-4 sm:px-6 py-6 text-center text-xs text-slate-500">
				Built with React, TypeScript, and Tailwind CSS
			</footer>
		</div>
	);
}


