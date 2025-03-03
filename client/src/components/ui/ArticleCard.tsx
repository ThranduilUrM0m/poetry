'use client';

import React from 'react';
import { Hash } from 'lucide-react';
import { Article } from '@/types/article';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import _ from 'lodash';

interface ArticleCardProps {
    readonly article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    return (
        <AnimatedWrapper
            as="div"
            className="article-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <a href={`/${article.category}/${article.slug}`}>
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
                    {article.author.city}, {article.author.country?._country}
                </div>
            </a>
        </AnimatedWrapper>
    );
}
