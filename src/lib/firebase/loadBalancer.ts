import { Firestore } from 'firebase/firestore';
import { dbA } from './projectA';
import { getOptionalDbB } from './projectB';

type ProjectKey = 'A' | 'B';

export let lastUsed: ProjectKey = 'A';
let failedProject: ProjectKey | null = null;
let failedAt: number | null = null;

const RECOVERY_MS = 60_000; // 1 minute before retry

export function getReadDb(): Firestore {
  const dbB = getOptionalDbB();
  if (!dbB) return dbA; // Fallback to A if B is not configured

  if (failedProject && failedAt && Date.now() - failedAt > RECOVERY_MS) {
    failedProject = null;
    failedAt = null;
  }

  if (failedProject === 'A') return dbB;
  if (failedProject === 'B') return dbA;

  // Sticky behavior: reuse lastUsed if it's healthy
  return lastUsed === 'A' ? dbA : dbB;
}

export function getWriteDb(): Firestore {
  return dbA;
}

export function getMirrorDb(): Firestore | null {
  return getOptionalDbB();
}

export function reportReadFailure(project: ProjectKey): void {
  failedProject = project;
  failedAt = Date.now();
  // Switch lastUsed upon failure
  lastUsed = project === 'A' ? 'B' : 'A';
  console.warn(`[LoadBalancer] Project ${project} marked unavailable. Switching to ${lastUsed}.`);
}
