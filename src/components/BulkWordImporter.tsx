import React from 'react';
import { aiService, GeneratedSentence } from '../utils/aiService';

export interface BulkWordImporterProps {
  onClose: () => void;
  onImport: (cards: Array<{ sentence: string; boldWord: string; translation: string }>) => void;
}

export const BulkWordImporter: React.FC<BulkWordImporterProps> = ({ onClose, onImport }) => {
  const [words, setWords] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedCards, setGeneratedCards] = React.useState<Array<{ sentence: string; boldWord: string; translation: string }>>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<{ current: number; total: number } | null>(null);

  const handleWordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWords(e.target.value);
    setError(null);
  };

  const parseWords = (text: string): string[] => {
    return text
      .split(/[\n,;]/)
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
  };

  	const handleGenerate = async () => {
		const wordList = parseWords(words);
		if (wordList.length === 0) {
			setError('Please enter at least one word');
			return;
		}

		if (!aiService.isReady()) {
			setError('Hugging Face API key not configured. Please add VITE_HUGGINGFACE_API_KEY to your .env file.');
			return;
		}

		setIsGenerating(true);
		setProgress({ current: 0, total: wordList.length });
		setError(null);

		try {
			const results = await aiService.generateMultipleSentences(wordList);
			
			const cards = results.map((result, index) => ({
				sentence: result.sentence,
				boldWord: wordList[index],
				translation: result.translation,
			}));

			setGeneratedCards(cards);
			setProgress(null);
		} catch (error) {
			setError(`Failed to generate sentences: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your Hugging Face API key and try again.`);
			setProgress(null);
		} finally {
			setIsGenerating(false);
		}
	};

  const handleImport = () => {
    if (generatedCards.length > 0) {
      onImport(generatedCards);
      onClose();
    }
  };

  const handleEditCard = (index: number, field: 'sentence' | 'translation', value: string) => {
    setGeneratedCards(prev => prev.map((card, i) => 
      i === index ? { ...card, [field]: value } : card
    ));
  };

  const handleRemoveCard = (index: number) => {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  };

  const wordCount = parseWords(words).length;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-8 px-4">
        <div className="rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-4 md:p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Bulk Import Words</h3>
            <button 
              onClick={onClose} 
              className="px-2 py-1 rounded-md text-sm font-medium ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            {/* Word Input Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Enter words (one per line, or separated by commas/semicolons)
              </label>
              <textarea
                value={words}
                onChange={handleWordsChange}
                rows={4}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm"
                placeholder="Enter words here...&#10;Example:&#10;casa&#10;perro&#10;libro"
              />
              <div className="text-xs text-slate-500">
                {wordCount} word{wordCount !== 1 ? 's' : ''} detected
              </div>
            </div>

            			{/* Generate Button */}
			<div className="flex items-center gap-3">
				<button
					onClick={handleGenerate}
					disabled={isGenerating || wordCount === 0}
					className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
				>
					{isGenerating ? 'Generating...' : `Generate Sentences (${wordCount} words)`}
				</button>
				
				{!aiService.isReady() && (
					<div className="text-xs text-amber-600 bg-amber-50 dark:amber-900/20 px-2 py-1 rounded">
						⚠️ Hugging Face API key not configured
					</div>
				)}
				
				{aiService.isReady() && (
					<div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
						✅ Free AI generation available
					</div>
				)}
			</div>

            {/* Progress Bar */}
            {progress && (
              <div className="space-y-2">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Generating sentences... {progress.current}/{progress.total}
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Generated Cards Preview */}
            {generatedCards.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium">Generated Cards ({generatedCards.length})</h4>
                  <button
                    onClick={handleImport}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-500"
                  >
                    Import All Cards
                  </button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {generatedCards.map((card, index) => (
                    <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-md p-3 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                              Word: <span className="font-bold">{card.boldWord}</span>
                            </label>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                              Sentence
                            </label>
                            <textarea
                              value={card.sentence}
                              onChange={(e) => handleEditCard(index, 'sentence', e.target.value)}
                              rows={2}
                              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                              Translation
                            </label>
                            <textarea
                              value={card.translation}
                              onChange={(e) => handleEditCard(index, 'translation', e.target.value)}
                              rows={2}
                              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCard(index)}
                          className="px-2 py-1 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkWordImporter;
