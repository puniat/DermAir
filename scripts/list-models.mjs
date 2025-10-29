/**
 * List Available Gemini Models
 * 
 * Run this to see which models are available with your API key
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

console.log('\n📋 Listing Available Gemini Models\n');
console.log('================================================');
console.log('API Key configured:', apiKey ? '✅ Yes' : '❌ No');
console.log('================================================\n');

async function listModels() {
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different common model names
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-flash',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];

    console.log('🔍 Testing model availability...\n');

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello"');
        const response = result.response.text();
        console.log(`✅ ${modelName} - WORKS! Response: ${response.substring(0, 50)}`);
      } catch (error) {
        console.log(`❌ ${modelName} - Not available`);
      }
    }

    console.log('\n💡 Use the model name that works in your geminiClient.ts file\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

listModels();
