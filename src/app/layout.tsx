import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://instant-bento.vercel.app"),
  title: {
    default: "Instant Bento | AI Portfolio Generator",
    template: "%s | Instant Bento",
  },
  description: "Create stunning, Awwwards-winning bento grid portfolios in seconds with AI. Just upload an image and describe yourself.",
  keywords: ["portfolio generator", "AI portfolio", "bento grid", "developer portfolio", "designer portfolio", "resume builder", "Next.js", "React"],
  authors: [{ name: "Instant Bento Team" }],
  creator: "Instant Bento",
  icons: {
    icon: "/bento-white.svg",
    shortcut: "/bento-white.svg",
    apple: "/bento-white.svg",
  },
  openGraph: {
    title: "Instant Bento | AI Portfolio Generator",
    description: "Generate your professional bento grid portfolio in seconds using AI.",
    url: "https://bentou.k4ris.com",
    siteName: "Instant Bento",
    images: [
      {
        url: "/bento-white.svg",
        width: 800,
        height: 600,
        alt: "Instant Bento Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instant Bento | AI Portfolio Generator",
    description: "Create stunning bento grid portfolios in seconds with AI.",
    images: ["/bento-white.svg"],
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
