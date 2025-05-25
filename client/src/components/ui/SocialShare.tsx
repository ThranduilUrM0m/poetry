// components/SocialShare.tsx
'use client';

import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaShare } from "react-icons/fa";

export interface SocialShareProps {
    title: string;
    description?: string;
    /** Optional className for container styling */
    className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
    title,
    description = '',
    className = '',
}) => {
    // Compute absolute URL at render time
    const href = typeof window !== 'undefined' ? window.location.href : '';

    const encodedUrl = encodeURIComponent(href);
    const encodedTitle = encodeURIComponent(title);
    /* const encodedDesc = encodeURIComponent(description); */

    // Standard share URLs
    const services = [
        {
            name: 'FaXTwitter',
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            icon: <FaXTwitter size={20} />,
        },
        {
            name: 'FaFacebookF',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: <FaFacebookF size={20} />,
        },
        {
            name: 'LinkedIn',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            icon: <FaLinkedinIn size={20} />,
        },
        {
            name: 'WhatsApp',
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            icon: <FaWhatsapp size={20} />,
        },
        {
            name: 'Copy Link',
            action: async () => {
                await navigator.clipboard.writeText(href);
                alert('Link copied to clipboard');
            },
            icon: <LinkIcon size={20} />,
        },
    ];

    // If the Web Share API is available (mobile), prepend a native share button
    const canWebShare = typeof navigator !== 'undefined' && !!navigator.share;
    if (canWebShare) {
        services.unshift({
            name: 'Share…',
            action: async () => {
                try {
                    await navigator.share({ title, text: description, url: href });
                } catch {
                    /* user cancelled or unsupported */
                }
            },
            icon: <FaShare size={20} />,
        });
    }

    return (
        <div className={`social-share ${className}`}>
            {services.map((svc) =>
                'url' in svc ? (
                    <a
                        key={svc.name}
                        href={svc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share on ${svc.name}`}
                        className="social-share__button"
                    >
                        {svc.icon}
                    </a>
                ) : (
                    <button
                        key={svc.name}
                        onClick={svc.action}
                        aria-label={svc.name}
                        className="social-share__button"
                    >
                        {svc.icon}
                    </button>
                )
            )}
        </div>
    );
};
