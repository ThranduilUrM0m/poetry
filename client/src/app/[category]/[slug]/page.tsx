'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import {
    fetchArticleBySlug,
    selectCurrentArticle,
    selectIsLoading,
    selectError,
} from '@/slices/articleSlice';

export default function ArticlePage() {
    const params = useParams();
    const category = Array.isArray(params.category) ? params.category[0] : params.category;
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const dispatch = useDispatch<AppDispatch>();
    const article = useSelector(selectCurrentArticle);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        if (category && slug) {
            dispatch(fetchArticleBySlug({ category, slug }));
        }
    }, [category, slug, dispatch]);

    if (isLoading) return <p>Loading article...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!article) return <p>Article not found</p>;

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return (
        <div>
            <h1
                lang={containsArabic(article.title) ? 'ar' : 'en'}
            >
                {article.title}
            </h1>
            <p
                lang={containsArabic(article.body) ? 'ar' : 'en'}
            >
                {article.body}
            </p>
            <p
                lang={containsArabic(article.category) ? 'ar' : 'en'}
            >
                Category: {article.category}
            </p>
            <p
                lang={containsArabic(article.author.username) ? 'ar' : 'en'}
            >
                Author: {article.author.username}
            </p>
        </div>
    );
}
