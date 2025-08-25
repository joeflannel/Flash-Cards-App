// Check HuggingFace API Key Permissions
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const API_KEY = process.env.VITE_HUGGINGFACE_API_KEY;

console.log('🔍 Checking HuggingFace API Key Permissions...\n');

if (!API_KEY) {
  console.error('❌ No API key found');
  process.exit(1);
}

console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
console.log(`Length: ${API_KEY.length} characters\n`);

async function checkPermissions() {
  try {
    // Check user profile
    console.log('👤 Checking user profile...');
    const profileResponse = await fetch('https://huggingface.co/api/whoami', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log('✅ User profile accessible');
      console.log(`   Name: ${profile.name || 'N/A'}`);
      console.log(`   Email: ${profile.email || 'N/A'}`);
      console.log(`   Full Name: ${profile.fullname || 'N/A'}`);
    } else {
      console.log('❌ Cannot access user profile');
    }
    
    // Check models access
    console.log('\n🤖 Checking models access...');
    const modelsResponse = await fetch('https://huggingface.co/api/models?limit=5', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log('✅ Models API accessible');
      console.log(`   Found ${models.length} models`);
      if (models.length > 0) {
        console.log(`   First model: ${models[0].id}`);
      }
    } else {
      console.log('❌ Cannot access models API');
    }
    
    // Check inference API status
    console.log('\n🔮 Checking inference API...');
    const inferenceResponse = await fetch('https://api-inference.huggingface.co/', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    console.log(`   Status: ${inferenceResponse.status}`);
    if (inferenceResponse.ok) {
      console.log('✅ Inference API base accessible');
    } else {
      const errorText = await inferenceResponse.text();
      console.log(`❌ Inference API error: ${errorText}`);
    }
    
    // Check specific model inference
    console.log('\n🧪 Testing specific model inference...');
    const modelResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: 'Hello',
        parameters: { max_length: 5 }
      })
    });
    
    console.log(`   Status: ${modelResponse.status}`);
    if (modelResponse.ok) {
      console.log('✅ Model inference working!');
      const result = await modelResponse.json();
      console.log(`   Response: ${JSON.stringify(result)}`);
    } else {
      const errorText = await modelResponse.text();
      console.log(`❌ Model inference failed: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking permissions:', error.message);
  }
}

checkPermissions();
