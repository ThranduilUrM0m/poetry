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

// Core React and third-party imports
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import _ from 'lodash';
import { format, formatDistanceToNow, sub } from 'date-fns';
import { config } from '@react-spring/web';

// Table-related imports
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    RowSelectionState,
    FilterFn,
    SortingState,
    getFilteredRowModel,
    getSortedRowModel,
    Row,
} from '@tanstack/react-table';

// Redux and store-related imports
import { AppDispatch } from '@/store';
import { useDashboard } from '@/context/DashboardContext';
import { selectAnalyticsLoading } from '@/slices/analyticsSlice';
import {
    clearCurrentArticle,
    deleteArticle,
    fetchArticles,
    selectArticles,
    setCurrentArticle,
    updateArticleById,
} from '@/slices/articleSlice';
import { selectComments, fetchComments } from '@/slices/commentSlice';

// Component imports
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { Comments } from '@/components/ui/HeroImage';
import FormField from '@/components/ui/FormField';
import CommentManagementModal from '@/components/ui/CommentModal';
import ArticleManagementModal from '@/components/ui/ArticleModal';

// Type and interface imports
import type { Article, Comment } from '@/types/article';
import type { SearchSuggestion } from '@/types/search';

// Icon imports
import { BiSolidQuoteRight } from 'react-icons/bi';
import {
    Eye,
    FilePenLine,
    Trash2,
    MessageSquare,
    Search,
    ThumbsDown,
    ThumbsUp,
    BookUser,
    Star,
    StarOff,
    Timer,
    ChevronUp,
    ChevronDown,
    EyeOff,
    Hash,
} from 'lucide-react';

// Chart imports
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Type declarations
type SortOption = 'trending' | 'mostViewed' | 'topRated' | 'mostRecent' | 'mostRelevant';
type TimeFrameOption = '24h' | '7d' | '30d' | '6m' | 'all';

interface FormValues {
    globalFilter: string;
    sortOption: SortOption;
    timeFrameOption: TimeFrameOption;
}

interface ArticleTableColumn extends Article {
    actions?: string;
}

// Validation schema
const validationSchema: Yup.ObjectSchema<FormValues> = Yup.object().shape({
    globalFilter: Yup.string().required('Search query is required'),
    sortOption: Yup.mixed<SortOption>()
        .required()
        .oneOf(['trending', 'mostViewed', 'topRated', 'mostRecent', 'mostRelevant']),
    timeFrameOption: Yup.mixed<TimeFrameOption>()
        .required()
        .oneOf(['24h', '7d', '30d', '6m', 'all']),
});

// Custom filter function
const fuzzyFilter: FilterFn<ArticleTableColumn> = (row, columnId, value) => {
    const itemValue = row.getValue(columnId) as string;
    return itemValue.toLowerCase().includes(value.toLowerCase());
};

// Custom hooks
const useCommentsAnalytics = () => {
    const comments = useSelector(selectComments);

    const getTopComments = React.useMemo(() => {
        // Map comments with calculated scores first
        const commentsWithScores = comments
            .filter((comment: Comment) => {
                return comment._comment_isOK;
            })
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
        const engagedComments = comments.filter((c) => (c._comment_votes || []).length > 0).length;

        return [
            { name: 'Approved', value: approvedComments || 0.1 }, // Use 0.1 instead of 0
            { name: 'Pending', value: pendingComments || 0.1 },
            { name: 'Engaged', value: engagedComments || 0.1 },
            { name: 'Total', value: totalComments || 0.1 },
        ];
    }, [comments]);

    return {
        topComments: getTopComments,
        commentMetrics: getCommentMetrics,
    };
};

const usePopularCategories = () => {
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

// Cell Components

const PrivateCell: React.FC<{ row: Row<Article>; onUpdate: () => void }> = ({ row, onUpdate }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isPrivate, setIsPrivate] = useState(row.original.isPrivate);

    const togglePrivate = async () => {
        try {
            await dispatch(
                updateArticleById({
                    id: row.original._id!,
                    data: { isPrivate: !isPrivate },
                })
            ).unwrap();

            setIsPrivate((prev) => !prev);
            onUpdate();
        } catch (err) {
            console.error('Failed to toggle private:', err);
        }
    };

    return (
        <button
            className={`__private-toggle ${isPrivate ? '__private' : '__public'}`}
            onClick={togglePrivate}
            aria-label={isPrivate ? 'Make Public' : 'Make Private'}
        >
            {isPrivate ? <EyeOff /> : <Eye />}
        </button>
    );
};

