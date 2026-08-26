import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer REST API Documentation | FreeOF',
  description: 'Complete API reference and documentation for FreeOF developer endpoints.',
  alternates: {
    canonical: '/docs/api',
  },
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
