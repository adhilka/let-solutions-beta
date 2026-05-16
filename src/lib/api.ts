import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, startAfter, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { getReadDb } from './firebase/loadBalancer';
import { PaginatedResult } from '../types';

// Helper to convert Firestore docs
export const docToData = <T>(docSnapshot: any): T => ({
  id: docSnapshot.id,
  ...docSnapshot.data()
} as T);

export async function fetchActiveCourses() {
  try {
    const db = getReadDb();
    const q = query(collection(db, 'artifacts/tech-institute/public/data/courses'), where('isActive', '==', true), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToData<any>(doc));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchCourseBySlug(slug: string) {
  try {
    const db = getReadDb();
    const q = query(collection(db, 'artifacts/tech-institute/public/data/courses'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return docToData<any>(snapshot.docs[0]);
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchSettings(documentId: string) {
  try {
    const db = getReadDb();
    const d = await getDoc(doc(db, `artifacts/tech-institute/public/data/settings/${documentId}`));
    if (d.exists()) return d.data();
    return null;
  } catch (e) {
    console.error(`Failed to fetch settings/${documentId}`, e);
    return null;
  }
}

export async function fetchActiveOffers() {
  const db = getReadDb();
  const q = query(
    collection(db, 'artifacts/tech-institute/public/data/offers'), 
    where('showOnAdmissions', '==', true),
    orderBy('order', 'asc')
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToData<any>(doc));
  } catch (err) {
    console.error("Error fetching active offers:", err);
    return [];
  }
}

export async function fetchFeaturedTestimonials() {
  const db = getReadDb();
  const q = query(
    collection(db, 'artifacts/tech-institute/public/data/testimonials'), 
    where('approved', '==', true),
    orderBy('createdAt', 'desc'),
    limit(6)
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToData<any>(doc));
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    return [];
  }
}

export async function fetchLatestPosts() {
  const db = getReadDb();
  const q = query(
    collection(db, 'artifacts/tech-institute/public/data/posts'), 
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(3)
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToData<any>(doc));
  } catch {
    return [];
  }
}
