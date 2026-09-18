import React, { useEffect } from 'react';

export interface SeoHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  canonicalUrl?: string;
  priceAmount?: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock';
  brand?: string;
  sku?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * ReactHelmet
 * Dynamic document head manager without bulky external dependencies,
 * fully compatible with React 18 & 19, strict CSP, and iframe execution.
 * Dynamically updates document.title, standard meta tags, OpenGraph,
 * Twitter Cards, and Schema.org JSON-LD microdata for search engines and social previews.
 */
export const ReactHelmet: React.FC<SeoHelmetProps> = ({
  title = 'A-R Styles | Contemporary Elegance, Luxury Pret, Watches & Artisanal Eastern Fashion',
  description = 'Luxury Pakistani & Eastern couture boutique featuring contemporary pret, unstitched collections, heirloom bridal formals, luxury timepieces & watches, and statement accessories.',
  keywords = 'A-R Styles, Pakistani designer clothes, luxury watches, eastern bridal wear, chiffon suits, raw silk pret, artisanal jewelry, velvet ghararas, watches online Pakistan',
  ogTitle,
  ogDescription,
  ogImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
  ogType = 'website',
  canonicalUrl,
  priceAmount,
  priceCurrency = 'PKR',
  availability = 'InStock',
  brand = 'A-R Styles',
  sku,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Title
    const finalTitle = title.includes('A-R Styles') ? title : `${title} | A-R Styles`;
    document.title = finalTitle;

    // Helper to safely set or create a <meta> tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, contentValue?: string) => {
      if (!contentValue) return;
      let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.content = contentValue;
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'author', 'A-R Styles Couture & Timepieces');
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large');

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', ogTitle || finalTitle);
    setMetaTag('property', 'og:description', ogDescription || description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'A-R Styles');

    const currentHref = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (currentHref) {
      setMetaTag('property', 'og:url', currentHref);

      // Canonical link
      let linkCanonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.rel = 'canonical';
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = currentHref;
    }

    // 4. Product-specific OpenGraph meta tags
    if (ogType === 'product' && priceAmount !== undefined) {
      setMetaTag('property', 'product:price:amount', priceAmount.toString());
      setMetaTag('property', 'product:price:currency', priceCurrency);
      setMetaTag('property', 'product:availability', availability === 'InStock' ? 'in stock' : 'out of stock');
      setMetaTag('property', 'product:brand', brand);
    }

    // 5. Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', ogTitle || finalTitle);
    setMetaTag('name', 'twitter:description', ogDescription || description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Schema.org JSON-LD Structured Data
    const SCRIPT_ID = 'ar-styles-seo-structured-data';
    let scriptEl = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = SCRIPT_ID;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    // Compute structured data payload
    const structuredPayload = jsonLd
      ? jsonLd
      : ogType === 'product' && priceAmount !== undefined
      ? {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: title,
          image: [ogImage],
          description: description,
          sku: sku || 'ARS-GENERIC',
          brand: {
            '@type': 'Brand',
            name: brand,
          },
          offers: {
            '@type': 'Offer',
            url: currentHref,
            priceCurrency: priceCurrency,
            price: priceAmount,
            availability: availability === 'InStock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: 'A-R Styles',
            },
          },
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'ClothingStore',
          name: 'A-R Styles',
          alternateName: 'A-R Styles Couture, Watches & Accessories',
          url: currentHref,
          logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
          description: description,
          priceRange: 'PKR 7,500 - PKR 150,000',
          currenciesAccepted: 'PKR, USD',
          paymentAccepted: 'Cash on Delivery, Bank Transfer, JazzCash, EasyPaisa, Debit/Credit Card',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'A-R Styles Catalog',
            itemListElement: [
              { '@type': 'OfferCatalog', name: 'Pret / Ready-to-Wear' },
              { '@type': 'OfferCatalog', name: 'Unstitched 3-Piece Edit' },
              { '@type': 'OfferCatalog', name: 'Formal & Bridal Couture' },
              { '@type': 'OfferCatalog', name: 'Luxury Timepieces & Watches' },
              { '@type': 'OfferCatalog', name: 'Statement Clutches & Jewelry Accessories' },
            ],
          },
        };

    scriptEl.textContent = JSON.stringify(structuredPayload);
  }, [
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    canonicalUrl,
    priceAmount,
    priceCurrency,
    availability,
    brand,
    sku,
    jsonLd,
  ]);

  return null;
};
