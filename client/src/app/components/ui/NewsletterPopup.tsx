'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export default function NewsletterPopup({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className={`modal-overlay--newsletter ${!isOpen && 'opacity-0 pointer-events-none'}`}>
      <div className="modal-content--newsletter">
        <button onClick={onClose} className="modal-close">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="newsletter-title">Subscribe to our Newsletter</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="newsletter-input"
            required
          />
          <button type="submit" className="newsletter-submit">
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
