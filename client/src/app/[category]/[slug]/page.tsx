'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { selectCurrentArticle, setCurrentArticle } from '@/slices/articleSlice';

export default function ArticlePage() {
    const { category, slug } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();
    const article = useSelector(selectCurrentArticle);

    useEffect(() => {
        if (!category || !slug) {
            return;
        }

        const fetchArticle = async () => {
            try {
                const response = await fetch(`/api/articles/${category}/${slug}`, {
                    cache: 'no-store', // Disable caching to ensure fresh data
                });

                if (!response.ok) {
                    throw new Error('Article not found');
                }

                const data = await response.json();
                dispatch(setCurrentArticle(data));
            } catch (error) {
                console.error('Error fetching article:', error);
                router.push('/404');
            }
        };

        fetchArticle();
    }, [category, slug, dispatch, router]); // Dependencies ensure effect runs on param changes

    if (!article) {
        return <div>Loading...</div>;
    }

    return (
        <AnimatedWrapper
            className="article-page"
            // ...existing animation props...
        >
            <article className="article-content">
                <h1>{article.title}</h1>
                <div className="meta">
                    <p>Category: {category}</p>
                    {/* <p>Author: {article.author.firstname} {article.author.lastname}</p> */}
                    {/* ...other metadata... */}
                </div>
                <div className="content">{article.body}</div>
            </article>
        </AnimatedWrapper>
    );
}
