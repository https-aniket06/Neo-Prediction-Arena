const admin = require('firebase-admin');

// Note: Ensure you download your Firebase Service Account JSON 
// from your Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
// Save it as 'serviceAccountKey.json' in the backend folder.
let db;
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin configured successfully!");
    db = admin.firestore();
} catch (e) {
    console.log("⚠️ Firebase not configured yet. Could not find serviceAccountKey.json");
    // Optional: fallback to mock data or mock db object if missing
    db = null;
}

module.exports = { admin, db };
