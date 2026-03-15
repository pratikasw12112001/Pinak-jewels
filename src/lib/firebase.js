import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4-6hDvdCNwBG1RAkvDawLvIS58cpPcqo",
  authDomain: "pinak-jewels.firebaseapp.com",
  projectId: "pinak-jewels",
  storageBucket: "pinak-jewels.firebasestorage.app",
  messagingSenderId: "845453107200",
  appId: "1:845453107200:web:8ad6081bc5fe9c37ae38e5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
