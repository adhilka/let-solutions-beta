export interface StoredImage {
  url:        string;
  thumbUrl:   string;
  deleteUrl:  string;
  imgbbId:    string;
  uploadedAt: string;   // ISO 8601
}

export type CourseCategory =
  | 'chip-level'
  | 'laptop-chip-level'
  | 'mobile-chip-level'
  | 'hardware'
  | 'software'
  | 'cctv'
  | 'networking';

export type BlogCategory =
  | 'hardware-tips'
  | 'software-guides'
  | 'chip-level'
  | 'cctv-networking'
  | 'career-advice'
  | 'institute-news'
  | 'industry-updates';

export type EnquiryStatus = 'new' | 'contacted' | 'enrolled' | 'closed';
export type PostStatus     = 'draft' | 'published' | 'archived';
export type OfferType      = 'admission' | 'discount' | 'batch' | 'notice';
export type GalleryCategory = 'lab' | 'events' | 'students' | 'certificates' | 'other';

export interface Testimonial {
  id?: string;
  name: string;
  course: string;
  batch?: string;
  content: string;
  rating: number; // 1 to 5
  imageUrl?: string;
  videoUrl?: string; // e.g. youtube link
  approved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data:    T[];
  lastDoc: any | null; // Using any to avoid direct Firestore SDK dependency in types
  hasMore: boolean;
}
