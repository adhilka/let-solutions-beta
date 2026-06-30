import { doc, setDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { getWriteDb, getMirrorDb } from './loadBalancer';
import { sanitizePayload } from '../sanitize';

async function withWriteTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('FIRESTORE_WRITE_TIMEOUT')), timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function dualWrite(pathSegments: string[], data: any): Promise<void> {
    const dbA = getWriteDb();
    const dbB_instance = getMirrorDb();
    
    const sanitizedData = sanitizePayload(data);
    
    const writeOp = async (db: Firestore) => {
        const path = doc(db, pathSegments.join('/'));
        return withWriteTimeout(setDoc(path, sanitizedData, { merge: true }));
    };

    const results = await Promise.allSettled([
        writeOp(dbA),
        ...(dbB_instance ? [writeOp(dbB_instance)] : [])
    ]);

    const anySuccess = results.some(r => r.status === 'fulfilled');
    if (!anySuccess) {
        const error = results[0].status === 'rejected' ? results[0].reason : new Error('Write failed on all projects');
        throw error;
    }
}

export async function dualDelete(pathSegments: string[]): Promise<void> {
    const dbA = getWriteDb();
    const dbB_instance = getMirrorDb();
    
    const deleteOp = async (db: Firestore) => {
        const path = doc(db, pathSegments.join('/'));
        return withWriteTimeout(deleteDoc(path));
    };

    const results = await Promise.allSettled([
        deleteOp(dbA),
        ...(dbB_instance ? [deleteOp(dbB_instance)] : [])
    ]);

    const anySuccess = results.some(r => r.status === 'fulfilled');
    if (!anySuccess) {
        const error = results[0].status === 'rejected' ? results[0].reason : new Error('Delete failed on all projects');
        throw error;
    }
}
