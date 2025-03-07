'use client';

import Image from 'next/image';
import homeSection1Img from '@/assets/images/homeSection1Img.jpg';
import homeSection2Img from '@/assets/images/homeSection2Img.jpg';

export function HomeSection1() {
    return <Image src={homeSection1Img} alt="Hero" fill className="object-cover" priority />;
}

export function HomeSection2() {
    return <Image src={homeSection2Img} alt="Hero" fill className="object-cover" priority />;
}