export interface GeneratedSentence {
  sentence: string;
  translation: string;
  confidence: number;
}

export interface ModelConfig {
  name: string;
  endpoint: string;
  maxLength: number;
  temperature: number;
  isFree: boolean;
  provider: 'huggingface' | 'openai' | 'anthropic' | 'groq' | 'fallback';
  requiresApiKey: boolean;
}

export class AIService {
  private static instance: AIService;
  private isConfigured: boolean;
  private apiKey: string;
  private currentModel: string;
  private openaiApiKey: string;
  private anthropicApiKey: string;
  private groqApiKey: string;

  // Available models with multiple providers
  private readonly models: Record<string, ModelConfig> = {
    'GPT-2 (HuggingFace)': {
      name: 'GPT-2 (HuggingFace)',
      endpoint: 'https://api-inference.huggingface.co/models/gpt2',
      maxLength: 150,
      temperature: 0.7,
      isFree: true,
      provider: 'huggingface',
      requiresApiKey: true
    },
    'DialoGPT (HuggingFace)': {
      name: 'DialoGPT (HuggingFace)',
      endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      maxLength: 150,
      temperature: 0.7,
      isFree: true,
      provider: 'huggingface',
      requiresApiKey: true
    },
    'GPT-3.5 Turbo (OpenAI)': {
      name: 'GPT-3.5 Turbo (OpenAI)',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      maxLength: 150,
      temperature: 0.7,
      isFree: false,
      provider: 'openai',
      requiresApiKey: true
    },
    'Claude Haiku (Anthropic)': {
      name: 'Claude Haiku (Anthropic)',
      endpoint: 'https://api.anthropic.com/v1/messages',
      maxLength: 150,
      temperature: 0.7,
      isFree: false,
      provider: 'anthropic',
      requiresApiKey: true
    },
    'Llama 3 (Groq)': {
      name: 'Llama 3 (Groq)',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      maxLength: 150,
      temperature: 0.7,
      isFree: false,
      provider: 'groq',
      requiresApiKey: true
    },
    'Fallback (Local)': {
      name: 'Fallback (Local)',
      endpoint: '',
      maxLength: 100,
      temperature: 0.7,
      isFree: true,
      provider: 'fallback',
      requiresApiKey: false
    }
  };

