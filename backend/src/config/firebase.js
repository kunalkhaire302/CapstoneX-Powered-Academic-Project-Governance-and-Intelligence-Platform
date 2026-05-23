const admin = require('firebase-admin');

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    // Check if Firebase credentials are available
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log('✅ Firebase Admin SDK initialized');
    } else {
      console.warn('⚠️  Firebase credentials not found — running in local auth mode');
      firebaseApp = null;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    firebaseApp = null;
  }

  return firebaseApp;
};

const getFirebaseAuth = () => {
  if (!firebaseApp) return null;
  return admin.auth();
};

const getFirebaseDB = () => {
  if (!firebaseApp) return null;
  return admin.database();
};

initializeFirebase();

module.exports = { admin, initializeFirebase, getFirebaseAuth, getFirebaseDB };
