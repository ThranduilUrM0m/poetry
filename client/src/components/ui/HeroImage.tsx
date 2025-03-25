'use client';

import Image from 'next/image';
import homeSection1Img from '@/assets/images/homeSection1Img.jpg';
import homeSection2Img from '@/assets/images/homeSection2Img.jpg';
import aboutSection1Img from '@/assets/images/aboutSection1Img.jpg';
import blogSection1Svg from '@/assets/images/undraw_4.svg'

export function HomeSection1() {
    return <Image src={homeSection1Img} alt="Hero" fill className="object-cover" priority />;
}

export function HomeSection2() {
    return <Image src={homeSection2Img} alt="Hero" fill className="object-cover" priority />;
}

export function AboutSection1() {
    return <Image src={aboutSection1Img} alt="Hero" fill className="object-cover" priority />;
}

export function BlogSection1() {
    return <Image src={blogSection1Svg} alt="Hero" fill className="object-cover" priority />;
}