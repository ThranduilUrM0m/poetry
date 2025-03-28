'use client';

import React from 'react';
import { Hash } from 'lucide-react';
import { Article } from '@/types/article';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import _ from 'lodash';
import Link from 'next/link';

interface ArticleCardProps {
    readonly article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

    const extractFirstPhrase = (htmlContent: string) => {
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Get all text content, removing HTML tags
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // Split by sentence endings and get first sentence
        const firstSentence = textContent.split(/[.!?]+/)[0];

        return firstSentence.trim();
    };

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return (
        <AnimatedWrapper as="div" className="article-card" config={smoothConfig}>
            <Link
                href={`/blog/${article.category.toLowerCase()}/${article.slug}`}
            >
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
                            by{' '}
                            {[article.author.firstName, article.author.lastName]
                                .filter(Boolean)
                                .join(' ')}
                        </span>
                    )}

                    {/* Username span - only shows if username exists */}
                    {!_.isEmpty(article.author.username) && (
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
                <p lang={containsArabic(article.body) ? 'ar' : 'en'} className="preview">
                    {extractFirstPhrase(article.body)}
                </p>
                <div className="tags">
                    {article.tags.map((tag, index) => (
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