const FeaturedCell: React.FC<{ row: Row<Article>; onUpdate: () => void }> = ({ row, onUpdate }) => {
    const [isFeatured, setIsFeatured] = useState(row.original.isFeatured);
    const dispatch = useDispatch<AppDispatch>();

    const toggleFeatured = async () => {
        try {
            await dispatch(
                updateArticleById({
                    id: row.original._id!,
                    data: { isFeatured: !isFeatured },
                })
            ).unwrap();
            setIsFeatured(!isFeatured);
            onUpdate();
        } catch (error) {
            console.error('Failed to update featured status:', error);
        }
    };

    return (
        <button
            className={`__featured-toggle ${isFeatured ? '__featured' : '__not-featured'}`}
            onClick={toggleFeatured}
        >
            {isFeatured ? <Star /> : <StarOff />}
        </button>
    );
};

const STATUS_CYCLE = ['pending', 'approved', 'rejected'] as const;
type StatusType = (typeof STATUS_CYCLE)[number];
const StatusCell: React.FC<{ row: Row<Article>; onUpdate: () => void }> = ({ row, onUpdate }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [status, setStatus] = useState<StatusType>(
        STATUS_CYCLE.includes(row.original.status) ? row.original.status : 'pending'
    );

    const toggleStatus = async () => {
        const currentIndex = STATUS_CYCLE.indexOf(status);
        const next = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

        try {
            await dispatch(
                updateArticleById({
                    id: row.original._id!,
                    data: { status: next },
                })
            ).unwrap();

            setStatus(next);
            onUpdate();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <button
            className={`__status-toggle ${status}`}
            onClick={toggleStatus}
            title={`Status: ${status}. Click to cycle.`}
        >
            {status}
        </button>
    );
};

// Main component
export default function DashboardPage() {
    // Redux hooks
    const dispatch = useDispatch<AppDispatch>();
    const { loadError } = useDashboard();
    const isAnalyticsLoading = useSelector(selectAnalyticsLoading);
    const articles = useSelector(selectArticles);
    const comments = useSelector(selectComments);

    // State management
    const [isLoading, setIsLoading] = React.useState(true);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [selectedSuggestions, setSelectedSuggestions] = useState<SearchSuggestion[]>([]);
    const [transformedSuggestions, setTransformedSuggestions] = useState<SearchSuggestion[]>([]);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentModalArticleId, setCommentModalArticleId] = useState<string | null>(null);
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [isModalMounted, setIsModalMounted] = useState(false);

    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

    // Handler to open modal for a given article
    const handleOpenComments = (articleId: string) => {
        setCommentModalArticleId(articleId);
        setIsCommentModalOpen(true);
    };

    const filteredComments = React.useMemo(() => {
        if (!isCommentModalOpen) return [];
        if (!commentModalArticleId) return comments; // Show all
        return comments.filter((c) => {
            if (!c.article) return false;
            // Always compare as strings
            if (typeof c.article === 'string') {
                return String(c.article) === String(commentModalArticleId);
            }
            if (typeof c.article === 'object' && c.article._id) {
                return String(c.article._id) === String(commentModalArticleId);
            }
            return false;
        });
    }, [comments, isCommentModalOpen, commentModalArticleId]);

    // Handler to close
    const handleCloseComments = () => {
        setIsCommentModalOpen(false);
        setCommentModalArticleId(null);
    };

    // Form handling
    const {
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            globalFilter: '',
            sortOption: 'trending',
            timeFrameOption: 'all',
        },
    });

    // Function for Filter
    const filterByTimeFrame = (articles: Article[], timeFrame: TimeFrameOption) => {
        if (timeFrame === 'all') return articles;

        const now = new Date();
        const timeFrames = {
            '24h': sub(now, { hours: 24 }),
            '7d': sub(now, { days: 7 }),
            '30d': sub(now, { days: 30 }),
            '6m': sub(now, { months: 6 }),
        };

        return articles.filter((article) => {
            const articleDate = new Date(article.createdAt || '');
            return articleDate >= timeFrames[timeFrame];
        });
    };

    // Memoized values and effects
    const timeFrameOption = watch('timeFrameOption');
    const { topComments, commentMetrics } = useCommentsAnalytics();
    const popularCategories = usePopularCategories();

    const filteredArticles = React.useMemo(
        () => filterByTimeFrame(articles, timeFrameOption),
        [articles, timeFrameOption]
    );

    // Table configuration
    const columns: ColumnDef<ArticleTableColumn, unknown>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
            enableSorting: false,
        },
        {
            id: 'title',
            accessorKey: 'title',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Title {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: 'alphanumeric',
            cell: (info) => {
                const article = info.row.original;
                return (
                    <div className="__title-cell">
                        <span
                            className="__title"
                            lang={containsArabic(article.title) ? 'ar' : 'en'}
                        >
                            {article.title}
                        </span>
                        <div className="__title-meta">
                            <span className="__author">by {article.author?.username}</span>
                            <span className="__update-date">
                                <span>{format(new Date(article.updatedAt!), 'EEE')},</span>
                                <span>{format(new Date(article.updatedAt!), 'LLL do yyyy')}.</span>
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'category',
            accessorKey: 'category',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Category {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            sortingFn: 'alphanumeric',
            cell: (info) => {
                const category = info.getValue() as string;
                const tags = info.row.original.tags || [];

                return (
                    <div className="__category-container">
                        <span className="__category" lang={containsArabic(category) ? 'ar' : 'en'}>
                            {category}
                        </span>
                        <div className="__tags-wrapper">
                            <AnimatedWrapper
                                key={_.head(tags)}
                                className="__tagCard"
                                from={{ opacity: 0 }}
                                to={{ opacity: 0.8 }}
                                config={smoothConfig}
                            >
                                <Hash />
                                <span lang={containsArabic(_.head(tags)!) ? 'ar' : 'en'}>
                                    {_.head(tags)}
                                </span>
                            </AnimatedWrapper>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'isPrivate',
            accessorKey: 'isPrivate',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Private
                    {column.getIsSorted() &&
                        (column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                </button>
            ),
            cell: ({ row }) => <PrivateCell row={row} onUpdate={handleRefreshArticles} />,
            enableSorting: true,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
        {
            id: 'isFeatured',
            accessorKey: 'isFeatured',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Featured {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            cell: ({ row }) => <FeaturedCell row={row} onUpdate={handleRefreshArticles} />,
            sortingFn: 'basic',
            enableSorting: true,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
        {
            id: 'comments',
            accessorFn: (row) => row.comments?.length || 0,
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    <MessageSquare className="__icon-header" />
                    {column.getIsSorted() &&
                        (column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                </button>
            ),
            cell: (info) => {
                const count = info.row.original.comments?.length || 0;
                const articleId = info.row.original._id!;
                return (
                    <button
                        className="__comments-button"
                        onClick={() => handleOpenComments(articleId)}
                        aria-label={`View ${count} comments`}
                    >
                        {count.toLocaleString()}
                    </button>
                );
            },
            enableSorting: true,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
        {
            id: 'views',
            accessorFn: (row) => row.views?.length || 0,
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    <Eye className="__icon-header" />
                    {column.getIsSorted() &&
                        (column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                </button>
            ),
            cell: (info) => (
                <span className="__count">
                    {(info.row.original.views?.length || 0).toLocaleString()}
                </span>
            ),
            enableSorting: true,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
        {
            id: 'upvotes',
            accessorFn: (row) => row.votes?.filter((v) => v.direction === 'up').length || 0,
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    <ThumbsUp className="__icon-header" />
                    {column.getIsSorted() &&
                        (column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                </button>
            ),
            cell: (info) => (
                <span className="__count __upvotes">
                    {(
                        info.row.original.votes?.filter((v) => v.direction === 'up')?.length || 0
                    ).toLocaleString()}
                </span>
            ),
            enableSorting: true,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
        {
            id: 'downvotes',
            accessorFn: (row) => row.votes?.filter((v) => v.direction === 'down').length || 0,
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    <ThumbsDown className="__icon-header" />
                    {column.getIsSorted() &&
                        (column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                </button>
            ),
            cell: (info) => (
                <span className="__count __downvotes">
                    {(
                        info.row.original.votes?.filter((v) => v.direction === 'down')?.length || 0
                    ).toLocaleString()}
                </span>
            ),
            enableSorting: true,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
        {
            id: 'status',
            accessorKey: 'isPrivate',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Status {column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />}
                </button>
            ),
            cell: ({ row }) => <StatusCell row={row} onUpdate={handleRefreshArticles} />,
            sortingFn: 'basic',
            enableSorting: true,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
        {
            id: 'isBio',
            accessorKey: 'isBio',
            header: ({ column }) => (
                <button onClick={() => column.toggleSorting()} className="__sortable-header">
                    Bio
                    {column.getIsSorted() &&
                        (column.getIsSorted() === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                </button>
            ),
            cell: (info) => (
                <span
                    className={`__status-indicator ${info.getValue() ? '__active' : '__inactive'}`}
                >
                    {info.getValue() ? <BookUser /> : null}
                </span>
            ),
            enableSorting: true,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="__action-buttons">
                    <button
                        className="__edit-button"
                        onClick={() => handleEditArticle(row.original)}
                    >
                        <FilePenLine />
                    </button>
                    <button
                        className="__delete-button"
                        onClick={async () => {
                            const confirmDelete = window.confirm(
                                'Are you sure you want to delete this article? This action cannot be undone.'
                            );
                            if (!confirmDelete) return;
                            try {
                                await dispatch(deleteArticle(row.original._id!)).unwrap();
                                await handleRefreshArticles();
                            } catch (error) {
                                console.error('Failed to delete article:', error);
                            }
                        }}
                    >
                        <Trash2 />
                    </button>
                </div>
            ),
            enableSorting: false,
            meta: {
                tdClassName: 'isCentered', // Custom class for this column's cells
            },
        },
    ];

    const table = useReactTable({
        data: filteredArticles, // Use memoized filtered data instead of direct filtering
        columns,
        state: {
            rowSelection,
            globalFilter,
            sorting,
        },
        filterFns: {
            fuzzy: fuzzyFilter as FilterFn<unknown>,
            commentFuzzy: () => true,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
        globalFilterFn: fuzzyFilter,
        initialState: {
            pagination: {
                pageSize: 3,
                pageIndex: 0,
            },
        },
        enableRowSelection: true,
        enableSorting: true,
    });

    // Handler functions
    const handleSearch = (value: string) => {
        setGlobalFilter(value);
        // Generate suggestions based on the search value
        const suggestions: SearchSuggestion[] = articles.map((article) => ({
            _id: article._id || '',
            title: article.title,
            type: 'title' as const, // Explicit type assertion
            sourceType: 'Article' as const, // New required field
            source: article,
            priority: 0, // New required field (default value)
        }));
        setTransformedSuggestions(suggestions);
    };

    const handleClear = () => {
        setGlobalFilter('');
        setValue('globalFilter', '');
        setTransformedSuggestions([]);
        setSelectedSuggestions([]);
    };

    const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
        setSelectedSuggestions((prev) => [...prev, suggestion]);
        setGlobalFilter(suggestion.title);
    };

    const handleRefreshComments = async () => {
        try {
            setIsLoading(true); // Use existing loading state
            await dispatch(fetchComments()).unwrap();
        } catch (error) {
            console.error('Failed to refresh comments:', error);
            // You could also add error handling UI here if needed
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddArticle = useCallback(() => {
        dispatch(clearCurrentArticle());
        setIsArticleModalOpen(true);
    }, [dispatch]);

    const handleEditArticle = (article: Article) => {
        dispatch(setCurrentArticle(article));
        setIsArticleModalOpen(true);
    };

    // Add handleRefreshArticles function
    const handleRefreshArticles = async () => {
        try {
            await dispatch(fetchArticles()).unwrap();
        } catch (error) {
            console.error('Failed to refresh articles:', error);
        }
    };

    // Utility functions
    const containsArabic = (text: string) => /[\u0600-\u06FF]+/.test(text);

    // Render functions
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
                    <FormField
                        name="globalFilter"
                        type="text"
                        label="Search"
                        icon={<Search />}
                        error={
                            transformedSuggestions.length === 0 && globalFilter
                                ? 'No exact matches found, here are some suggestions.'
                                : errors.globalFilter?.message
                        }
                        suggestions={transformedSuggestions}
                        allArticles={articles}
                        control={control}
                        rules={{ required: 'This field is required' }}
                        onClear={handleClear}
                        onInputChange={handleSearch}
                        onSuggestionSelect={handleSuggestionSelect}
                        selectedSuggestions={selectedSuggestions}
                    />
                    <FormField
                        control={control}
                        icon={<Timer />}
                        name="timeFrameOption"
                        type="select"
                        options={[
                            { value: '24h', label: 'Last 24 hours' },
                            { value: '7d', label: 'Last 7 days' },
                            { value: '30d', label: 'Last 30 days' },
                            { value: '6m', label: 'Last 6 months' },
                            { value: 'all', label: 'All time' },
                        ]}
                        rules={{ required: true }}
                    />

                    <button
                        type="button"
                        className="__deleteArticle"
                        onClick={async () => {
                            const selectedIds = table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original._id)
                                .filter((id): id is string => typeof id === 'string'); // Filter out undefined

                            if (selectedIds.length === 0) return;

                            const confirmDelete = window.confirm(
                                `Are you sure you want to delete ${selectedIds.length} article(s)? This action cannot be undone.`
                            );
                            if (!confirmDelete) return;

                            try {
                                for (const id of selectedIds) {
                                    await dispatch(deleteArticle(id)).unwrap();
                                }
                                await handleRefreshArticles();
                            } catch (error) {
                                console.error('Failed to delete selected articles:', error);
                            }
                        }}
                        disabled={table.getSelectedRowModel().rows.length === 0}
                    >
                        <AnimatedWrapper
                            as="span"
                            hover={{
                                from: { transform: 'translateX(0px)' },
                                to: { transform: 'translateX(-5px)' },
                            }}
                            config={config.wobbly}
                        >
                            Delete
                            {table.getSelectedRowModel().rows.length > 0 &&
                                `(${table.getSelectedRowModel().rows.length})`}
                            <b className="__dot">.</b>
                        </AnimatedWrapper>
                    </button>
                    <button
                        type="button"
                        className="_button"
                        id="_buttonCreate"
                        onClick={() => handleAddArticle()}
                        disabled={isLoading}
                    >
                        {/* The sequential effect is still a mystery and the background effect is not reversing with ease */}
                        <AnimatedWrapper
                            as="span"
                            className="buttonBackground"
                            hover={{
                                from: {
                                    clipPath: 'inset(0 100% 0 0)',
                                },
                                to: {
                                    clipPath: 'inset(0 0 0 0)',
                                },
                            }}
                            config={{
                                mass: 1,
                                tension: 170,
                                friction: 26,
                            }}
                            parentHoverSelector="#_buttonCreate"
                        ></AnimatedWrapper>
                        <div className="buttonBorders">
                            {/* Top border: animate width */}
                            <AnimatedWrapper
                                as="div"
                                className="borderTop"
                                hover={{
                                    from: { width: '0%' },
                                    to: { width: '100%' },
                                    delay: 0,
                                }}
                                parentHoverSelector="#_buttonCreate" // <-- Updated parent hover selector
                                onRest={() => {
                                    // Trigger the next animation after this one completes
                                    document
                                        .querySelector('.borderRight')
                                        ?.dispatchEvent(new Event('startAnimation'));
                                }}
                            />
                            {/* Right border: animate height */}
                            <AnimatedWrapper
                                as="div"
                                className="borderRight"
                                hover={{
                                    from: { height: '0%' },
                                    to: { height: '100%' },
                                    delay: 0, // Start immediately after the previous animation
                                }}
                                parentHoverSelector="#_buttonCreate" // <-- Updated parent hover selector
                                onRest={() => {
                                    // Trigger the next animation after this one completes
                                    document
                                        .querySelector('.borderBottom')
                                        ?.dispatchEvent(new Event('startAnimation'));
                                }}
                            />
                            {/* Bottom border: animate width */}
                            <AnimatedWrapper
                                as="div"
                                className="borderBottom"
                                hover={{
                                    from: { width: '0%' },
                                    to: { width: '100%' },
                                    delay: 0, // Start immediately after the previous animation
                                }}
                                parentHoverSelector="#_buttonCreate" // <-- Updated parent hover selector
                                onRest={() => {
                                    // Trigger the next animation after this one completes
                                    document
                                        .querySelector('.borderLeft')
                                        ?.dispatchEvent(new Event('startAnimation'));
                                }}
                            />
                            {/* Left border: animate height */}
                            <AnimatedWrapper
                                as="div"
                                className="borderLeft"
                                hover={{
                                    from: { height: '0%' },
                                    to: { height: '100%' },
                                    delay: 0, // Start immediately after the previous animation
                                }}
                                parentHoverSelector="#_buttonCreate" // <-- Updated parent hover selector
                            />
                        </div>
                        <AnimatedWrapper
                            as="span"
                            className="buttonContent"
                            hover={{
                                from: {
                                    color: 'rgb(var(--text)/1)',
                                },
                                to: {
                                    color: 'rgb(var(--white)/1)',
                                },
                            }}
                            config={{
                                mass: 1,
                                tension: 170,
                                friction: 26,
                            }}
                            parentHoverSelector="#_buttonCreate"
                        >
                            {isLoading ? 'Creating...' : 'Add Article'}
                            <b className="__dot">.</b>
                        </AnimatedWrapper>
                    </button>
                </div>
            </form>
            <div className="__body">
                <table className="__table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={cell.column.columnDef.meta?.tdClassName || ''}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="__pagination">
                    <span className="__pagination-info">
                        {(() => {
                            const pageIndex = table.getState().pagination.pageIndex;
                            const pageSize = table.getState().pagination.pageSize;
                            const totalItems = table.getCoreRowModel().rows.length;
                            const startIndex = pageIndex * pageSize + 1;
                            const endIndex = Math.min((pageIndex + 1) * pageSize, totalItems);

                            return totalItems === 0 ? (
                                'No articles to display'
                            ) : (
                                <>
                                    {`Showing `}
                                    <strong>{startIndex}</strong>
                                    {` to `}
                                    <strong>{endIndex}</strong>
                                    {` from `}
                                    <strong>{totalItems}</strong>
                                </>
                            );
                        })()}
                    </span>
                    <div className="__pagination">
                        <ul className="_pageNumbers">
                            {(() => {
                                const pageCount = table.getPageCount();
                                const currentPage = table.getState().pagination.pageIndex + 1;
                                const maxVisiblePages = 10;

                                // Generate page numbers array with truncation logic
                                const visiblePages = Array.from(
                                    { length: pageCount },
                                    (_, i) => i + 1
                                )
                                    .filter((page) => {
                                        const showAll = pageCount <= maxVisiblePages;
                                        const inStartRange = page <= 3;
                                        const inEndRange = page > pageCount - 3;
                                        const aroundCurrent = Math.abs(page - currentPage) <= 2;
                                        return (
                                            showAll || inStartRange || inEndRange || aroundCurrent
                                        );
                                    })
                                    .reduce((acc: (number | string)[], page, index, array) => {
                                        // Add ellipsis between non-consecutive numbers
                                        if (index > 0 && page - array[index - 1] > 1) {
                                            acc.push('...');
                                        }
                                        acc.push(page);
                                        return acc;
                                    }, []);

                                return visiblePages.map((page, index) => (
                                    <li
                                        key={index}
                                        className={`__pagination-item ${
                                            page === currentPage ? 'current' : ''
                                        } ${
                                            typeof page === 'string' ? '__pagination-ellipsis' : ''
                                        }`}
                                        onClick={() =>
                                            typeof page === 'number' && table.setPageIndex(page - 1)
                                        }
                                    />
                                ));
                            })()}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        const loadComments = async () => {
            setIsLoading(true);
            try {
                await dispatch(fetchComments());
            } catch (error) {
                console.error('Failed to load comments:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadComments();
    }, [dispatch]);

    useEffect(() => {
        if (timeFrameOption) {
            table.setPageIndex(0);
        }
    }, [timeFrameOption, table]);

    // JSX remains unchanged below this point
    return (
        <div className="dashboard__main-articles">
            {loadError && (
                <div className="dashboard__main-articles-error">
                    <p>Error loading analytics: {loadError}</p>
                </div>
            )}
            {isAnalyticsLoading || isLoading ? (
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
                                        type="button"
                                        className="__viewMore"
                                        onClick={() => {
                                            setCommentModalArticleId(null);
                                            setIsCommentModalOpen(true);
                                        }}
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
                                        <div className="__category-details">
                                            <h4 className="__category-name">{category.category}</h4>
                                            <span className="__articles-count">
                                                {category.articlesCount} Articles
                                            </span>
                                        </div>
                                        <div className="__category-stats">
                                            <span className="__views-count">
                                                <Eye /> {category.totalViews}
                                            </span>
                                            <span className="__comments-count">
                                                <MessageSquare /> {category.totalComments}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {renderArticlesTable()}
                    </div>
                    {/* {isCommentModalOpen && commentModalArticleId && ( */}
                    {isCommentModalOpen && (
                        <CommentManagementModal
                            isOpen={isCommentModalOpen}
                            onClose={handleCloseComments}
                            comments={filteredComments}
                            refreshComments={handleRefreshComments}
                            initialFilter={commentModalArticleId ?? undefined} // <-- Fix here
                        />
                    )}
                    {isArticleModalOpen && !isModalMounted && (
                        <ArticleManagementModal
                            key="article-modal" // Add a key
                            isOpen={isArticleModalOpen}
                            onClose={() => {
                                setIsArticleModalOpen(false);
                                setIsModalMounted(false);
                            }}
                            refreshArticles={handleRefreshArticles}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