  private constructor() {
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || '';
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    
    // Check if we have at least one working API key
    this.isConfigured = !!(this.apiKey || this.openaiApiKey || this.anthropicApiKey || this.groqApiKey);
    this.currentModel = 'Fallback (Local)'; // Default to fallback
    
    // Enhanced debug logging
    console.log('AIService initialized:', {
      hasHuggingFaceKey: !!this.apiKey,
      hasOpenAIKey: !!this.openaiApiKey,
      hasAnthropicKey: !!this.anthropicApiKey,
      hasGroqKey: !!this.groqApiKey,
      isConfigured: this.isConfigured,
      currentModel: this.currentModel
    });
    
    if (!this.isConfigured) {
      console.warn('⚠️ No AI API keys configured. Using fallback mode only.');
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public isReady(): boolean {
    return this.isConfigured;
  }

  public getAvailableModels(): ModelConfig[] {
    // Filter models based on available API keys
    return Object.values(this.models).filter(model => {
      if (model.provider === 'fallback') return true;
      if (model.provider === 'huggingface') return !!this.apiKey;
      if (model.provider === 'openai') return !!this.openaiApiKey;
      if (model.provider === 'anthropic') return !!this.anthropicApiKey;
      if (model.provider === 'groq') return !!this.groqApiKey;
      return false;
    });
  }

  public getCurrentModel(): string {
    return this.currentModel;
  }

  public setModel(modelKey: string): boolean {
    if (this.models[modelKey]) {
      this.currentModel = modelKey;
      return true;
    }
    return false;
  }

  public async generateSentence(
    word: string, 
    targetLanguage: string = 'Spanish',
    sourceLanguage: string = 'English'
  ): Promise<GeneratedSentence> {
    const model = this.models[this.currentModel];
    if (!model) {
      throw new Error('Invalid model selected');
    }

    try {
      switch (model.provider) {
        case 'huggingface':
          return await this.generateWithHuggingFace(word, targetLanguage, model);
        case 'openai':
          return await this.generateWithOpenAI(word, targetLanguage, model);
        case 'anthropic':
          return await this.generateWithAnthropic(word, targetLanguage, model);
        case 'groq':
          return await this.generateWithGroq(word, targetLanguage, model);
        case 'fallback':
          return await this.generateFallback(word, targetLanguage);
        default:
          throw new Error(`Unsupported provider: ${model.provider}`);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback to local generation if external services fail
      return await this.generateFallback(word, targetLanguage);
    }
  }

  private async generateWithHuggingFace(word: string, targetLanguage: string, model: ModelConfig): Promise<GeneratedSentence> {
    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured');
    }

    const prompt = `Sentence in ${targetLanguage}: ${word}`;
    const response = await fetch(model.endpoint, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: model.maxLength,
          temperature: model.temperature,
          do_sample: true,
          top_p: 0.9,
          repetition_penalty: 1.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API request failed: ${response.status}`);
    }

    const result = await response.json();
    const responseText = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
    
    if (!responseText) {
      throw new Error('No response generated from the AI model');
    }

    return {
      sentence: responseText.trim(),
      translation: `[${targetLanguage} sentence: ${responseText.trim()}]`,
      confidence: 0.8,
    };
  }

  private async generateWithOpenAI(word: string, targetLanguage: string, model: ModelConfig): Promise<GeneratedSentence> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate a natural sentence in ${targetLanguage} that includes the word "${word}". Make it suitable for language learning.`;
    
    const response = await fetch(model.endpoint, {
      headers: {
        Authorization: `Bearer ${this.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: model.maxLength,
        temperature: model.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const result = await response.json();
    const sentence = result.choices[0]?.message?.content?.trim();
    
    if (!sentence) {
      throw new Error('No response generated from OpenAI');
    }

    return {
      sentence,
      translation: `[${targetLanguage} sentence: ${sentence}]`,
      confidence: 0.9,
    };
  }

  private async generateWithAnthropic(word: string, targetLanguage: string, model: ModelConfig): Promise<GeneratedSentence> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = `Generate a natural sentence in ${targetLanguage} that includes the word "${word}". Make it suitable for language learning.`;
    
    const response = await fetch(model.endpoint, {
      headers: {
        "x-api-key": this.anthropicApiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      method: "POST",
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: model.maxLength,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API request failed: ${response.status}`);
    }

    const result = await response.json();
    const sentence = result.content[0]?.text?.trim();
    
    if (!sentence) {
      throw new Error('No response generated from Anthropic');
    }

    return {
      sentence,
      translation: `[${targetLanguage} sentence: ${sentence}]`,
      confidence: 0.9,
    };
  }

  private async generateWithGroq(word: string, targetLanguage: string, model: ModelConfig): Promise<GeneratedSentence> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const prompt = `Generate a natural sentence in ${targetLanguage} that includes the word "${word}". Make it suitable for language learning.`;
    
    const response = await fetch(model.endpoint, {
      headers: {
        Authorization: `Bearer ${this.groqApiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        max_tokens: model.maxLength,
        temperature: model.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed: ${response.status}`);
    }

    const result = await response.json();
    const sentence = result.choices[0]?.message?.content?.trim();
    
    if (!sentence) {
      throw new Error('No response generated from Groq');
    }

    return {
      sentence,
      translation: `[${targetLanguage} sentence: ${sentence}]`,
      confidence: 0.9,
    };
  }

  private async generateFallback(word: string, targetLanguage: string): Promise<GeneratedSentence> {
    // Simple fallback generation using templates
    const templates = {
      'Spanish': [
        `Me gusta la palabra "${word}".`,
        `"${word}" es una palabra interesante.`,
        `Aprendo "${word}" en español.`,
        `¿Puedes usar "${word}" en una frase?`,
        `"${word}" significa algo importante.`
      ],
      'French': [
        `J'aime le mot "${word}".`,
        `"${word}" est un mot intéressant.`,
        `J'apprends "${word}" en français.`,
        `Pouvez-vous utiliser "${word}" dans une phrase?`,
        `"${word}" signifie quelque chose d'important.`
      ],
      'German': [
        `Ich mag das Wort "${word}".`,
        `"${word}" ist ein interessantes Wort.`,
        `Ich lerne "${word}" auf Deutsch.`,
        `Kannst du "${word}" in einem Satz verwenden?`,
        `"${word}" bedeutet etwas Wichtiges.`
      ]
    };

    const languageTemplates = templates[targetLanguage as keyof typeof templates] || templates['Spanish'];
    const randomTemplate = languageTemplates[Math.floor(Math.random() * languageTemplates.length)];
    
    return {
      sentence: randomTemplate,
      translation: `[${targetLanguage} sentence: ${randomTemplate}]`,
      confidence: 0.6,
    };
  }

  public async generateMultipleSentences(
    words: string[], 
    targetLanguage: string = 'Spanish',
    sourceLanguage: string = 'English'
  ): Promise<GeneratedSentence[]> {
    const results: GeneratedSentence[] = [];
    
    for (const word of words) {
      try {
        const result = await this.generateSentence(word, targetLanguage, sourceLanguage);
        results.push(result);
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate sentence for "${word}":`, error);
        // Use fallback for failed generations
        const fallbackResult = await this.generateFallback(word, targetLanguage);
        results.push(fallbackResult);
      }
    }
    
    return results;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const model = this.models[this.currentModel];
      if (!model) return false;

      switch (model.provider) {
        case 'huggingface':
          if (!this.apiKey) return false;
          const hfResponse = await fetch(model.endpoint, {
            headers: { Authorization: `Bearer ${this.apiKey}` },
            method: "POST",
            body: JSON.stringify({ inputs: "Hello", parameters: { max_length: 10 } }),
          });
          return hfResponse.ok;
        
        case 'openai':
          if (!this.openaiApiKey) return false;
          const openaiResponse = await fetch(model.endpoint, {
            headers: { Authorization: `Bearer ${this.openaiApiKey}` },
            method: "POST",
            body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: "Hello" }], max_tokens: 5 }),
          });
          return openaiResponse.ok;
        
        case 'anthropic':
          if (!this.anthropicApiKey) return false;
          const anthropicResponse = await fetch(model.endpoint, {
            headers: { "x-api-key": this.anthropicApiKey, "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
            method: "POST",
            body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 5, messages: [{ role: "user", content: "Hello" }] }),
          });
          return anthropicResponse.ok;
        
        case 'groq':
          if (!this.groqApiKey) return false;
          const groqResponse = await fetch(model.endpoint, {
            headers: { Authorization: `Bearer ${this.groqApiKey}` },
            method: "POST",
            body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "user", content: "Hello" }], max_tokens: 5 }),
          });
          return groqResponse.ok;
        
        case 'fallback':
          return true; // Fallback always works
        
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  public getApiKeyStatus(): Record<string, boolean> {
    return {
      huggingface: !!this.apiKey,
      openai: !!this.openaiApiKey,
      anthropic: !!this.anthropicApiKey,
      groq: !!this.groqApiKey
    };
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
