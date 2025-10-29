/**
 * Test Groq AI Integration
 * 
 * Quick test to verify your Groq API key works
 */

import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';

console.log('\n🧪 Testing Groq AI Integration\n');
console.log('================================================\n');

if (!apiKey) {
  console.error('❌ No GROQ_API_KEY found!');
  console.log('\n📋 Setup Instructions:');
  console.log('1. Get key: https://console.groq.com/keys');
  console.log('2. Add to .env.local: GROQ_API_KEY=gsk_your_key_here');
  console.log('3. Run this script again\n');
  process.exit(1);
}

console.log('✅ API Key found:', apiKey.substring(0, 10) + '...\n');

async function testGroq() {
  const groq = new Groq({ apiKey });

  try {
    console.log('📡 Calling Groq API with medical prompt...\n');
    
    const startTime = Date.now();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a dermatology AI assistant. Respond with valid JSON only.'
        },
        {
          role: 'user',
          content: `Analyze eczema risk for: 
- Temperature: 15°C
- Humidity: 25% (very dry)
- UV Index: 7
- Patient: Sensitive skin, moderate eczema

Respond with JSON containing: riskScore (0-10), riskLevel, factors (array), recommendations (array)`
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });
    
    const processingTime = Date.now() - startTime;
    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Empty response');
    }

    const analysis = JSON.parse(response);
    
    console.log('✅ Groq API Test SUCCESSFUL!\n');
    console.log('================================================\n');
    console.log('📊 Response Summary:');
    console.log('  - Risk Score:', analysis.riskScore);
    console.log('  - Risk Level:', analysis.riskLevel);
    console.log('  - Factors:', analysis.factors?.length || 0);
    console.log('  - Recommendations:', analysis.recommendations?.length || 0);
    console.log('  - Processing Time:', processingTime + 'ms');
    console.log('\n📝 Full Response:');
    console.log(JSON.stringify(analysis, null, 2));
    console.log('\n================================================\n');
    console.log('🎉 Your Groq integration is working perfectly!');
    console.log('✅ Ready for production use\n');

  } catch (error) {
    console.error('❌ Test FAILED\n');
    console.error('Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check API key is correct');
    console.error('2. Visit: https://console.groq.com/keys');
    console.error('3. Make sure key has no extra spaces');
    console.error('4. Try creating a new key\n');
    process.exit(1);
  }
}

testGroq();
