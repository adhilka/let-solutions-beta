import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'course';
  ogImage?: string;
  structuredData?: object | object[];
  noindex?: boolean;
  nofollow?: boolean;
}

export default function SEO({ 
  title, 
  description, 
  keywords,
  canonical, 
  ogType = 'website', 
  ogImage = '/images/banner.jpg',
  structuredData,
  noindex = false,
  nofollow = false
}: SEOProps) {
  const location = useLocation();
  const siteName = 'Let Solutions';
  
  // Forced noindex for protected paths
  const protectedPaths = ['/admin', '/login', '/status', '/design-system', '/admin-manual', '/servizio'];
  const isForcedNoIndex = noindex || protectedPaths.some(path => location.pathname.startsWith(path));
  const isForcedNoFollow = nofollow || protectedPaths.some(path => location.pathname.startsWith(path));
  const fullTitle = title ? (title.includes(siteName) ? title : `${title} | ${siteName}`) : `No.1 Laptop Chip Level & Cyber Security Course in Kerala | Let Solutions Tirur`;
  const defaultDescription = "Let Solutions is Kerala's No.1 technical training institute in Tirur, Malappuram. We offer premium, 100% practical courses in advanced Laptop Chip Level Repair, Cyber Security / Ethical Hacking, and Smartphone servicing with placement backup.";
  const metaDescription = description || defaultDescription;
  
  // Refined keywords for better SEO ranking
  const defaultKeywords = 'laptop chip level repairing course kerala, laptop servicing course malappuram, cyber security course kerala, ethical hacking course malappuram, junior penetration tester course tirur, mobile repairing course kerala, cctv course tirur, let solutions tirur';
  const metaKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  
  const baseUrl = 'https://letsolutions.in';
  const fullCanonical = canonical ? (canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`) : `${baseUrl}${location.pathname}`;
  
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
 
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Let Solutions Technical Institute",
    "url": "https://letsolutions.in",
    "logo": "https://letsolutions.in/images/banner.jpg",
    "image": "https://letsolutions.in/images/banner.jpg",
    "description": defaultDescription,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1st Floor, Bus Stand Building",
      "addressLocality": "Tirur",
      "addressRegion": "Malappuram, Kerala",
      "postalCode": "676101",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "10.9924",
      "longitude": "75.9248"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "382",
      "bestRating": "5",
      "worstRating": "1"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9562854444",
      "contactType": "customer service",
      "availableLanguage": ["English", "Malayalam", "Hindi"]
    },
    "sameAs": [
      "https://www.instagram.com/letsolutionstirur?igsh=d285MjcybDk0YWtw",
      "https://www.facebook.com/letsolutionstirur/",
      "https://youtube.com/@letsolutions223"
    ]
  };

  const schemas = Array.isArray(structuredData) 
    ? [defaultStructuredData, ...structuredData] 
    : structuredData 
      ? [defaultStructuredData, structuredData] 
      : [defaultStructuredData];

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <link rel="canonical" href={fullCanonical} />
      <link rel="shortcut icon" href="/fast-assets/favicon.ico" />
      <meta name="robots" content={`${isForcedNoIndex ? 'noindex' : 'index'}, ${isForcedNoFollow ? 'nofollow' : 'follow'}`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content="@letsolutions" />

      {/* Structured Data */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
