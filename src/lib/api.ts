import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, startAfter, DocumentData, QuerySnapshot, Firestore } from 'firebase/firestore';
import { getReadDb, reportReadFailure, lastUsed } from './firebase/loadBalancer';
import { PaginatedResult } from '../types';

// Helper to convert Firestore docs
export const docToData = <T>(docSnapshot: any): T => ({
  id: docSnapshot.id,
  ...docSnapshot.data()
} as T);

// Timeout helper for Firestore calls
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 20000): Promise<T> {
  let timer: any;
  let finished = false;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error(`FIRESTORE_TIMEOUT_${timeoutMs}ms`));
      }
    }, timeoutMs);
  });

  return Promise.race([
    promise.then(res => {
      if (finished) return res;
      finished = true;
      clearTimeout(timer);
      return res;
    }).catch(err => {
      if (finished) {
        console.warn('Late Firestore error silenced:', err);
        return undefined as any; 
      }
      finished = true;
      clearTimeout(timer);
      throw err;
    }),
    timeoutPromise
  ]);
}

async function withFailover<T>(operation: (db: Firestore) => Promise<T>): Promise<T> {
  const db = getReadDb();
  const currentProject = lastUsed;
  try {
    return await withTimeout(operation(db));
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    console.error(`[withFailover] Error on project ${currentProject}:`, errorMsg);
    
    // Only failover on timeout or connection issues
    const isRetryable = errorMsg.includes('FIRESTORE_TIMEOUT') || 
                       err.code === 'unavailable' || 
                       errorMsg.toLowerCase().includes('failed-precondition') ||
                       errorMsg.toLowerCase().includes('offline');

    if (isRetryable) {
      reportReadFailure(currentProject);
      const nextDb = getReadDb();
      const nextProject = lastUsed;
      console.log(`[withFailover] Project ${currentProject} failed. Retrying with project ${nextProject}...`);
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

export async function fetchHomeContent() {
  return fetchSettings('home');
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
        where('approved', '==', true)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => docToData<any>(doc));
      
      // Sort in JS to prioritize pictured testimonials and latest first
      return data.sort((a, b) => {
        // First priority: Presence of profile picture
        const hasImageA = !!a.imageUrl;
        const hasImageB = !!b.imageUrl;
        if (hasImageA !== hasImageB) {
          return hasImageA ? -1 : 1;
        }

        // Second priority: Recency
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }).slice(0, 10); // Take top 10 for home page slider
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

export async function fetchDashboardStats() {
  try {
    return await withFailover(async (db) => {
      const projects = [
        getDocs(query(collection(db, 'artifacts/tech-institute/public/data/courses'))),
        getDocs(query(collection(db, 'artifacts/tech-institute/public/data/enquiries'))),
        getDocs(query(collection(db, 'artifacts/tech-institute/public/data/testimonials'))),
        getDocs(query(collection(db, 'artifacts/tech-institute/public/data/offers'), where('showOnAdmissions', '==', true)))
      ];
      
      const [courses, enquiries, testimonials, offers] = await Promise.all(projects);
      
      return {
        courses: courses.size,
        enquiries: enquiries.size,
        testimonials: testimonials.size,
        offers: offers.size
      };
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return { courses: 0, enquiries: 0, testimonials: 0, offers: 0 };
  }
}

export async function fetchRecentEnquiries(limitCount: number = 5) {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/enquiries'),
        orderBy('submittedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching recent enquiries:", err);
    return [];
  }
}

export async function fetchLatestPosts() {
  try {
    return await withFailover(async (db) => {
      // We still want only published posts
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/posts'), 
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => docToData<any>(doc));
      
      // Sort in JS to handle documents missing publishedAt
      return data.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      }).slice(0, 12); // Limit to top 12
    });
  } catch (err) {
    console.error("Error fetching latest posts:", err);
    return [];
  }
}

export async function fetchGalleryImages() {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/gallery'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching gallery images:", err);
    return [];
  }
}

export async function fetchAllStocks() {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/stocks'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching all stocks:", err);
    return [];
  }
}

export async function fetchStockHistory() {
  try {
    return await withFailover(async (db) => {
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/stock_history'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    });
  } catch (err) {
    console.error("Error fetching stock history:", err);
    return [];
  }
}
