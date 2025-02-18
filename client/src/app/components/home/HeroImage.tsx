'use client';

import Image from 'next/image';
import heroImage from '@/app/assets/images/simona-sergi-H3M8tTU5UOI-unsplash.jpg';

export default function HeroImage() {
  return (
    <Image 
        src={heroImage}
        alt="Hero"
        fill
        className="object-contain"
        priority
      />
  );
}