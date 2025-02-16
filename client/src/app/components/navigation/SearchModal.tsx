'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export default function SearchModal({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="fixed inset-x-0 top-0 bg-white p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
        
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-2xl mx-auto block border-b-2 border-gray-200 py-2 px-4 outline-none focus:border-blue-500"
        />
        
        <div className="max-w-2xl mx-auto mt-6">
          {/* Search results will go here */}
        </div>
      </div>
    </div>
  );
}
