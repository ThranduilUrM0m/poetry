'use client';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="hamburger-btn"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className="hamburger-btn__lines">
        <span className={`hamburger-btn__line ${isOpen ? 'is-open' : ''}`} />
        <span className={`hamburger-btn__line ${isOpen ? 'is-open' : ''}`} />
      </div>
    </button>
  );
}
