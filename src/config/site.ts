/**
 * Site-wide configuration values
 * This file contains runtime configuration values for the site
 */

export const siteConfig = {
  // Basic site information
  name: "Amateur Radio Exam Prep",
  description: "An exam preparation tool for Canadian ISED basic amateur radio licensing exams.",

  // URLs
  url: "https://radio.frasernolet.com",
  githubRepo: "https://github.com/hypnoseal/amateur-basic-exam-prep",
  githubBranch: "master",

  // Metadata
  author: "hypnoseal",
  keywords: ["amateur radio", "ham radio", "exam prep", "ISED", "Canadian", "license"],

  // Features
  features: [
    "Interactive quiz questions",
    "Lesson content for each question",
    "Responsive design for mobile and desktop",
    "Full-text search for questions and lesson content"
  ],

  // SEO Configuration
  seo: {
    // Default title template - %s is replaced with the page title
    titleTemplate: "%s | Amateur Radio Exam Prep",

    // Default meta tags
    defaultMetaTags: {
      robots: "index, follow",
      themeColor: "rgb(249, 250, 251)",
    },

    // Open Graph metadata (for social media sharing)
    openGraph: {
      type: "website",
      locale: "en_CA",
      siteName: "Amateur Radio Exam Prep",
      imageUrl: "/og-image.png",
      imageAlt: "Amateur Radio Exam Prep logo",
      imageWidth: "1200",
      imageHeight: "630",
    },

    // Twitter Card metadata
    twitter: {
      cardType: "summary_large_image",
      handle: "@hypnoseal", // Replace with actual Twitter handle if available
    },
  },
};
