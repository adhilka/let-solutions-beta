import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getWriteDb, getMirrorDb } from './loadBalancer';

// Custom wrapper to ensure dual writes to workaround free plan restrictions
export async function dualWrite(pathSegments: string[], data: any): Promise<void> {
    const dbA = getWriteDb();
    const dbB = getMirrorDb();
    const pathA = doc(dbA, pathSegments.join('/'));
    
    const promises = [setDoc(pathA, data, { merge: true })];

    if (dbB) {
        const pathB = doc(dbB, pathSegments.join('/'));
        promises.push(setDoc(pathB, data, { merge: true }));
    }

    await Promise.all(promises);
}

export async function dualDelete(pathSegments: string[]): Promise<void> {
    const dbA = getWriteDb();
    const dbB = getMirrorDb();
    const pathA = doc(dbA, pathSegments.join('/'));
    
    const promises = [deleteDoc(pathA)];

    if (dbB) {
        const pathB = doc(dbB, pathSegments.join('/'));
        promises.push(deleteDoc(pathB));
    }

    await Promise.all(promises);
}
