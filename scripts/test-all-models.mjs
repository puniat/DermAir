/**
 * Enhanced Model Tester - Tests all possible Gemini model variations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

console.log('\n🔍 Enhanced Gemini Model Tester\n');
console.log('================================================');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ Not found');
console.log('================================================\n');

async function testAllModels() {
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Comprehensive list of model names to try (as of October 2025)
    const modelsToTry = [
      // Current generation models
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002', 
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro',
      
      // Older models that might still work
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.0-pro-001',
      'gemini-1.0-pro-latest',
      
      // Flash variants
      'gemini-flash',
      
      // With models/ prefix (some APIs require this)
      'models/gemini-1.5-flash-001',
      'models/gemini-1.5-flash-002',
      'models/gemini-1.5-flash-latest',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro-001',
      'models/gemini-1.5-pro-002', 
      'models/gemini-1.5-pro-latest',
      'models/gemini-1.5-pro',
      'models/gemini-pro',
      'models/gemini-1.0-pro',
      'models/gemini-1.0-pro-001',
    ];

    console.log('🧪 Testing models (this may take 1-2 minutes)...\n');
    
    let workingModels = [];
    
    for (const modelName of modelsToTry) {
      try {
        process.stdout.write(`Testing ${modelName}... `);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          }
        });
        
        const result = await model.generateContent('Say "Hello" and nothing else.');
        const response = result.response.text();
        
        console.log(`✅ WORKS! Response: "${response.substring(0, 50)}"`);
        workingModels.push(modelName);
        
      } catch (error) {
        if (error.message.includes('404')) {
          console.log(`❌ Not found`);
        } else if (error.message.includes('403')) {
          console.log(`❌ Permission denied`);
        } else if (error.message.includes('429')) {
          console.log(`⏳ Rate limited (try again later)`);
        } else {
          console.log(`❌ Error: ${error.message.substring(0, 50)}`);
        }
      }
    }

    console.log('\n================================================');
    if (workingModels.length > 0) {
      console.log('✅ WORKING MODELS FOUND:\n');
      workingModels.forEach(model => {
        console.log(`   ✓ ${model}`);
      });
      console.log('\n💡 Update geminiClient.ts to use one of these models!');
      console.log(`   Example: model: '${workingModels[0]}'`);
    } else {
      console.log('❌ NO WORKING MODELS FOUND\n');
      console.log('Possible issues:');
      console.log('1. API key needs Generative Language API enabled');
      console.log('2. Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      console.log('3. Enable the API for your project "DermAlr"');
      console.log('4. Wait 1-2 minutes and try again\n');
    }
    console.log('================================================\n');

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error('\nFull error:', error);
  }
}

testAllModels();
