import React from 'react';
import type { CardData, SrsProgressIndex, SrsState } from '../utils/scheduler';

export interface CardManagerProps {
	cards: CardData[];
	onCreate: (data: Omit<CardData, 'id'>) => void;
	onUpdate: (card: CardData) => void;
	onDelete: (id: string) => void;
	onResetDefaults?: () => void;
}

interface FormState {
	sentence: string;
	boldWord: string;
	translation: string;
}

function generateFromWord(word: string): { sentence: string; translation: string } {
	const trimmed = word.trim();
	if (!trimmed) {
		return { sentence: '', translation: '' };
	}
	const sentence = `Por favor, usa la palabra "${trimmed}" en una oración.`;
	const translation = `Please use the word "${trimmed}" in a sentence.`;
	return { sentence, translation };
}

function stripListPrefix(line: string): string {
	return line
		.replace(/^\s*[•\-*–]\s+/, '')
		.replace(/^\s*\d+[\.)]\s+/, '')
		.trim();
}

function cleanLines(text: string): string[] {
	return text
		.split(/\r?\n/)
		.map((l) => stripListPrefix(l))
		.filter((l) => l.length > 0);
}

function formatBulleted(text: string): string {
	const lines = cleanLines(text);
	if (lines.length === 0) return '';
	return lines.map((l) => `• ${l}`).join('\n');
}

function formatNumbered(text: string): string {
	const lines = cleanLines(text);
	if (lines.length === 0) return '';
	return lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
}

export const CardManager: React.FC<CardManagerProps> = ({ cards, onCreate, onUpdate, onDelete, onResetDefaults }) => {
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [form, setForm] = React.useState<FormState>({ sentence: '', boldWord: '', translation: '' });
	const [error, setError] = React.useState<string | null>(null);
	const [isGenerating, setGenerating] = React.useState(false);
	const [activeField, setActiveField] = React.useState<'sentence' | 'translation'>('sentence');
    const [progress, setProgress] = React.useState<SrsProgressIndex>({});

	const isEditing = editingId !== null;

	const startEdit = React.useCallback((card: CardData) => {
		setEditingId(card.id);
		setForm({ sentence: card.sentence, boldWord: card.boldWord, translation: card.translation });
		setError(null);
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const validate = (): boolean => {
		if (!form.sentence.trim()) { setError('Sentence is required'); return false; }
		if (!form.boldWord.trim()) { setError('Bold word is required'); return false; }
		if (!form.translation.trim()) { setError('Translation is required'); return false; }
		setError(null);
		return true;
	};

	const handleGenerate = async () => {
		if (!form.boldWord.trim()) { setError('Enter a bold word to generate from'); return; }
		setError(null);
		setGenerating(true);
		try {
			const { sentence, translation } = generateFromWord(form.boldWord);
			setForm((prev) => ({ ...prev, sentence, translation }));
		} finally {
			setGenerating(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		if (isEditing && editingId) {
			const firstSentence = form.sentence.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0] ?? '';
			const firstTranslation = form.translation.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0] ?? '';
			onUpdate({ id: editingId, sentence: firstSentence, boldWord: form.boldWord, translation: firstTranslation });
		}
	};

	// Load SRS progress for preview badges
	React.useEffect(() => {
		try {
			const raw = window.localStorage.getItem('flashcards.srs');
			const parsed = raw ? (JSON.parse(raw) as SrsProgressIndex) : {};
			setProgress(parsed);
		} catch {
			setProgress({});
		}
	}, [cards]);

	function renderDaysLeft(cardId: string): string {
		const s: SrsState | undefined = progress[cardId];
		if (!s) return '0d';
		const now = Date.now();
		const msLeft = s.dueAt - now;
		const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
		return `${daysLeft}d`;
	}

	return (
		<div className="w-full max-w-5xl mx-auto p-[1px]">
			<div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 bg-white dark:bg-slate-900 shadow-sm">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Manage Cards</h2>
					<div className="flex items-center gap-2">
						{onResetDefaults && (
							<button type="button" onClick={onResetDefaults} className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">Reset defaults</button>
						)}
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-hidden">
					<div className="min-h-0">
						<ul className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[60vh] overflow-y-auto pr-2">
							{cards.map((c) => (
								<li key={c.id} className="py-3 flex items-start gap-3">
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{c.boldWord}</p>
										<p className="text-xs text-slate-600 dark:text-slate-300 truncate">{renderDaysLeft(c.id)}</p>
									</div>
									<div className="flex items-center gap-2">
										<button type="button" onClick={() => startEdit(c)} className="px-2 py-1 rounded-md text-xs font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Edit</button>
										<button type="button" onClick={() => onDelete(c.id)} className="px-2 py-1 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-500">Delete</button>
									</div>
								</li>
							))}
						</ul>
					</div>
					{isEditing && (
						<div className="min-h-0">
							<form onSubmit={handleSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
								<div className="flex flex-wrap items-center gap-2">
									<button type="button" onClick={() => setForm((p) => (activeField === 'sentence' ? { ...p, sentence: formatBulleted(p.sentence) } : { ...p, translation: formatBulleted(p.translation) }))} className="px-3 py-1.5 rounded-md text-xs font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Bullet list</button>
									<button type="button" onClick={() => setForm((p) => (activeField === 'sentence' ? { ...p, sentence: formatNumbered(p.sentence) } : { ...p, translation: formatNumbered(p.translation) }))} className="px-3 py-1.5 rounded-md text-xs font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Number list</button>
								</div>
								<h3 className="text-base font-medium">Edit selected card</h3>
								{error && <div className="text-sm text-rose-600">{error}</div>}
								<div className="space-y-1">
									<label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Sentence(s) (one per line)</label>
									<textarea name="sentence" value={form.sentence} onChange={handleChange} onFocus={() => setActiveField('sentence')} rows={5} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm" />
								</div>
								<div className="space-y-1">
									<label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Bold word</label>
									<input name="boldWord" value={form.boldWord} onChange={handleChange} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm" />
									<div>
										<button type="button" onClick={handleGenerate} disabled={isGenerating} className="mt-2 px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover.bg-slate-700 disabled:opacity-60">{isGenerating ? 'Generating…' : 'Generate sentence + translation'}</button>
									</div>
								</div>
								<div className="space-y-1">
									<label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Translation(s) (one or one per line)</label>
									<textarea name="translation" value={form.translation} onChange={handleChange} onFocus={() => setActiveField('translation')} rows={4} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm" />
								</div>
								<div className="flex items-center gap-2 pt-1">
									<button type="submit" className="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500">Save changes</button>
								</div>
							</form>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CardManager;


