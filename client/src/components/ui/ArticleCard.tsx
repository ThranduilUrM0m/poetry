'use client';

import React from 'react';
import Link from 'next/link';
import { Hash } from 'lucide-react';
import { Article } from '@/types/article';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import _ from 'lodash';

interface ArticleCardProps {
    readonly article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
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

    return (
        <AnimatedWrapper
            as="div"
            className="article-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Link href={`/${article.category}/${article.slug}`}>
                <h3 className="title">{article.title}</h3>
                <div className="meta">
                    <span className="author">
                        by {article.author.firstname} {article.author.lastname}
                    </span>
                    <span className="username">@{article.author.username}</span>
                    <span className="category">{article.category}</span>
                </div>
                <p className="preview">{extractFirstPhrase(article.body)}</p>
                <div className="tags">
                    {article.tags.map((tag, index) => (
                        <span key={index} className="tag">
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
