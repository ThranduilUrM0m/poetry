'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Hash } from 'lucide-react';
import { ArticleSuggestion } from '@/app/types/search';
import AnimatedWrapper from './AnimatedWrapper';
import _ from 'lodash';

interface ArticleCardProps {
    readonly article: ArticleSuggestion;
    readonly onNavigate?: () => void;
}

export default function ArticleCard({ article, onNavigate }: ArticleCardProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onNavigate) onNavigate();
        router.push(`/${article.category}/${article.slug}`);
    };

    return (
        <AnimatedWrapper
            as="div"
            className="article-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <a href={`/${article.category}/${article.slug}`} onClick={handleClick}>
                <h3 className="title">{article.title}</h3>
                <div className="meta">
                    <span className="author">
                        by {article.author.firstname} {article.author.lastname}
                    </span>
                    <span className="username">@{article.author.username}</span>
                    <span className="category">{article.category}</span>
                </div>
                <p className="preview">{article.body.substring(0, 150)}...</p>

                <div className="tags">
                    {article.tags.map((tag, index) => (
                        <span key={index} className="tag">
                            <Hash />
                            {_.upperFirst(tag)}
                        </span>
                    ))}
                </div>
                <div className="location">
                    {article.author.city}, {article.author.country}
                </div>
            </a>
        </AnimatedWrapper>
    );
}
