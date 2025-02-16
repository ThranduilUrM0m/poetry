'use client';

import Image from 'next/image';

export default function HeroImage() {
  return (
    <Image 
      src="/poet-image.jpg"
      alt="Ahmed El-Sayed"
      fill
      className="object-cover"
      sizes="25vw"
      priority
    />
  );
}