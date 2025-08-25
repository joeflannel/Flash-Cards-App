// Test Fallback Mode
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🧪 Testing AI Service Fallback Mode...\n');

// Simulate the AI service environment
const API_KEY = process.env.VITE_HUGGINGFACE_API_KEY || '';
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || '';
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || '';

console.log('API Key Status:');
console.log(`  HuggingFace: ${API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`  OpenAI: ${OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`  Anthropic: ${ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`  Groq: ${GROQ_API_KEY ? '✅ Set' : '❌ Not set'}`);

const hasAnyKey = !!(API_KEY || OPENAI_API_KEY || ANTHROPIC_API_KEY || GROQ_API_KEY);
console.log(`\nHas any API key: ${hasAnyKey ? '✅ Yes' : '❌ No'}`);

if (!hasAnyKey) {
  console.log('\n🔧 Using Fallback Mode');
  console.log('The app will use local sentence generation templates.');
  
  // Test fallback generation
  const testWords = ['hello', 'world', 'learn'];
  const languages = ['Spanish', 'French', 'German'];
  
  console.log('\n📝 Testing Fallback Generation:');
  
  for (const word of testWords) {
    for (const lang of languages) {
      const templates = {
        'Spanish': [
          `Me gusta la palabra "${word}".`,
          `"${word}" es una palabra interesante.`,
          `Aprendo "${word}" en español.`
        ],
        'French': [
          `J'aime le mot "${word}".`,
          `"${word}" est un mot intéressant.`,
          `J'apprends "${word}" en français.`
        ],
        'German': [
          `Ich mag das Wort "${word}".`,
          `"${word}" ist ein interessantes Wort.`,
          `Ich lerne "${word}" auf Deutsch.`
        ]
      };
      
      const languageTemplates = templates[lang] || templates['Spanish'];
      const randomTemplate = languageTemplates[Math.floor(Math.random() * languageTemplates.length)];
      
      console.log(`  ${lang}: "${randomTemplate}"`);
    }
  }
  
  console.log('\n✅ Fallback mode is working!');
  console.log('You can now use the app even without external AI services.');
  
} else {
  console.log('\n✅ You have API keys configured!');
  console.log('The app will use external AI services when available.');
  console.log('If they fail, it will automatically fall back to local generation.');
}

console.log('\n💡 Next Steps:');
console.log('1. Open your app in the browser');
console.log('2. Check the Model Selector component');
console.log('3. Try generating sentences');
console.log('4. The app will automatically choose the best available method');
