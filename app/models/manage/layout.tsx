import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Models | FreeOF',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManageModelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
