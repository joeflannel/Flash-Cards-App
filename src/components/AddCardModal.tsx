import React from 'react';

export interface AddCardModalProps {
	onClose: () => void;
	onCreate: (data: { sentence: string; boldWord: string; translation: string }) => void;
}

interface FormState {
	sentence: string;
	boldWord: string;
	translation: string;
}

function generateFromWord(word: string): { sentence: string; translation: string } {
	const w = word.trim();
	if (!w) return { sentence: '', translation: '' };
	const sentence = `Por favor, usa la palabra "${w}" en una oración.`;
	const translation = `Please use the word "${w}" in a sentence.`;
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

export const AddCardModal: React.FC<AddCardModalProps> = ({ onClose, onCreate }) => {
	const [form, setForm] = React.useState<FormState>({ sentence: '', boldWord: '', translation: '' });
	const [error, setError] = React.useState<string | null>(null);
	const [isGenerating, setGenerating] = React.useState(false);
	const [activeField, setActiveField] = React.useState<'sentence' | 'translation'>('sentence');

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	function splitSentencesSmart(text: string): string[] {
		if (text.includes('\n')) {
			return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
		}
		const parts = text
			.replace(/\s+/g, ' ')
			.split(/(?<=[\.!?])\s+/)
			.map((s) => s.trim())
			.filter(Boolean);
		return parts.length > 1 ? parts : [text.trim()].filter(Boolean);
	}

	function formatBulleted(text: string): string {
		const lines = cleanLines(text).length ? cleanLines(text) : splitSentencesSmart(text);
		if (lines.length === 0) return '';
		return lines.map((l) => `• ${l}`).join('\n');
	}

	function formatNumbered(text: string): string {
		const lines = cleanLines(text).length ? cleanLines(text) : splitSentencesSmart(text);
		if (lines.length === 0) return '';
		return lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
	}

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
		if (!form.sentence.trim()) { setError('Sentence is required'); return; }
		if (!form.boldWord.trim()) { setError('Bold word is required'); return; }
		if (!form.translation.trim()) { setError('Translation is required'); return; }
		onCreate({ sentence: form.sentence, boldWord: form.boldWord, translation: form.translation });
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="relative z-10 w-full max-w-3xl mx-auto mt-16 px-4">
				<div className="rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-4 md:p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold">Add new card</h3>
						<button onClick={onClose} className="px-2 py-1 rounded-md text-sm font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Close</button>
					</div>
					<form onSubmit={handleSubmit} className="space-y-3">
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={() => setForm((p) => {
									const text = activeField === 'sentence' ? p.sentence : p.translation;
									const updated = formatBulleted(text);
									return activeField === 'sentence' ? { ...p, sentence: updated } : { ...p, translation: updated };
								})}
								className="px-3 py-1.5 rounded-md text-xs font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
							>
								Bullet list
							</button>
							<button
								type="button"
								onClick={() => setForm((p) => {
									const text = activeField === 'sentence' ? p.sentence : p.translation;
									const updated = formatNumbered(text);
									return activeField === 'sentence' ? { ...p, sentence: updated } : { ...p, translation: updated };
								})}
								className="px-3 py-1.5 rounded-md text-xs font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
							>
								Number list
							</button>
						</div>
						{error && <div className="text-sm text-rose-600">{error}</div>}
						<div className="space-y-1">
							<label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Sentence</label>
							<textarea name="sentence" value={form.sentence} onChange={handleChange} onFocus={() => setActiveField('sentence')} rows={3} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm" />
						</div>
						<div className="space-y-1">
							<label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Bold word</label>
							<input name="boldWord" value={form.boldWord} onChange={handleChange} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm" />
							<div>
								<button type="button" onClick={handleGenerate} disabled={isGenerating} className="mt-2 px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60">{isGenerating ? 'Generating…' : 'Generate sentence + translation'}</button>
							</div>
						</div>
						<div className="space-y-1">
							<label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Translation</label>
							<textarea name="translation" value={form.translation} onChange={handleChange} onFocus={() => setActiveField('translation')} rows={2} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm" />
						</div>
						<div className="flex items-center gap-2 pt-1">
							<button type="submit" className="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500">Add card</button>
							<button type="button" onClick={onClose} className="px-3 py-1.5 rounded-md text-sm font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AddCardModal;


