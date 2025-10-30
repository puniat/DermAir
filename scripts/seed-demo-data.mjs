/**
 * Seed Demo Data Script
 * Creates 16 days of check-in data for the demo user
 * 
 * Run with: node scripts/seed-demo-data.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCv5JrZtk5zQ9HCfzzjsXwSKwSFxk0bxYk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dermair-bb3fe.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dermair-bb3fe",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dermair-bb3fe.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "639172836326",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:639172836326:web:90f7e825f5b976af1da12a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEMO_USER_ID = 'demo';

// Generate realistic check-in data
function generateCheckInData(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 4) + 19, Math.floor(Math.random() * 60), 0, 0); // Evening time

  // Simulate improving condition over time (higher scores earlier, lower scores recently)
  const improvementFactor = Math.max(0.3, 1 - (daysAgo / 20));
  
  // Base scores with some randomness
  const baseItchScore = Math.floor(Math.random() * 4) + 3; // 3-6
  const baseRednessScore = Math.floor(Math.random() * 4) + 3; // 3-6
  
  // Apply improvement factor
  const itchScore = Math.max(1, Math.floor(baseItchScore * improvementFactor));
  const rednessScore = Math.max(1, Math.floor(baseRednessScore * improvementFactor));
  
  // Medication usage more likely with higher symptoms
  const medicationUsed = (itchScore + rednessScore) > 8 ? true : Math.random() > 0.5;

  // Generate weather data
  const temperature = Math.floor(Math.random() * 15) + 15; // 15-30°C
  const humidity = Math.floor(Math.random() * 40) + 40; // 40-80%
  const uvIndex = Math.floor(Math.random() * 8) + 1; // 1-8
  const aqi = Math.floor(Math.random() * 100) + 20; // 20-120
  const pollenOverall = Math.floor(Math.random() * 10); // 0-10

  // Occasional notes
  const notes = Math.random() > 0.7 ? [
    "Feeling better today",
    "Skin feels dry after shower",
    "Applied moisturizer twice",
    "Slept well last night",
    "Had seafood for dinner - watching for reactions",
    "Weather was humid today",
    "Feeling itchy in the evening",
    "Used prescribed cream"
  ][Math.floor(Math.random() * 8)] : "";

  return {
    id: `checkin_${DEMO_USER_ID}_${Date.now()}_${daysAgo}`,
    user_id: DEMO_USER_ID,
    date: Timestamp.fromDate(date),
    itch_score: itchScore,
    redness_score: rednessScore,
    medication_used: medicationUsed,
    notes: notes,
    weather_data: {
      temperature: temperature,
      humidity: humidity,
      pressure: 1013,
      uv_index: uvIndex,
      air_quality_index: aqi,
      pollen_count: {
        tree: Math.floor(Math.random() * 10),
        grass: Math.floor(Math.random() * 10),
        weed: Math.floor(Math.random() * 10),
        overall: pollenOverall
      },
      weather_condition: ['clear', 'partly_cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
      wind_speed: Math.floor(Math.random() * 20) + 5,
      timestamp: date
    },
    created_at: Timestamp.fromDate(date)
  };
}

async function seedDemoData() {
  console.log('🌱 Starting to seed demo data...');
  console.log(`📊 Creating 16 days of check-ins for user: ${DEMO_USER_ID}`);
  
  try {
    const checkInsRef = collection(db, 'profiles', DEMO_USER_ID, 'checkins');
    
    // Generate check-ins for the last 16 days
    for (let i = 0; i < 16; i++) {
      const checkInData = generateCheckInData(i);
      
      console.log(`  ✓ Day ${16 - i}/16: Itch=${checkInData.itch_score}, Redness=${checkInData.redness_score}, Meds=${checkInData.medication_used}`);
      
      await addDoc(checkInsRef, checkInData);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n✅ Successfully seeded 16 days of demo data!');
    console.log('🎉 Demo user now has a complete check-in history');
    console.log('\n📝 Summary:');
    console.log('   - User ID: demo');
    console.log('   - Check-ins: 16 days');
    console.log('   - Date range: Last 16 days');
    console.log('   - Data includes: itch scores, redness, medication usage, weather data, and notes');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the seeding
seedDemoData();
