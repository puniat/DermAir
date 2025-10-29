/**
 * Test Script for Gemini AI Integration
 * 
 * Run this to verify the Gemini API is working correctly
 * 
 * Usage: node test-gemini.js (or run via npm script)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
const apiKey = process.env.GEMINI_API_KEY || '';

console.log('\n🧪 Testing Gemini AI Integration\n');
console.log('================================================');
console.log('API Key configured:', apiKey ? '✅ Yes' : '❌ No');
console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set');
console.log('================================================\n');

async function testGeminiAPI() {
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.error('Please set it in your .env.local file\n');
    process.exit(1);
  }

  try {
    console.log('🤖 Initializing Gemini AI client...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    console.log('✅ Client initialized\n');

    console.log('🔍 Sending test prompt to Gemini...');
    const prompt = `You are a medical AI assistant specializing in dermatology.

Analyze the following patient data and provide a risk assessment in JSON format:

PATIENT: 30-year-old with sensitive skin, known triggers: cold weather, stress
ENVIRONMENT: Temperature 10°C, Humidity 35%, Air Quality Index 45
RECENT SYMPTOMS: Mild itching (score 3/10), slight redness (score 2/10)

Respond ONLY with valid JSON in this format:
{
  "riskScore": <number 0-100>,
  "riskLevel": "<minimal|low|moderate|high|severe>",
  "confidence": <number 0-1>,
  "reasoning": "<brief explanation>",
  "keyFactors": [
    {
      "name": "<factor name>",
      "category": "<environmental|physiological|behavioral|clinical>",
      "impact": <number 0-100>,
      "description": "<brief description>"
    }
  ],
  "recommendations": [
    {
      "priority": "<critical|high|medium|low>",
      "category": "<immediate|preventive|lifestyle|medical>",
      "recommendation": "<specific recommendation>",
      "rationale": "<why this matters>"
    }
  ],
  "predictions": {
    "next24h": <number 0-100>,
    "next7days": <number 0-100>,
    "trajectory": "<improving|stable|worsening>"
  }
}`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const duration = Date.now() - startTime;

    console.log(`✅ Response received in ${duration}ms\n`);
    console.log('📊 Raw Response Preview:');
    console.log('-------------------');
    console.log(text.substring(0, 500));
    console.log('...\n');

    // Try to parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('✅ JSON Parsing: SUCCESS\n');
      console.log('📋 Parsed Analysis:');
      console.log('-------------------');
      console.log('Risk Score:', analysis.riskScore);
      console.log('Risk Level:', analysis.riskLevel);
      console.log('Confidence:', (analysis.confidence * 100).toFixed(1) + '%');
      console.log('Key Factors:', analysis.keyFactors?.length || 0);
      console.log('Recommendations:', analysis.recommendations?.length || 0);
      console.log('Predictions:');
      console.log('  - Next 24h:', analysis.predictions?.next24h);
      console.log('  - Next 7 days:', analysis.predictions?.next7days);
      console.log('  - Trajectory:', analysis.predictions?.trajectory);
      console.log('\n🎉 Gemini AI Integration is working perfectly!');
      console.log('✅ You can now use AI-powered risk assessment in DermAir\n');
    } else {
      console.error('❌ JSON Parsing: FAILED');
      console.error('Could not find JSON in response\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('\nError Details:');
    console.error(error);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check your API key is correct');
    console.error('2. Verify you have internet connection');
    console.error('3. Check if the API key has proper permissions');
    console.error('4. Visit https://aistudio.google.com to verify your quota\n');
    process.exit(1);
  }
}

// Run the test
testGeminiAPI();
