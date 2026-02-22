import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, baseUrl }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show on each side of current page

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = currentPage - delta;
      const right = currentPage + delta;
      const range: number[] = [];

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= left && i <= right)) {
          range.push(i);
        }
      }

      let l: number | undefined;
      for (const i of range) {
        if (l !== undefined) {
          if (i - l === 2) {
            pages.push(l + 1);
          } else if (i - l !== 1) {
            pages.push('...');
          }
        }
        pages.push(i);
        l = i;
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-1 md:gap-2 mt-12 pb-8 flex-wrap">
      {pages.map((page, i) => {
        if (page === '...') {
          return (
            <span key={`gap-${i}`} className="px-2 text-slate-600 font-bold">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isCurrent = currentPage === pageNum;
        const href = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${pageNum}`;

        return (
          <Link
            key={pageNum}
            href={href}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold border text-sm transition-all ${
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