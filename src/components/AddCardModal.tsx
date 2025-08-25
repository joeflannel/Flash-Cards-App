import React from 'react';
import { aiService } from '../utils/aiService';

export interface AddCardModalProps {
	onClose: () => void;
	onCreate: (data: { sentence: string; boldWord: string; translation: string }) => void;
}

interface FormState {
	sentence: string;
	boldWord: string;
	translation: string;
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
	const [targetLanguage, setTargetLanguage] = React.useState('Spanish');
	const [currentModel, setCurrentModel] = React.useState(aiService.getCurrentModel());


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
		if (!aiService.isReady()) { setError('HuggingFace API key not configured'); return; }
		
		setError(null);
		setGenerating(true);
		try {
			const result = await aiService.generateSentence(form.boldWord, targetLanguage);
			setForm((prev) => ({ ...prev, sentence: result.sentence, translation: result.translation }));
		} catch (error) {
			setError('Failed to generate sentence. Please check your HuggingFace API key and try again.');
			console.error('AI generation failed:', error);
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
		<>
			<div className="fixed inset-0 z-50">
				<div className="absolute inset-0 bg-black/50" onClick={onClose} />
				<div className="relative z-10 w-full max-w-3xl mx-auto mt-16 px-4">
					<div className="rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-4 md:p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Add new card</h3>
							<div className="flex items-center gap-2">
								<button onClick={onClose} className="px-2 py-1 rounded-md text-sm font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Close</button>
							</div>
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
								
								{/* AI Generation Controls */}
								<div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="flex-1">
											<label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Target Language</label>
											<select 
												value={targetLanguage} 
												onChange={(e) => setTargetLanguage(e.target.value)}
												className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
											>
												<option value="Spanish">Spanish</option>
												<option value="French">French</option>
												<option value="German">German</option>
												<option value="Italian">Italian</option>
												<option value="Portuguese">Portuguese</option>
												<option value="Japanese">Japanese</option>
												<option value="Korean">Korean</option>
												<option value="Chinese">Chinese</option>
											</select>
										</div>
										<div className="flex-1">
											<label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">AI Model</label>
											<select 
												value={currentModel} 
												onChange={(e) => {
													const newModel = e.target.value;
													if (aiService.setModel(newModel)) {
														setCurrentModel(newModel);
													}
												}}
												className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
											>
												{aiService.getAvailableModels().map((model) => (
													<option key={model.name} value={model.name}>
														{model.name} {model.isFree ? '(Free)' : ''}
													</option>
												))}
											</select>
										</div>
									</div>
									
									<div className="flex gap-2">
										<button 
											type="button" 
											onClick={handleGenerate} 
											disabled={isGenerating} 
											className="flex-1 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
										>
											{isGenerating ? '🤖 Generating...' : '🚀 Generate sentence + translation'}
										</button>
										<button 
											type="button" 
											onClick={async () => {
												try {
													const isConnected = await aiService.testConnection();
													if (isConnected) {
														setError(null);
														alert('✅ Connection successful! API key is working.');
													} else {
														setError('❌ Connection failed. Please check your API key and internet connection.');
													}
												} catch (error) {
													setError('❌ Connection test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
												}
											}}
											className="px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-500"
										>
											🔗 Test
										</button>
									</div>
									
									{!aiService.isReady() && (
										<div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
											⚠️ HuggingFace API key not configured - add VITE_HUGGINGFACE_API_KEY to your .env file
										</div>
									)}
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
		</>
	);
};

export default AddCardModal;


