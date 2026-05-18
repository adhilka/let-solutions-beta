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
}

export default function SEO({ 
  title, 
  description, 
  keywords,
  canonical, 
  ogType = 'website', 
  ogImage = 'https://i.ibb.co/SXRGw6x8/logo.png',
  structuredData,
  noindex = false
}: SEOProps) {
  const location = useLocation();
  const siteName = 'Let Solutions';
  
  // Forced noindex for protected paths
  const protectedPaths = ['/admin', '/login', '/status', '/design-system', '/admin-manual'];
  const isForcedNoIndex = noindex || protectedPaths.some(path => location.pathname.startsWith(path));
  const fullTitle = title ? (title.includes(siteName) ? title : `${title} | ${siteName}`) : `Let Solutions | Top Technical Institute in Tirur, Kerala`;
  const defaultDescription = 'Let Solutions is the premier technical institute in Tirur, Kerala, offering expert courses in smartphone repair, laptop chip-level training, networking, and CCTV systems.';
  const metaDescription = description || defaultDescription;
  
  // Refined keywords for better SEO ranking
  const defaultKeywords = 'technical institute, smartphone repair course, chip level training Kerala, laptop service course, CCTV technician training, networking course Tirur, vocational training Kerala, Let Solutions Tirur';
  const metaKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  
  const baseUrl = 'https://letsolutions.in';
  const fullCanonical = canonical ? (canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`) : baseUrl;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Let Solutions Technical Institute",
    "url": "https://letsolutions.in",
    "logo": "https://i.ibb.co/SXRGw6x8/logo.png",
    "image": "https://i.ibb.co/SXRGw6x8/logo.png",
    "description": defaultDescription,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1st Floor, Bus Stand Building",
      "addressLocality": "Tirur",
      "addressRegion": "Malappuram",
      "postalCode": "676101",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9562854444",
      "contactType": "customer service",
      "availableLanguage": ["English", "Malayalam", "Hindi"]
    },
    "sameAs": [
      "https://www.instagram.com/letsolutions",
      "https://www.facebook.com/letsolutions"
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
      {isForcedNoIndex && <meta name="robots" content="noindex, nofollow" />}
      {!isForcedNoIndex && <meta name="robots" content="index, follow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
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
