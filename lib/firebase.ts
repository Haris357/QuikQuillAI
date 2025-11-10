import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFirestore, Firestore } from 'firebase/firestore';

// Default configuration for development
const defaultConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  databaseURL: "https://demo-project-default-rtdb.firebaseio.com/",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || defaultConfig.databaseURL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultConfig.appId
};

let app: FirebaseApp | undefined;
let auth: Auth | null;
let database: Database | null;
let storage: FirebaseStorage | null;
let firestore: Firestore | null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  storage = getStorage(app);
  firestore = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create mock objects for development
  auth = null;
  database = null;
  storage = null;
  firestore = null;
}

export { auth, database, storage, firestore };
export default app;