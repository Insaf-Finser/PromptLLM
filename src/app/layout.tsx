import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Providers } from "./providers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptdesk.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PromptDesk — version and eval-test your LLM prompts",
    template: "%s · PromptDesk",
  },
  description:
    "Save prompt versions, run them against real test cases, and see pass rates before you ship a change.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PromptDesk — version and eval-test your LLM prompts",
    description:
      "Save prompt versions, run them against real test cases, and see pass rates before you ship a change.",
    url: SITE_URL,
    siteName: "PromptDesk",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PromptDesk — prompt versioning and eval dashboards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptDesk — version and eval-test your LLM prompts",
    description:
      "Save prompt versions, run them against real test cases, and see pass rates before you ship a change.",
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PromptDesk",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // Server-rendered, never client-injected after hydration.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
