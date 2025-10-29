/**
 * Check API Status and Billing
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

console.log('\n🔍 API Status Checker\n');
console.log('================================================');
console.log('Testing new project API key...\n');

async function checkStatus() {
  if (!apiKey) {
    console.error('❌ No API key');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try the v1 API instead of v1beta
  console.log('Attempting different API approaches...\n');
  
  try {
    // Attempt 1: Standard model
    console.log('1️⃣ Trying gemini-pro with v1beta...');
    const model1 = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result1 = await model1.generateContent('Hello');
    console.log('   ✅ gemini-pro works!');
    console.log('   Response:', result1.response.text());
    return;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.status} - ${error.statusText}`);
  }

  try {
    // Attempt 2: Try with 'models/' prefix
    console.log('\n2️⃣ Trying with models/ prefix...');
    const model2 = genAI.getGenerativeModel({ model: 'models/gemini-pro' });
    const result2 = await model2.generateContent('Hello');
    console.log('   ✅ models/gemini-pro works!');
    console.log('   Response:', result2.response.text());
    return;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.status} - ${error.statusText}`);
  }

  console.log('\n❌ All attempts failed.\n');
  console.log('🔍 Possible causes:');
  console.log('1. ⏱️  API needs 5-10 minutes to fully activate (wait and retry)');
  console.log('2. 💳 Free tier may require billing to be enabled (even if not charged)');
  console.log('3. 🌍 Gemini API might not be available in your region');
  console.log('4. 🔐 API restrictions preventing access\n');
  
  console.log('📋 What to check:');
  console.log('- Billing enabled: https://console.cloud.google.com/billing?project=dermalr-476603');
  console.log('- API enabled: https://console.cloud.google.com/apis/dashboard?project=dermalr-476603');
  console.log('- Wait 5-10 minutes after enabling API\n');
  
  console.log('💡 ALTERNATIVE: Use the fallback system (app still works!)');
  console.log('   Your app uses rule-based algorithm when Gemini is unavailable.');
  console.log('   It provides good risk assessment even without AI.\n');
}

checkStatus();
