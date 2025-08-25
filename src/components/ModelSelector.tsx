import React, { useState, useEffect } from 'react';
import { aiService, ModelConfig } from '../utils/aiService';

interface ModelSelectorProps {
  onModelChange?: (modelKey: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelChange }) => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const models = aiService.getAvailableModels();
    setAvailableModels(models);
    setSelectedModel(aiService.getCurrentModel());
  }, []);

  const handleModelChange = (modelKey: string) => {
    if (aiService.setModel(modelKey)) {
      setSelectedModel(modelKey);
      onModelChange?.(modelKey);
      setTestResult('');
    }
  };

  const testConnection = async () => {
    if (!selectedModel) return;
    
    setIsTesting(true);
    setTestResult('');
    
    try {
      const isConnected = await aiService.testConnection();
      if (isConnected) {
        setTestResult('✅ Connection successful! Model is ready to use.');
      } else {
        setTestResult('❌ Connection failed. Please check your API key and internet connection.');
      }
    } catch (error) {
      setTestResult(`❌ Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (!aiService.isReady()) {
    const apiKeyStatus = aiService.getApiKeyStatus();
    const hasAnyKey = Object.values(apiKeyStatus).some(status => status);
    
    if (!hasAnyKey) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                AI API Key Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>To use AI features, you need to add at least one API key to your <code className="bg-yellow-100 px-1 py-0.5 rounded">.env</code> file:</p>
                <div className="mt-2 space-y-1">
                  <p><code className="bg-yellow-100 px-1 py-0.5 rounded">VITE_HUGGINGFACE_API_KEY=your_key_here</code></p>
                  <p><code className="bg-yellow-100 px-1 py-0.5 rounded">VITE_OPENAI_API_KEY=your_key_here</code></p>
                  <p><code className="bg-yellow-100 px-1 py-0.5 rounded">VITE_GROQ_API_KEY=your_key_here</code></p>
                </div>
                <p className="mt-2">
                  <a 
                    href="https://huggingface.co/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-600"
                  >
                    Get HuggingFace API key
                  </a>
                  {' | '}
                  <a 
                    href="https://console.groq.com/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-600"
                  >
                    Get Groq API key
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">AI Model Selection</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Model
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {availableModels.map((model) => (
              <option key={model.name} value={availableModels.find(m => m.name === model.name)?.name || ''}>
                {model.name} {model.isFree ? '(Free)' : '(Premium)'}
              </option>
            ))}
          </select>
        </div>

        {selectedModel && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Current Model: {availableModels.find(m => m.name === selectedModel)?.name}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Provider: {availableModels.find(m => m.name === selectedModel)?.provider}</p>
              <p>• Max Length: {availableModels.find(m => m.name === selectedModel)?.maxLength} tokens</p>
              <p>• Temperature: {availableModels.find(m => m.name === selectedModel)?.temperature}</p>
              <p>• Status: {availableModels.find(m => m.name === selectedModel)?.isFree ? 'Free' : 'Premium'}</p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <button
            onClick={testConnection}
            disabled={isTesting || !selectedModel}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          {testResult && (
            <span className={`text-sm ${testResult.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {testResult}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>💡 <strong>Tip:</strong> Different models have different strengths. Try switching between models to find the best results for your language learning needs.</p>
          <p>🔒 All models shown are free to use within HuggingFace's generous limits.</p>
        </div>
      </div>
    </div>
  );
};
