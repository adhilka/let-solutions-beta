import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'course';
  ogImage?: string;
  structuredData?: object;
}

export default function SEO({ 
  title, 
  description, 
  canonical, 
  ogType = 'website', 
  ogImage = 'https://i.ibb.co/SXRGw6x8/logo.png',
  structuredData 
}: SEOProps) {
  const siteName = 'Let Solutions Technical Institute';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Let Solutions Technical Institute offers industry-leading training in chip-level engineering, smartphone repair, networking, and CCTV systems in Tirur, Kerala.';
  const metaDescription = description || defaultDescription;
  const baseUrl = 'https://letsolutions.in';
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={fullCanonical} />

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
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
