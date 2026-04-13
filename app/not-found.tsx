import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h2 className="text-4xl font-black">404 - Not Found</h2>
      <p className="text-slate-400">The page you are looking for does not exist.</p>
      <Link href="/" className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-full font-bold transition-all">
        Return Home
      </Link>
    </div>
  );
}
