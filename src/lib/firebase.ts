import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBXe2SGG0k1h0Ij4cHu0WCa2iRFLAGCLXs",
  authDomain: "clinicflow-b4c0e.firebaseapp.com",
  projectId: "clinicflow-b4c0e",
  storageBucket: "clinicflow-b4c0e.firebasestorage.app",
  messagingSenderId: "12433985112",
  appId: "1:12433985112:web:a2ba3cd6f7ee8a3572c42d"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
