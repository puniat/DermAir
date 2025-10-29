/**
 * Detailed Error Checker - Shows full error messages
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

console.log('\n🔍 Detailed Error Analysis\n');
console.log('================================================');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 25)}...` : '❌ Not found');
console.log('================================================\n');

async function checkErrors() {
  if (!apiKey) {
    console.error('❌ No API key');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Testing with gemini-pro...\n');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Say "Hello"');
    const text = result.response.text();
    
    console.log('✅ SUCCESS!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('❌ FULL ERROR DETAILS:\n');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('\nError Status:', error.status);
    console.error('Status Text:', error.statusText);
    
    if (error.message.includes('API key not valid')) {
      console.log('\n💡 SOLUTION: The API key is invalid or not properly configured');
      console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
      console.log('   2. Make sure the key has NO restrictions, or');
      console.log('   3. Add "Generative Language API" to allowed APIs');
    } else if (error.message.includes('403')) {
      console.log('\n💡 SOLUTION: API key lacks permissions');
      console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
      console.log('   2. Edit your API key');
      console.log('   3. Under "API restrictions" select "Don\'t restrict key"');
      console.log('   4. Save and wait 1 minute');
    } else if (error.message.includes('404')) {
      console.log('\n💡 SOLUTION: Model not found');
      console.log('   This usually means the API is not enabled or key is from wrong project');
      console.log('   1. Verify project "DermAlr" is selected');
      console.log('   2. Check Generative Language API is enabled');
      console.log('   3. Wait 2-3 minutes after enabling');
    }
    
    console.log('\n📋 Full Error Object:');
    console.log(error);
  }
}

checkErrors();
