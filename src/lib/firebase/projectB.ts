import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigB from '../../../firebase-applet-config-b.json';

let appB_instance: FirebaseApp | null = null;
let dbB_instance: Firestore | null = null;

export const getAppB = () => {
  if (appB_instance) return appB_instance;
  appB_instance = getApps().find(app => app.name === 'projectB') || initializeApp(firebaseConfigB, 'projectB');
  return appB_instance;
};

export const getDbB = () => {
  if (dbB_instance) return dbB_instance;
  const app = getAppB();
  dbB_instance = getFirestore(app, firebaseConfigB.firestoreDatabaseId);
  return dbB_instance;
};

export const getOptionalDbB = () => {
  try {
    return getDbB();
  } catch (e) {
    return null;
  }
};
