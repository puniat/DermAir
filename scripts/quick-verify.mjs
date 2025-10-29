/**
 * Quick Gemini API Verification
 * 
 * Tests if your API key works with Generative Language API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

console.log('\n🔐 Gemini API Key Verification\n');
console.log('================================================');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 25)}...` : '❌ Not found');
console.log('Key Length:', apiKey.length, 'characters');
console.log('================================================\n');

async function quickTest() {
  if (!apiKey) {
    console.error('❌ No API key found in environment');
    process.exit(1);
  }

  console.log('🧪 Testing with gemini-1.5-flash-8b (fastest free model)...\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try the most commonly working model first
    const modelsToTest = [
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Say only "API works!"');
        const text = result.response.text();
        
        console.log(`\n✅ SUCCESS! Model "${modelName}" is working!\n`);
        console.log('Response:', text);
        console.log('\n================================================');
        console.log('🎉 Your Gemini API is properly configured!');
        console.log(`💡 Use this model name: "${modelName}"`);
        console.log('================================================\n');
        
        // Show how to update the code
        console.log('📝 To use this in your app, the model is already configured.');
        console.log('   Just restart your dev server: npm run dev\n');
        
        return; // Exit on first success
        
      } catch (error) {
        console.log(`   ❌ ${modelName} failed: ${error.message.substring(0, 60)}`);
      }
    }

    console.log('\n❌ None of the standard models worked.\n');
    console.log('Troubleshooting steps:');
    console.log('1. Verify Generative Language API is enabled');
    console.log('2. Check API key has "Generative Language API" restriction');
    console.log('3. Wait 2-3 minutes for API to propagate');
    console.log('4. Try generating a NEW API key\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull details:', error);
  }
}

quickTest();
