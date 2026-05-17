import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'course';
  ogImage?: string;
  structuredData?: object;
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
  const siteName = 'Let Solutions';
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
      "telephone": "+91-1234567890", // Placeholder or from settings if available
      "contactType": "customer service"
    },
    "sameAs": [
      "https://www.instagram.com/letsolutions",
      "https://www.facebook.com/letsolutions"
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <link rel="canonical" href={fullCanonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
}
