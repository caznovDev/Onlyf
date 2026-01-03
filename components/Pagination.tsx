import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, baseUrl }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-12 pb-8">
      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNum = i + 1;
        const isCurrent = currentPage === pageNum;
        
        // Build URL: handle existing query params if needed, but here we assume simple structure
        const href = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${pageNum}`;

        return (
          <Link
            key={pageNum}
            href={href}
            className={`px-4 py-2 rounded-lg font-bold border transition-all ${
              isCurrent
                ? 'bg-rose-500 border-rose-500 text-white cursor-default'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
            }`}
          >
            {pageNum}
          </Link>
        );
      })}
    </div>
  );
};

export default Pagination;