'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    selectCurrentArticle,
    selectIsLoading,
    setCurrentArticle,
    setLoading,
} from '@/app/slices/articleSlice';
import AnimatedWrapper from '@/app/components/ui/AnimatedWrapper';

// Animation variants
const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

// Loading skeleton component
const ArticleSkeleton = () => (
    <div className="article-skeleton">
        <div className="skeleton-title"></div>
        <div className="skeleton-meta"></div>
        <div className="skeleton-content">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-paragraph"></div>
            ))}
        </div>
    </div>
);

export default function PostPage() {
    const { category, slug } = useParams();
    const dispatch = useDispatch();
    const article = useSelector(selectCurrentArticle);
    const isLoading = useSelector(selectIsLoading);

    useEffect(() => {
        const fetchArticle = async () => {
            dispatch(setLoading(true));
            try {
                // Replace with your actual API call
                const response = await fetch(`/api/articles/${category}/${slug}`);
                const data = await response.json();
                dispatch(setCurrentArticle(data));
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchArticle();
    }, [category, slug, dispatch]);

    if (isLoading) {
        return <ArticleSkeleton />;
    }

    if (!article) {
        return <div>Article not found</div>;
    }

    return (
        <AnimatedWrapper
            className="article-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <article className="article-content">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="article-title"
                >
                    {article.title}
                </motion.h1>

                <motion.div
                    className="article-meta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Article metadata */}
                </motion.div>

                <motion.div
                    className="article-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {article.body}
                </motion.div>
            </article>
        </AnimatedWrapper>
    );
}
