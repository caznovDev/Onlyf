
import React from 'react';
import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ProVideo - Professional Video Platform',
    template: '%s | ProVideo'
  },
  description: 'The world\'s leading professional video platform for high-quality content and creators.',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://provideo.com'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://provideo.com',
    siteName: 'ProVideo',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@provideo',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
