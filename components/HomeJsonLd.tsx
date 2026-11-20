import { DEFAULT_DESCRIPTION, OG_IMAGE_PATH, SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";

export const HOME_FAQS = [
  {
    q: "Is CV Matters really free?",
    a: "Yes — you can build and edit up to two resumes, preview every ATS-friendly template live, tailor copy to a job post, and publish a shareable cvmatters.net/your-name link for free.",
  },
  {
    q: "Can I download a PDF?",
    a: "Yes. Clean, text-selectable PDF downloads and unlimited CVs are unlocked with a Monthly or Yearly plan. You can preview the exact final page before upgrading.",
  },
  {
    q: "Are the templates ATS-friendly?",
    a: "Every template uses a clean text hierarchy, standard section headings (Summary, Experience, Education, Skills), and real selectable text so Applicant Tracking Systems parse it reliably.",
  },
  {
    q: "What payment methods and currencies are supported?",
    a: "Paid plans are billed in Indian Rupees (INR, ₹) through Cashfree Payments. Checkout accepts UPI, domestic and international credit/debit cards, and Indian net banking.",
  },
  {
    q: "How does the shareable online resume link work?",
    a: "From your profile, claim a unique username to get a clean link like cvmatters.net/your-name. Edit your resume anytime and the live link updates automatically — no outdated PDF versions.",
  },
  {
    q: "Can I upload my existing CV instead of typing from scratch?",
    a: "Yes. On the Start page you can upload a PDF, DOCX, or TXT resume and we extract your sections into the editor automatically, or start from a LinkedIn profile link.",
  },
] as const;

export function HomeJsonLd() {
  const logo = siteUrl("/icon-192.png");
  const og = siteUrl(OG_IMAGE_PATH);
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
        image: og,
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
        image: og,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: HOME_FAQS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
