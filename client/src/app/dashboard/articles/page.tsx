/**
 * dashboard/articles/page.tsx
 * ----------------------------
 * This Articles page displays the analytical insights previously
 * part of the Dashboard. It includes categorical charts that illustrate:
 *  - Articles by Category
 *  - Content Impact Analysis
 *  - Reader Engagement Analysis
 *
 * Data is retrieved and processed using a similar strategy as in the dashboard.
 */
'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDashboard } from '@/context/DashboardContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { config } from '@react-spring/web';

// Import aggregated analytics thunk and selectors.
import { selectAnalyticsCalculating } from '@/slices/analyticsSlice';
import { fetchComments, selectComments } from '@/slices/commentSlice';
import { Article, Comment } from '@/types/article';
import { format, formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppDispatch } from '@/store';
import { BiSolidQuoteRight } from 'react-icons/bi';
import { ChevronLeft, ChevronRight, Eye, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Comments } from '@/components/ui/HeroImage';
import { selectArticles } from '@/slices/articleSlice';
import _ from 'lodash';

export const useCommentsAnalytics = () => {
    const comments = useSelector(selectComments);

    const getTopComments = React.useMemo(() => {
        // Map comments with calculated scores first
        const commentsWithScores = comments
            .filter((comment: Comment) => comment._comment_isOK !== false)
            .map((comment: Comment) => {
                const votes = comment._comment_votes || [];
                const upvotes = votes.filter((vote) => vote.direction === 'up').length;
                const downvotes = votes.filter((vote) => vote.direction === 'down').length;
                const calculatedScore = 3 * upvotes - 2 * downvotes;

                return {
                    ...comment,
                    calculatedScore, // Using calculatedScore instead of score
                };
            })
            .sort((a, b) => b.calculatedScore - a.calculatedScore)
            .slice(0, 3);

        // Fill with default comments if needed
        const defaultComment: Comment = {
            _id: 'default',
            _comment_author: '__author',
            _comment_email: 'no@email.com',
            _comment_body:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            _comment_isPrivate: false,
            _comment_fingerprint: 'default-fingerprint',
            _comment_isOK: true,
            _comment_votes: [],
            Parent: null,
            article: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const paddedComments = [...commentsWithScores];
        while (paddedComments.length < 3) {
            paddedComments.push({
                ...defaultComment,
                _id: `default-${paddedComments.length}`,
                calculatedScore: 0,
            });
        }

        return paddedComments;
    }, [comments]);

    const getCommentMetrics = React.useMemo(() => {
        const totalComments = comments.length;
        const approvedComments = comments.filter((c) => c._comment_isOK === true).length;
        const pendingComments = comments.filter((c) => c._comment_isOK === false).length;
        const privateComments = comments.filter((c) => c._comment_isPrivate).length;
        const engagedComments = comments.filter((c) => (c._comment_votes || []).length > 0).length;

        return [
            { name: 'Approved', value: approvedComments || 0.1 }, // Use 0.1 instead of 0
            { name: 'Pending', value: pendingComments || 0.1 },
            { name: 'Private', value: privateComments || 0.1 },
            { name: 'Engaged', value: engagedComments || 0.1 },
            { name: 'Total', value: totalComments || 0.1 },
        ];
    }, [comments]);

    return {
        topComments: getTopComments,
        commentMetrics: getCommentMetrics,
    };
};

export const usePopularCategories = () => {
    const articles = useSelector(selectArticles);

    const getPopularCategories = React.useMemo(() => {
        // Group articles by category
        const categoriesMap = _.groupBy(articles, 'category');

        // Calculate score for each category
        const categoriesWithScores = Object.entries(categoriesMap).map(
            ([category, categoryArticles]) => {
                const score = categoryArticles.reduce((totalScore, article) => {
                    const upvotes = article.votes?.filter((v) => v.direction === 'up').length || 0;
                    const downvotes =
                        article.votes?.filter((v) => v.direction === 'down').length || 0;
                    const comments = article.comments?.length || 0;
                    const views = article.views?.length || 0;

                    // Scoring formula similar to blog page:
                    // - 3 points for each upvote
                    // - -2 points for each downvote
                    // - 2 points for each comment
                    // - 1 point for each view
                    return totalScore + (3 * upvotes - 2 * downvotes + 2 * comments + views);
                }, 0);

                return {
                    category,
                    score,
                    articlesCount: categoryArticles.length,
                    totalViews: categoryArticles.reduce(
                        (sum, article) => sum + (article.views?.length || 0),
                        0
                    ),
                    totalComments: categoryArticles.reduce(
                        (sum, article) => sum + (article.comments?.length || 0),
                        0
                    ),
                };
            }
        );

        // Sort by score and take top 4
        return _.orderBy(categoriesWithScores, ['score'], ['desc']).slice(0, 4);
    }, [articles]);

    return getPopularCategories;
};

export const useArticlesPagination = () => {
    const articles = useSelector(selectArticles);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize] = React.useState(5);

    const paginatedArticles = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return articles.slice(startIndex, startIndex + pageSize);
    }, [articles, currentPage, pageSize]);

    const totalPages = Math.ceil(articles.length / pageSize);

    return {
        paginatedArticles,
        currentPage,
        totalPages,
        setCurrentPage,
    };
};

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { loadError, isReady, chartData } = useDashboard();
    console.log('[Page] Using context values:', { isReady, chartData });

    // Retrieve aggregated analytics data.
    const isAnalyticsCalculating = useSelector(selectAnalyticsCalculating);
    const { paginatedArticles, currentPage, totalPages, setCurrentPage } = useArticlesPagination();
    const { topComments, commentMetrics } = useCommentsAnalytics();
    const popularCategories = usePopularCategories();

    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        const loadComments = async () => {
            setIsLoading(true);
            try {
                await dispatch(fetchComments());
            } catch (error) {
                console.error('Failed to load comments:', error);
            } finally {
                setIsLoading(false); // Ensure loading state is cleared
            }
        };
        loadComments();
    }, [dispatch]);

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => /[\u0600-\u06FF]+/.test(text);

    const renderCommentCard = (comment: Comment) => (
        <div className="__card __card--comment" key={comment._id}>
            <div className="__body">
                <div className="__date">
                    <span>{format(new Date(comment.updatedAt!), 'EEE')},</span>
                    <span>{format(new Date(comment.updatedAt!), 'LLL do yyyy')}.</span>
                    <span>
                        {formatDistanceToNow(new Date(comment.updatedAt!), {
                            addSuffix: true,
                        })}
                    </span>
                </div>
                <h3
                    lang={containsArabic(comment.article?.title || '') ? 'ar' : 'en'}
                    className="__article"
                >
                    {comment.article?.title}
                </h3>
                <h2 className="__author">
                    by{' '}
                    <span lang={containsArabic(comment._comment_author) ? 'ar' : 'en'}>
                        {comment._comment_author}
                    </span>
                </h2>
                <div
                    lang={containsArabic(comment._comment_body) ? 'ar' : 'en'}
                    className="__content"
                >
                    {comment._comment_body}
                </div>
                <div className="__votes">
                    <span className="__upvotes">
                        <ThumbsUp />{' '}
                        {comment._comment_votes?.filter((v) => v.direction === 'up').length || 0}
                    </span>
                    <span className="__downvotes">
                        <ThumbsDown />{' '}
                        {comment._comment_votes?.filter((v) => v.direction === 'up').length || 0}
                    </span>
                </div>
                <BiSolidQuoteRight />
            </div>
        </div>
    );

    const renderArticlesTable = () => (
        <div className="__card __card--articles">
            <form className="__header _form">
                <div className="_row">
                    <h3 className="__header-title">Articles</h3>
                </div>
            </form>
            <div className="__body">
                <table className="__table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Views</th>
                            <th>Comments</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedArticles.map((article: Article) => (
                            <tr key={article._id}>
                                <td className="__title">
                                    <span lang={containsArabic(article.title) ? 'ar' : 'en'}>
                                        {article.title}
                                    </span>
                                </td>
                                <td>{article.category}</td>
                                <td>{article.views?.length || 0}</td>
                                <td>{article.comments?.length || 0}</td>
                                <td>
                                    <span className={`__status __status--${article.status}`}>
                                        {article.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="__pagination">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="__pagination-button"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="__pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="__pagination-button"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard__main-articles">
            {loadError && (
                <div className="dashboard__main-articles-error">
                    <p>Error loading analytics: {loadError}</p>
                </div>
            )}
            {isAnalyticsCalculating || isLoading ? (
                <div className="dashboard__main-articles-loader">Calculating Analytics...</div>
            ) : (
                <div className="dashboard__main-articles-grid">
                    <div className="__row">
                        {topComments.slice(0, 3).map((comment) => renderCommentCard(comment))}
                        <div className="__card __card--comment">
                            <form className="__header _form">
                                <div className="_row">
                                    <h3 className="__header-title">Comments</h3>
                                    <button
                                        className="__viewMore"
                                        /* onClick={() =>
                                            openModal({
                                                sortOption: 'topRated',
                                                timeFrameOption: 'all',
                                            })
                                        } */
                                    >
                                        <AnimatedWrapper
                                            as="span" // Use a span to wrap the text and arrow
                                            hover={{
                                                from: { transform: 'translateX(0px)' },
                                                to: { transform: 'translateX(-5px)' },
                                            }}
                                            config={config.wobbly}
                                        >
                                            View All
                                        </AnimatedWrapper>
                                    </button>
                                </div>
                            </form>
                            <div className="__body">
                                <div className="__body-chart">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={commentMetrics}
                                            margin={{
                                                right: 30,
                                                left: 30,
                                                bottom: 15,
                                                top: 15,
                                            }}
                                        >
                                            <XAxis
                                                dataKey="name"
                                                interval={0} // Force all ticks
                                                tick={{
                                                    fontSize: 12,
                                                    textAnchor: 'end',
                                                }}
                                                angle={-25}
                                            />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <Comments />
                        </div>
                    </div>
                    <div className="__row">
                        <div className="__card __card--popularCategories">
                            <form className="__header _form">
                                <div className="_row">
                                    <h3 className="__header-title">Popular Categories</h3>
                                </div>
                            </form>
                            <div className="__body">
                                {popularCategories.map((category) => (
                                    <div key={category.category} className="__category-item">
                                        <h4 className="__category-name">{category.category}</h4>
                                        <div className="__category-stats">
                                            <span className="__articles-count">
                                                {category.articlesCount} Articles
                                            </span>
                                            <span className="__views-count">
                                                <Eye size={16} /> {category.totalViews}
                                            </span>
                                            <span className="__comments-count">
                                                <MessageSquare size={16} /> {category.totalComments}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {renderArticlesTable()}
                    </div>
                </div>
            )}
        </div>
    );
}
