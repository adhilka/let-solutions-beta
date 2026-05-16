import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';

console.log("Firebase config A:", firebaseConfig);

export const appA = getApps().find(app => app.name === '[DEFAULT]') || initializeApp(firebaseConfig);
export const dbA = getFirestore(appA, firebaseConfig.firestoreDatabaseId);
export const authA = getAuth(appA);
