export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  duration: string;
  level: string;
  price: number;
  category: CourseCategory;
  badge?: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  isPinned?: boolean;
  highlights?: string[];
  pinnedOfferId?: string;
  feeStructure?: {
    registrationFee?: string;
    totalFee?: string;
    duration?: string;
    description?: string;
  };
}

export interface StoredImage {
  url:        string;
  thumbUrl:   string;
  deleteUrl:  string;
  imgbbId:    string;
  uploadedAt: string;
}

export type CourseCategory =
  | 'chip-level'
  | 'laptop-chip-level'
  | 'mobile-chip-level'
  | 'hardware'
  | 'electronics'
  | 'cctv'
  | 'networking'
  | 'ethical-hacking';

export type BlogCategory =
  | 'all'
  | 'repairing'
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

export type StockCategory = 'ic' | 'mosfet';

export interface StockHistory {
  id?: string;
  stockId: string;
  stockName: string;
  personName: string;
  change: number;
  timestamp: string;
}

export interface StockItem {
  id?: string;
  name: string;
  quantity: number;
  boardNumber?: string;
  onBox?: string;
  category: StockCategory;
  lastUpdated: string;
}

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
  lastDoc: any | null;
  hasMore: boolean;
}
