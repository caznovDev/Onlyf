import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Free OnlyFans Leaks - freeonlyfans.qzz.io',
    template: '%s | FreeOF'
  },
  description: 'Free OnlyFans leaks and exclusive content. Explore professional creator profiles, exclusive 4K leaked videos, and trending OnlyFans content.',
  keywords: ['onlyfans leaks', 'free onlyfans', 'leaked onlyfans', '4K content', 'creator hub', 'professional models', 'FreeOF'],
  authors: [{ name: 'FreeOF Team' }],
  creator: 'FreeOF',
  publisher: 'FreeOF',
  metadataBase: new URL('https://freeonlyfans.qzz.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freeonlyfans.qzz.io',
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
        <Script id="popads-script" strategy="afterInteractive" data-cfasync="false">
          {`
            (function(){var x=window,a="da721a2a20b707917e57c21275a04e25",v=[["siteId",307+915*779-420*103+4621553],["minBid",0],["popundersPerIP","3:1,1:1"],["delayBetween",300],["default","PHNjcmlwdCBzcmM9Imh0dHBzOi8vcGwzMDIzMDg3MS5lZmZlY3RpdmVjcG1uZXR3b3JrLmNvbS85Ni80Ni9iMy85NjQ2YjMyMDc0ZGI5MTUwMDU2NGQ2OGFmYTA3MGRhMi5qcyI+PC9zY3JpcHQ+DQo="],["defaultPerDay",3],["topmostLayer","auto"]],d=["d3d3LmludGVsbGlnZW5jZWFkeC5jb20veWNvbnRlbnQtdG9vbHMubWluLmNzcw==","ZDJrbHg4N2Jnem5nY2UuY2xvdWRmcm9udC5uZXQvalNJVy9pcmVzdW1hYmxlLm1pbi5qcw=="],f=-1,q,c,p=function(){clearTimeout(c);f++;if(d[f]&&!(1809252774000<(new Date).getTime()&&1<f)){q=x.document.createElement("script");q.type="text/javascript";q.async=!0;var r=x.document.getElementsByTagName("script")[0];q.src="https://"+atob(d[f]);q.crossOrigin="anonymous";q.onerror=p;q.onload=function(){clearTimeout(c);x[a.slice(0,16)+a.slice(0,16)]||p()};c=setTimeout(p,5E3);r.parentNode.insertBefore(q,r)}};if(!x[a]){try{Object.freeze(x[a]=v)}catch(e){}p()}})();
          `}
        </Script>
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