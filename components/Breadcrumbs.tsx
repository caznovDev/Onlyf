import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Breadcrumb } from '../types';

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap py-1 no-scrollbar" aria-label="Breadcrumb">
      <Link 
        href="/"
        className="hover:text-white transition-colors flex items-center gap-1 shrink-0"
      >
        <Home size={14} /> Home
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="flex-shrink-0 text-slate-700" />
          <Link
            href={item.href}
            className={`hover:text-white transition-colors shrink-0 ${
              index === items.length - 1 ? 'text-slate-300 font-medium' : ''
            }`}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;