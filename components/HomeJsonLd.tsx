import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";

export function HomeJsonLd() {
  const logo = siteUrl("/icon-192.png");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: siteUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: logo,
          width: 192,
          height: 192,
        },
        image: logo,
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: siteUrl("/"),
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@type": "Organization", name: SITE_NAME, logo },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: siteUrl("/"),
        description: SITE_TAGLINE,
        image: logo,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
