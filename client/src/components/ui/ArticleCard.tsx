'use client';

import React from 'react';
import { Hash } from 'lucide-react';
import { Article } from '@/types/article';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import _ from 'lodash';
import Link from 'next/link';
import { useMedia } from 'react-use';
import { normalizeString } from '@/utils/stringUtils';

interface ArticleCardProps {
    readonly article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const isSm = useMedia('(min-width: 640px)');
    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

    function sanitizeHtmlForPreview(html: string, maxLength?: number): string {
        if (!html) return '';
        let sanitized = html;

        // 1. Remove <p> or <div> that only contain a media element (img, video, iframe, a)
        sanitized = sanitized.replace(
            /<(p|div)[^>]*>\s*(<img[^>]*>|<video[^>]*>.*?<\/video>|<iframe[^>]*>.*?<\/iframe>|<a[^>]*>.*?<\/a>)\s*<\/\1>/gi,
            ''
        );

        // 2. Remove standalone media elements (not wrapped)
        sanitized = sanitized
            .replace(/<img[^>]*>/gi, '')
            .replace(/<video[^>]*>.*?<\/video>/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .replace(/<a[^>]*>.*?<\/a>/gi, '');

        // 3. Remove all tags except <br>, <p>, <b>, <i>, <strong>, <em>
        sanitized = sanitized.replace(/<(?!\/?(br|p|b|i|strong|em)\b)[^>]+>/gi, '');

        // 4. Remove empty paragraphs (including those with only whitespace or <br>)
        sanitized = sanitized.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

        // 5. Collapse multiple consecutive <br> into one
        sanitized = sanitized.replace(/(<br\s*\/?>\s*){2,}/gi, '<br>');

        // 6. Trim leading/trailing whitespace and <br>
        sanitized = sanitized.replace(/^(<br\s*\/?>)+/i, '').replace(/(<br\s*\/?>)+$/i, '');

        // 7. If maxLength is provided, truncate the text content (strip tags for preview)
        if (maxLength) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sanitized;
            let textContent = tempDiv.textContent || tempDiv.innerText || '';
            if (textContent.length > maxLength) {
                textContent = textContent.slice(0, maxLength).trim() + '...';
            }
            return textContent;
        }

        return sanitized;
    }

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return (
        <AnimatedWrapper as="div" className="article-card" config={smoothConfig}>
            <Link href={`/blog/${normalizeString(article.category)}/${article.slug}`}>
                <div className="meta">
                    {/* Author name span - only shows if firstName or lastName exists */}
                    {(article.author.firstName || article.author.lastName) && (
                        <span
                            lang={
                                containsArabic(
                                    // Safely combine first + last name with proper undefined handling
                                    [article.author?.firstName, article.author?.lastName]
                                        .filter((name) => !_.isEmpty(name)) // Remove empty/undefined names
                                        .join(' ')
                                )
                                    ? 'ar'
                                    : 'en'
                            }
                            className="author"
                        >
                            par{' '}
                            {[article.author.firstName, article.author.lastName]
                                .filter(Boolean)
                                .join(' ')}
                        </span>
                    )}

                    {/* Username span - only shows if username exists */}
                    {!_.isEmpty(article.author.username) && isSm && (
                        <span
                            lang={containsArabic(article.author.username) ? 'ar' : 'en'}
                            className="username"
                        >
                            @{article.author.username}
                        </span>
                    )}
                    <span
                        lang={containsArabic(article.category) ? 'ar' : 'en'}
                        className="category"
                    >
                        {article.category}
                    </span>
                </div>
                <h3 lang={containsArabic(article.title) ? 'ar' : 'en'} className="title">
                    {article.title}
                </h3>

                <p
                    lang={containsArabic(article.body) ? 'ar' : 'en'}
                    className="preview"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtmlForPreview(article.body),
                    }}
                />

                <div className="tags">
                    {article.tags!.map((tag, index) => (
                        <span lang={containsArabic(tag) ? 'ar' : 'en'} key={index} className="tag">
                            <Hash />
                            {_.upperFirst(tag)}
                        </span>
                    ))}
                </div>
                <div className="location">
                    {article.author.city}, {article.author.country?._country}
                </div>
            </Link>
        </AnimatedWrapper>
    );
}
