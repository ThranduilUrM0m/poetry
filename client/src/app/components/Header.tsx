'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import SideMenu from './navigation/SideMenu';
import SearchModal from './navigation/SearchModal';
import NewsletterPopup from './navigation/NewsletterPopup';
import HamburgerButton from './ui/HamburgerButton';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <header className='header'>
      <nav className='header__nav'>
        <Link href="/" className="header__logo">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
        </Link>

        <div className="header__actions">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="search-btn"
          >
            <Search className="w-5 h-5 text-primary-900" strokeWidth={1.5} />
          </button>
          <HamburgerButton 
            isOpen={isMenuOpen} 
            onClick={handleMenuToggle}
          />
        </div>
      </nav>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NewsletterPopup 
        isOpen={showNewsletter} 
        onClose={() => setShowNewsletter(false)} 
      />
    </header>
  );
}
