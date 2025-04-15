'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles, selectArticles } from '@/slices/articleSlice';
import { fetchComments, selectComments } from '@/slices/commentSlice';
import { useLoading } from '@/context/LoadingContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { BarChart3, MessageSquare, ScrollText } from 'lucide-react';

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const comments = useSelector(selectComments);
    const { isLoaded } = useLoading();

    useEffect(() => {
        // Fetch data on component mount
        dispatch(fetchArticles());
        dispatch(fetchComments());
    }, [dispatch]);

    const stats = {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => !a.isPrivate).length,
        totalComments: comments.length,
        pendingComments: comments.filter(c => !c._comment_isOK).length,
    };

    return (
        <AnimatedWrapper
            as="div"
            from={{ transform: 'translateY(-10%)', opacity: 0 }}
            to={isLoaded ? { transform: 'translateY(0)', opacity: 1 } : undefined}
            config={{ mass: 1, tension: 170, friction: 26 }}
        >
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <ScrollText className="w-12 h-12 text-blue-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Articles</h3>
                            <div className="text-gray-500">
                                <p>{stats.totalArticles} Total</p>
                                <p>{stats.publishedArticles} Published</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <MessageSquare className="w-12 h-12 text-green-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Comments</h3>
                            <div className="text-gray-500">
                                <p>{stats.totalComments} Total</p>
                                <p>{stats.pendingComments} Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <BarChart3 className="w-12 h-12 text-purple-500" />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Views</h3>
                            <div className="text-gray-500">
                                <p>
                                    {articles.reduce((sum, article) => sum + (article.views?.length || 0), 0)}{' '}
                                    Total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedWrapper>
    );
}
