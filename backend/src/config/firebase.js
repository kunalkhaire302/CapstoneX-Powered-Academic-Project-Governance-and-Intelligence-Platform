const admin = require('firebase-admin');

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'capstonexweb';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin SDK initialized with Service Account credentials');
    } else {
      // Fallback to Application Default Credentials
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId
      });
      console.log('✅ Firebase Admin SDK initialized with Application Default Credentials');
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

const getFirestoreDB = () => {
  if (!firebaseApp) return null;
  return admin.firestore();
};

initializeFirebase();

module.exports = { admin, initializeFirebase, getFirebaseAuth, getFirestoreDB };
