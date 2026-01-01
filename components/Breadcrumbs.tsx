
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Breadcrumb } from '../types';

interface BreadcrumbsProps {
  items: Breadcrumb[];
  onNavigate: (path: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap py-1">
      <button 
        onClick={() => onNavigate('/')}
        className="hover:text-white transition-colors flex items-center gap-1"
      >
        <Home size={14} /> Home
      </button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="flex-shrink-0" />
          <button
            onClick={() => onNavigate(item.href)}
            className={`hover:text-white transition-colors ${
              index === items.length - 1 ? 'text-slate-300 font-medium' : ''
            }`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
