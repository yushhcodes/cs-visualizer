import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://visualizer.yushh.tech/";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID as string;


export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────
  title: {
    default: "CS Visualizer — Visualize Any Algorithm Instantly",
    template: "%s | CS Visualizer",
  },
  description:
    "Visualize any computer science concept instantly. Type an algorithm or data structure — Binary Search, Merge Sort, BST, BFS — and watch it animate step by step. Powered by Groq AI + D3.js.",

  // ── Keywords ──────────────────────────────────────────────────
  keywords: [
    "algorithm visualizer",
    "data structure visualizer",
    "CS concepts visualization",
    "binary search animation",
    "sorting algorithm animation",
    "learn algorithms",
    "computer science education",
    "AI algorithm explainer",
    "D3.js algorithm",
    "groq AI visualization",
    "BST visualizer",
    "BFS DFS animation",
    "merge sort visualization",
    "quick sort visualization",
    "hash table visualizer",
  ],

  // ── Authors / Publisher ───────────────────────────────────────
  authors: [{ name: "Yushh" }],
  creator: "Yushh",
  publisher: "Yushh",

  // ── Canonical URL ─────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  // ── Open Graph (for link previews on Facebook, LinkedIn, etc.) ─
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "CS Visualizer",
    title: "CS Visualizer — Visualize Any Algorithm Instantly",
    description:
      "Type any CS concept and watch it animate step by step. Binary Search, Merge Sort, BST, BFS and more — powered by Groq AI + D3.js.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`, // create a 1200×630 image and put it in /public
        width: 1200,
        height: 630,
        alt: "CS Visualizer — Algorithm Visualization Tool",
      },
    ],
  },

  // ── Twitter Card ──────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "CS Visualizer — Visualize Any Algorithm Instantly",
    description:
      "Type any CS concept and watch it animate step by step. Powered by Groq AI + D3.js.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@yushhcodes", // uncomment and add your handle
  },

  // ── Robots ────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Verification (add these once you set up each service) ─────
  // verification: {
  //   google: 'your-google-site-verification-token',
  //   yandex: 'your-yandex-verification-token',
  // },

  // ── Category ──────────────────────────────────────────────────
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        ></Script>
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_ID}');`}
        </Script>
        <link rel="icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
