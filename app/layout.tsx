import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'FreeOF - Professional Video Platform & Creator Hub',
    template: '%s | FreeOF'
  },
  description: 'FreeOF is a high-quality cinematic video platform. Explore professional creator profiles, exclusive 4K videos, and trending content.',
  keywords: ['video platform', 'cinematic videos', '4K content', 'creator hub', 'professional models', 'FreeOF'],
  authors: [{ name: 'FreeOF Team' }],
  creator: 'FreeOF',
  publisher: 'FreeOF',
  metadataBase: new URL('https://freeof.qzz.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freeof.qzz.io',
    siteName: 'FreeOF',
    title: 'FreeOF - Professional Video Platform',
    description: 'High-quality cinematic video content platform. Explore professional models and exclusive 4K videos.',
    images: [
      {
        url: '/og-image.jpg', // Assuming an OG image exists or will be added
        width: 1200,
        height: 630,
        alt: 'FreeOF Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeOF - Professional Video Platform',
    description: 'High-quality cinematic video content platform. Explore professional models and exclusive 4K videos.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'O-vJtP-OhE8i9lTJN6dEdHovd_djuMjw4olCZL9dNbw',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}