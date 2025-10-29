// Script to delete a user from Firebase Firestore
// Run with: node delete-user.js <username>

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dermalr-f1f93-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const rtdb = admin.database();

async function deleteUser(username) {
  try {
    console.log(`🔍 Looking for user: ${username}...`);
    
    const userId = username.toLowerCase();
    
    // 1. Delete from Firestore (user profile)
    console.log('📄 Deleting Firestore profile...');
    await db.collection('profiles').doc(userId).delete();
    console.log('✅ Firestore profile deleted');
    
    // 2. Delete from Realtime Database (check-ins)
    console.log('📊 Deleting Realtime Database check-ins...');
    await rtdb.ref(`check-ins/${userId}`).remove();
    console.log('✅ Realtime Database check-ins deleted');
    
    console.log(`\n🎉 User "${username}" has been completely deleted!`);
    console.log('You can now create a new account with this username.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    process.exit(1);
  }
}

// Get username from command line
const username = process.argv[2];

if (!username) {
  console.error('❌ Please provide a username');
  console.log('Usage: node delete-user.js <username>');
  console.log('Example: node delete-user.js anilpunia');
  process.exit(1);
}

deleteUser(username);
