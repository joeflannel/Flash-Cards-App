// Test HuggingFace API Connection
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_HUGGINGFACE_API_KEY;

console.log('Testing HuggingFace API Connection...');
console.log('API Key present:', !!API_KEY);
console.log('API Key starts with hf_:', API_KEY ? API_KEY.startsWith('hf_') : false);
console.log('API Key length:', API_KEY ? API_KEY.length : 0);

if (!API_KEY) {
  console.error('❌ No API key found in environment variables');
  console.log('Make sure you have a .env file with VITE_HUGGINGFACE_API_KEY=your_key');
  process.exit(1);
}

if (!API_KEY.startsWith('hf_')) {
  console.error('❌ API key format is incorrect. Should start with "hf_"');
  process.exit(1);
}

// Test different API endpoints
const testEndpoints = [
  // HuggingFace Inference API endpoints
  'https://api-inference.huggingface.co/models/gpt2',
  'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
  'https://api-inference.huggingface.co/models/distilgpt2',
  
  // Alternative HuggingFace models
  'https://api-inference.huggingface.co/models/sshleifer/tiny-gpt2',
  'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125M',
  'https://api-inference.huggingface.co/models/microsoft/DialoGPT-small',
  'https://api-inference.huggingface.co/models/sshleifer/distilgpt2',
  
  // Test HuggingFace base APIs
  'https://api-inference.huggingface.co/',
  'https://huggingface.co/api/models',
  
  // Alternative AI Services
  'https://api.openai.com/v1/chat/completions',  // OpenAI (requires different API key)
  'https://api.anthropic.com/v1/messages',       // Claude (requires different API key)
  'https://api.groq.com/openai/v1/chat/completions', // Groq (requires different API key)
  
  // Test if we can reach external services
  'https://httpbin.org/get',
  'https://jsonplaceholder.typicode.com/posts/1'
];

async function testEndpoint(endpoint, method = 'POST') {
  try {
    console.log(`\n🔗 Testing: ${endpoint} (${method})`);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Only add Authorization header for AI service endpoints
    if (endpoint.includes('huggingface.co') || endpoint.includes('api.openai.com') || endpoint.includes('api.anthropic.com') || endpoint.includes('api.groq.com')) {
      options.headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    // Only add body for POST requests
    if (method === 'POST') {
      if (endpoint.includes('huggingface.co')) {
        options.body = JSON.stringify({
          inputs: 'Hello',
          parameters: { max_length: 10 }
        });
      } else if (endpoint.includes('openai.com') || endpoint.includes('groq.com')) {
        options.body = JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        });
      } else if (endpoint.includes('anthropic.com')) {
        options.body = JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }]
        });
      }
    }
    
    const response = await fetch(endpoint, options);
    
    console.log(`Status: ${response.status} (${response.ok ? '✅' : '❌'})`);
    
    if (response.ok) {
      if (method === 'GET') {
        const result = await response.text();
        console.log('✅ Working! Response length:', result.length);
        if (result.length < 200) {
          console.log('Content:', result.substring(0, 200));
        }
      } else {
        try {
          const result = await response.json();
          console.log('✅ Working! Response:', JSON.stringify(result, null, 2));
        } catch {
          const result = await response.text();
          console.log('✅ Working! Response (text):', result.substring(0, 200));
        }
      }
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function testAllEndpoints() {
  console.log('\n🧪 Testing all API endpoints...');
  
  const results = [];
  
  // Test POST endpoints (AI services)
  for (const endpoint of testEndpoints.slice(0, 10)) {
    const working = await testEndpoint(endpoint, 'POST');
    results.push({ endpoint, method: 'POST', working });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test GET endpoints (regular APIs and test endpoints)
  for (const endpoint of testEndpoints.slice(10)) {
    const working = await testEndpoint(endpoint, 'GET');
    results.push({ endpoint, method: 'GET', working });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Results Summary:');
  const workingEndpoints = results.filter(r => r.working);
  const failedEndpoints = results.filter(r => !r.working);
  
  if (workingEndpoints.length > 0) {
    console.log('✅ Working endpoints:');
    workingEndpoints.forEach(r => console.log(`  - ${r.endpoint} (${r.method})`));
  }
  
  if (failedEndpoints.length > 0) {
    console.log('❌ Failed endpoints:');
    failedEndpoints.forEach(r => console.log(`  - ${r.endpoint} (${r.method})`));
  }
  
  console.log('\n💡 Analysis:');
  if (workingEndpoints.some(r => r.method === 'GET')) {
    console.log('✅ Regular HuggingFace API is working');
  }
  
  if (workingEndpoints.some(r => r.method === 'POST')) {
    console.log('✅ Inference API is working');
  } else {
    console.log('❌ Inference API is not working - this might be due to:');
    console.log('   - API key permissions (needs "write" access for inference)');
    console.log('   - Models not available for inference');
    console.log('   - Rate limiting or service issues');
  }
}

testAllEndpoints();
