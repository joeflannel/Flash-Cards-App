import React from 'react';
import { Flashcard } from './components/Flashcard';
import { cards as defaultCards } from './data/cards';
import { useFlashcardQueue } from './hooks/useFlashcardQueue';
import type { CardData } from './utils/scheduler';
import { CardManager } from './components/CardManager';
import { AddCardModal } from './components/AddCardModal';
import { BulkWordImporter } from './components/BulkWordImporter';
import { ModelSelector } from './components/ModelSelector';

function useLocalStorageCards(key: string, initial: CardData[]): [CardData[], React.Dispatch<React.SetStateAction<CardData[]>>] {
    const [state, setState] = React.useState<CardData[]>(() => {
        try {
            const raw = window.localStorage.getItem(key);
            if (!raw) return initial;
            const parsed = JSON.parse(raw) as CardData[];
            if (!Array.isArray(parsed)) return initial;
            return parsed;
        } catch {
            return initial;
        }
    });

    React.useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch {
            // ignore storage errors
        }
    }, [key, state]);

    return [state, setState];
}

export default function App(): JSX.Element {
	const [cards, setCards] = useLocalStorageCards('flashcards.cards', defaultCards);
	const { current, remaining, isFlipped, flip, rate } = useFlashcardQueue(cards);
	const [isManagerOpen, setManagerOpen] = React.useState(false);
	const [isAddOpen, setAddOpen] = React.useState(false);
	const [isBulkImporterOpen, setBulkImporterOpen] = React.useState(false);

	const handleCreate = React.useCallback((data: Omit<CardData, 'id'>) => {
		const newCard: CardData = {
			id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			...data,
		};
		setCards((prev) => [...prev, newCard]);
	}, []);

	const handleUpdate = React.useCallback((card: CardData) => {
		setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
	}, []);

	const handleDelete = React.useCallback((id: string) => {
		setCards((prev) => prev.filter((c) => c.id !== id));
	}, []);

	const handleResetDefaults = React.useCallback(() => {
		setCards(defaultCards);
	}, []);

	const handleBulkImport = React.useCallback((cards: Array<{ sentence: string; boldWord: string; translation: string }>) => {
		cards.forEach(card => handleCreate(card));
		setBulkImporterOpen(false);
	}, [handleCreate]);

	return (
		<div className="min-h-screen flex flex-col">
			<header className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800">
				<div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
					<h1 className="text-xl font-semibold tracking-tight">Flash Cards</h1>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setAddOpen(true)}
							className="px-3 py-1.5 rounded-md text-sm font-medium shadow-sm ring-1 ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
							aria-label="Add card"
						>
							+
						</button>
						<button
							onClick={() => setManagerOpen(true)}
							className="px-3 py-1.5 rounded-md text-sm font-medium shadow-sm ring-1 ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
						>
							Manage
						</button>
						<button
							onClick={() => setBulkImporterOpen(true)}
							className="px-3 py-1.5 rounded-md text-sm font-medium shadow-sm ring-1 ring-slate-300 dark:ring-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
						>
							Bulk Import
						</button>
					</div>
				</div>
			</header>

			<main className="flex-1 px-4 sm:px-6 py-8">
				<div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
					<ModelSelector />
					{current ? (
						<>
							<Flashcard
								sentence={current.card.sentence}
								boldWord={current.card.boldWord}
								translation={current.card.translation}
								isFlipped={isFlipped}
								onClick={flip}
							/>
							<div className="text-sm text-slate-600 dark:text-slate-300">Remaining: <span className="font-medium">{remaining}</span></div>
							{isFlipped && (
								<div className="flex items-center gap-3">
									<button onClick={() => rate('again')} className="px-3 py-2 rounded-lg text-sm font-medium shadow-sm ring-1 ring-slate-300 dark:ring-slate-700 bg-white text-slate-900 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100">Again</button>
									<button onClick={() => rate('good')} className="px-3 py-2 rounded-lg text-sm font-medium shadow-sm bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Good</button>
								</div>
							)}
						</>
					) : (
						<div className="w-full max-w-xl text-center">
							<div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 bg-white dark:bg-slate-800 shadow-sm">
								<h2 className="text-2xl font-semibold mb-2">Session complete</h2>
								<p className="text-slate-600 dark:text-slate-300">No cards are due right now. Come back later.</p>
							</div>
						</div>
					)}

					{/* Add Card Modal */}
					{isAddOpen && (
						<AddCardModal onClose={() => setAddOpen(false)} onCreate={(data) => { handleCreate(data); setAddOpen(false); }} />
					)}

					{/* Card Manager Modal */}
					{isManagerOpen && (
						<div className="fixed inset-0 z-50">
							<div className="absolute inset-0 bg-black/50" onClick={() => setManagerOpen(false)} />
							<div className="relative z-10 w-full max-w-3xl mx-auto mt-16 px-4">
								<div className="rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-4 md:p-6 max-h-[85vh] overflow-hidden">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold">Manage Cards</h3>
										<button onClick={() => setManagerOpen(false)} className="px-2 py-1 rounded-md text-sm font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Close</button>
									</div>
									<CardManager
										cards={cards}
										onCreate={handleCreate}
										onUpdate={handleUpdate}
										onDelete={handleDelete}
										onResetDefaults={handleResetDefaults}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Bulk Word Importer Modal */}
					{isBulkImporterOpen && (
						<BulkWordImporter
							onClose={() => setBulkImporterOpen(false)}
							onImport={handleBulkImport}
						/>
					)}
				</div>
			</main>
		</div>
	);
}


