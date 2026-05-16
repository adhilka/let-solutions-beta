import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, startAfter, DocumentData, QuerySnapshot, Firestore } from 'firebase/firestore';
import { getReadDb, reportReadFailure, lastUsed } from './firebase/loadBalancer';
import { PaginatedResult } from '../types';

// Helper to convert Firestore docs
export const docToData = <T>(docSnapshot: any): T => ({
  id: docSnapshot.id,
  ...docSnapshot.data()
} as T);

// Timeout helper for Firestore calls
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), timeoutMs);
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

async function withFailover<T>(operation: (db: Firestore) => Promise<T>): Promise<T> {
  const db = getReadDb();
  const currentProject = lastUsed;
  try {
    return await withTimeout(operation(db));
  } catch (err: any) {
    console.error(`[withFailover] Error on project ${currentProject}:`, err);
    
    // Only failover on timeout or connection issues
    const isRetryable = err.message === 'FIRESTORE_TIMEOUT' || 
                       err.code === 'unavailable' || 
                       err.message?.includes('failed-precondition') ||
                       err.message?.includes('offline');

    if (isRetryable) {
      reportReadFailure(currentProject);
      const nextDb = getReadDb();
      console.log(`[withFailover] Retrying with opposite project...`);
      return await withTimeout(operation(nextDb));
    }
    throw err;
  }
}

export async function fetchAllCourses() {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/courses'), 
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching all courses:", err);
    return [];
  }
}

export async function fetchActiveCourses() {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/courses'), 
        where('isActive', '==', true), 
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching active courses:", err);
    return [];
  }
}

export async function fetchCourseBySlug(slug: string) {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/courses'), 
        where('slug', '==', slug), 
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return docToData<any>(snapshot.docs[0]);
    });
  } catch (err) {
    console.error("Error fetching course by slug:", err);
    return null;
  }
}

export async function fetchSettings(documentId: string) {
  try {
    return await withFailover(async (db) => {
      const d = await getDoc(doc(db, `artifacts/tech-institute/public/data/settings/${documentId}`));
      if (d.exists()) return d.data();
      return null;
    });
  } catch (e) {
    console.error(`Failed to fetch settings/${documentId}`, e);
    return null;
  }
}

export async function fetchAboutData() {
  return fetchSettings('about');
}

export async function fetchActiveOffers() {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/offers'), 
        where('showOnAdmissions', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching active offers:", err);
    return [];
  }
}

export async function fetchFeaturedTestimonials() {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/testimonials'), 
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    return [];
  }
}

export async function fetchPostBySlug(slug: string) {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/posts'), 
        where('slug', '==', slug), 
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return docToData<any>(snapshot.docs[0]);
    });
  } catch (err) {
    console.error("Error fetching post by slug:", err);
    return null;
  }
}

export async function fetchLatestPosts() {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/posts'), 
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching latest posts:", err);
    return [];
  }
}
