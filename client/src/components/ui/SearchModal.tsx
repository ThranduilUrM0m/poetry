'use client';
import React, { useState, useEffect, useRef, JSX } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Search, Hash, UserSearch, ArrowLeftRight, Timer } from 'lucide-react';
import { AppDispatch } from '@/store';
import { fetchArticles, selectArticles, selectIsLoading, selectError } from '@/slices/articleSlice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import * as stringSimilarity from 'string-similarity';
import SimpleBar from 'simplebar-react';
import FormField from '@/components/ui/FormField';
import { useOverlay } from '@/context/OverlayContext';
import SearchResults from '@/components/ui/SearchResults';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { SearchSuggestion } from '@/types/search';
import { Article } from '@/types/article';
import _ from 'lodash';
import { useSearchModal } from '@/context/SearchModalContext';
import { useMedia } from 'react-use';

// Define sort and timeframe options explicitly:
type SortOption = 'trending' | 'mostViewed' | 'topRated' | 'mostRecent' | 'mostRelevant';
type TimeFrameOption = '24h' | '7d' | '30d' | '6m' | 'all';

// Validation schema and form data interface
const searchSchema: Yup.ObjectSchema<FormValues> = Yup.object().shape({
    searchQuery: Yup.string().required('Search query is required'),
    sortOption: Yup.mixed<SortOption>()
        .required()
        .oneOf(['trending', 'mostViewed', 'topRated', 'mostRecent', 'mostRelevant']),
    timeFrameOption: Yup.mixed<TimeFrameOption>()
        .required()
        .oneOf(['24h', '7d', '30d', '6m', 'all']),
});

interface FormValues {
    searchQuery: string;
    sortOption: SortOption;
    timeFrameOption: TimeFrameOption;
}

// Smooth configuration for animations
const smoothConfig = { mass: 1, tension: 170, friction: 26 };

// -----------------------------------------------------------------------------
// Scoring Functions
// -----------------------------------------------------------------------------
const calculateViewScore = (article: Article): number => {
    const viewsCount = _.get(article, 'views.length', 0);
    const createdAt = new Date(article.createdAt!);
    const now = new Date();
    const daysSincePublication = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyFactor = Math.max(0, 30 - daysSincePublication);
    return viewsCount * (1 + recencyFactor / 30);
};

const calculateUpvoteScore = (article: Article): number => {
    const upvotesCount = article.votes?.filter((vote) => vote.direction === 'up').length || 0;
    const createdAt = new Date(article.createdAt!);
    const now = new Date();
    const daysSincePublication = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyFactor = Math.max(0, 30 - daysSincePublication);
    return upvotesCount * (1 + recencyFactor / 30);
};

const calculateCommentsScore = (article: Article): number => {
    const commentsCount = _.get(article, 'comments.length', 0);
    const updatedAt = new Date(article.updatedAt!);
    const now = new Date();
    const daysSinceUpdate = Math.floor(
        (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyFactor = Math.max(0, 30 - daysSinceUpdate);
    return commentsCount * (1 + recencyFactor / 30);
};

const calculateTrendingScore = (article: Article): number => {
    const viewScore = calculateViewScore(article);
    const upvoteScore = calculateUpvoteScore(article);
    const commentsScore = calculateCommentsScore(article);
    return 0.4 * viewScore + 0.4 * upvoteScore + 0.2 * commentsScore;
};

const getAttractionScore = (article: Article): number => {
    const viewsCount = _.get(article, 'views.length', 0);
    const commentsCount = _.get(article, 'comments.length', 0);
    const upvotesCount = article.votes?.filter((vote) => vote.direction === 'up').length || 0;
    const downvotesCount = article.votes?.filter((vote) => vote.direction === 'down').length || 0;
    let score: number = viewsCount + 2 * commentsCount + 3 * upvotesCount - 2 * downvotesCount;
    if (article.isFeatured) {
        score *= 1.5;
    }
    return score;
};

const calculateRelevantScore = (article: Article): number => {
    return getAttractionScore(article);
};

// -----------------------------------------------------------------------------
// Filtering Function: Apply Timeframe & Sorting
// -----------------------------------------------------------------------------
const applyFilters = (
    articles: Article[],
    sortOption: SortOption,
    timeFrameOption: TimeFrameOption,
    selectedSuggestions: SearchSuggestion[]
): Article[] => {
    let filtered: Article[] = articles;
    if (timeFrameOption !== 'all') {
        let days: number;
        switch (timeFrameOption) {
            case '24h':
                days = 1;
                break;
            case '7d':
                days = 7;
                break;
            case '30d':
                days = 30;
                break;
            case '6m':
                days = 180;
                break;
            default:
                days = Infinity;
        }
        filtered = filtered.filter((article) => {
            const createdAt = new Date(article.createdAt!);
            const diffDays = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= days;
        });
    }
    switch (sortOption) {
        case 'mostViewed':
            filtered = _.orderBy(
                filtered.map((article) => ({ ...article, score: calculateViewScore(article) })),
                ['score'],
                ['desc']
            );
            break;
        case 'topRated':
            filtered = _.orderBy(
                filtered.map((article) => ({ ...article, score: calculateUpvoteScore(article) })),
                ['score'],
                ['desc']
            );
            break;
        case 'mostRecent':
            filtered = _.orderBy(filtered, [(a) => new Date(a.updatedAt!)], ['desc']);
            break;
        case 'trending':
            filtered = _.orderBy(
                filtered.map((article) => ({ ...article, score: calculateTrendingScore(article) })),
                ['score'],
                ['desc']
            );
            break;
        case 'mostRelevant':
            filtered = _.orderBy(
                filtered.map((article) => ({ ...article, score: calculateRelevantScore(article) })),
                ['score'],
                ['desc']
            );
            break;
        default:
            break;
    }
    filtered = filterArticlesBySuggestions(filtered, selectedSuggestions);
    return filtered;
};

// -----------------------------------------------------------------------------
// Existing Helper Functions for Suggestions (ensure these are typed properly)
// -----------------------------------------------------------------------------
const filterArticlesBySuggestions = (
    articles: Article[],
    suggestions: SearchSuggestion[]
): Article[] => {
    if (suggestions.length === 0) return articles;
    const groupedSuggestions = _.groupBy(suggestions, 'type');
    return articles.filter((article) => {
        const tagMatches =
            !groupedSuggestions.tag ||
            groupedSuggestions.tag.some((tag) =>
                article.tags!.some((t) => _.toLower(t) === _.toLower(tag.title))
            );
        const categoryMatches =
            !groupedSuggestions.category ||
            groupedSuggestions.category.some(
                (cat) => _.toLower(article.category) === _.toLower(cat.title)
            );
        const authorMatches =
            !groupedSuggestions.author ||
            groupedSuggestions.author.some(
                (auth) => _.toLower(article.author.username) === _.toLower(auth.title)
            );
        return tagMatches && categoryMatches && authorMatches;
    });
};

const getCompatibleSuggestions = (
    articles: Article[],
    selected: SearchSuggestion[],
    current: SearchSuggestion[]
): SearchSuggestion[] => {
    if (selected.length === 0) return current;
    return current.filter((suggestion) => {
        const hypotheticalSelections = [...selected, suggestion];
        const filteredArticles = filterArticlesBySuggestions(articles, hypotheticalSelections);
        return filteredArticles.length > 0;
    });
};

// -----------------------------------------------------------------------------
// SearchModal Component
// -----------------------------------------------------------------------------
export default function SearchModal(): JSX.Element | null {
    const isSm = useMedia('(min-width: 640px)');
    const { isOpen, closeModal, filters } = useSearchModal();
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const { showOverlay, hideOverlay } = useOverlay();
    const modalRef = useRef<HTMLDivElement>(null);

    // -----------------------------------------------------------------------------
    // Pagination: (Declared only once)
    // -----------------------------------------------------------------------------
    const [articleSuggestions, setArticleSuggestions] = useState<Article[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [transformedSuggestions, setTransformedSuggestions] = useState<SearchSuggestion[]>([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState<SearchSuggestion[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const cardsPerPage = 6;

    const handleClickPage = (pageNumber: number): void => setCurrentPage(pageNumber);
    const getPaginatedArticles = (articles: Article[]): Article[] => {
        const indexOfLastCard = currentPage * cardsPerPage;
        const indexOfFirstCard = indexOfLastCard - cardsPerPage;
        return articles.slice(indexOfFirstCard, indexOfLastCard);
    };

    const {
        watch,
        control,
        setValue,
        formState: { errors },
        clearErrors,
    } = useForm<FormValues>({
        resolver: yupResolver(searchSchema),
        defaultValues: {
            searchQuery: '',
            sortOption: 'trending',
            timeFrameOption: 'all',
        },
    });

    useEffect(() => {
        if (filters) {
            if (filters.sortOption) setValue('sortOption', filters.sortOption);
            if (filters.timeFrameOption) setValue('timeFrameOption', filters.timeFrameOption);
            if (filters.initialSuggestions) {
                setSelectedSuggestions(filters.initialSuggestions);
                // Filter articles based on initial suggestions
                const filteredArticles = filterArticlesBySuggestions(
                    articles,
                    filters.initialSuggestions
                );
                setArticleSuggestions(filteredArticles);
                const availableSuggestions = generateSearchSuggestions(filteredArticles);
                const compatibleSuggestions = getCompatibleSuggestions(
                    articles,
                    filters.initialSuggestions,
                    availableSuggestions
                );
                setTransformedSuggestions(compatibleSuggestions);
            }
        }
    }, [filters, setValue, articles]);

    const sortOption = watch('sortOption');
    const timeFrameOption = watch('timeFrameOption');

    const handleClear = () => {
        setValue('searchQuery', '');
        setSearchQuery('');
        const filteredArticles = filterArticlesBySuggestions(articles, selectedSuggestions);
        const availableSuggestions = generateSearchSuggestions(articles);
        const compatibleSuggestions = getCompatibleSuggestions(
            articles,
            selectedSuggestions,
            availableSuggestions
        );
        setArticleSuggestions(filteredArticles);
        setTransformedSuggestions(compatibleSuggestions);
        clearErrors('searchQuery');
    };

    const generateSearchSuggestions = (articles: Article[]): SearchSuggestion[] => {
        const createSuggestion = (
            id: string,
            type: 'title' | 'category' | 'author' | 'tag', // Valid SuggestionType values
            title: string,
            article: Article,
            priority: number,
            icon?: JSX.Element
        ): SearchSuggestion => ({
            _id: id,
            title,
            type,
            sourceType: 'Article' as const, // Required by the discriminated union
            source: article, // Must match sourceType ('Article')
            priority, // Now required by BaseSuggestion
            icon,
        });
        const uniqueTitles = new Set(articles.map((a) => a.title));
        const uniqueCategories = new Set(articles.map((a) => a.category));
        const uniqueTags = new Set(articles.flatMap((a) => a.tags!.map((tag) => _.toLower(tag))));
        const uniqueAuthors = new Set(articles.map((a) => a.author.username));
        const suggestions: SearchSuggestion[] = [];
        uniqueTitles.forEach((title) => {
            const article = articles.find((a) => _.toLower(a.title) === _.toLower(title))!;
            suggestions.push(
                createSuggestion(`title-${_.toLower(title)}`, 'title', title, article, 1)
            );
        });
        uniqueCategories.forEach((category) => {
            const article = articles.find((a) => _.toLower(a.category) === _.toLower(category))!;
            suggestions.push(
                createSuggestion(
                    `category-${_.toLower(category)}`,
                    'category',
                    category,
                    article,
                    2
                )
            );
        });
        uniqueTags.forEach((tag) => {
            const article = articles.find((a) =>
                a.tags!.some((t) => _.toLower(t) === _.toLower(tag))
            )!;
            suggestions.push(
                createSuggestion(
                    `tag-${_.toLower(tag)}`,
                    'tag',
                    tag,
                    article,
                    3,
                    <Hash size={16} />
                )
            );
        });
        uniqueAuthors.forEach((username) => {
            const article = articles.find(
                (a) => _.toLower(a.author.username) === _.toLower(username)
            )!;
            suggestions.push(
                createSuggestion(
                    `author-${_.toLower(username)}`,
                    'author',
                    username,
                    article,
                    4,
                    <UserSearch size={16} />
                )
            );
        });
        return suggestions;
    };

    const getFuzzyMatches = (
        searchTerm: string,
        articles: Article[]
    ): { exactMatches: Article[]; similarMatches: Article[] } => {
        const searchLower = _.toLower(searchTerm);
        const exactMatches = articles.filter(
            (article) =>
                _.includes(_.toLower(article.title), searchLower) ||
                _.includes(_.toLower(article.category), searchLower) ||
                _.includes(_.toLower(article.author.username), searchLower) ||
                article.tags!.some((tag) => _.includes(_.toLower(tag), searchLower))
        );
        if (exactMatches.length === 0) {
            const articlesWithSimilarity = articles.map((article) => ({
                article,
                similarity: Math.max(
                    stringSimilarity.compareTwoStrings(searchLower, _.toLower(article.title)),
                    stringSimilarity.compareTwoStrings(searchLower, _.toLower(article.category)),
                    article.tags!.reduce(
                        (maxSim, tag) =>
                            Math.max(
                                maxSim,
                                stringSimilarity.compareTwoStrings(searchLower, _.toLower(tag))
                            ),
                        0
                    ),
                    stringSimilarity.compareTwoStrings(
                        searchLower,
                        _.toLower(article.author.username)
                    )
                ),
            }));
            const similarMatches = articlesWithSimilarity
                .filter((item) => item.similarity > 0.4)
                .sort((a, b) => b.similarity - a.similarity)
                .map((item) => item.article);
            return { exactMatches: [], similarMatches };
        }
        return { exactMatches, similarMatches: [] };
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setValue('searchQuery', value);
        if (!value) {
            const filteredArticles = filterArticlesBySuggestions(articles, selectedSuggestions);
            const availableSuggestions = generateSearchSuggestions(articles);
            const compatibleSuggestions = getCompatibleSuggestions(
                articles,
                selectedSuggestions,
                availableSuggestions
            );
            setArticleSuggestions(filteredArticles);
            setTransformedSuggestions(compatibleSuggestions);
            clearErrors('searchQuery');
            return;
        }
        const { exactMatches, similarMatches } = getFuzzyMatches(value, articles);
        const matchedArticles = exactMatches.length > 0 ? exactMatches : similarMatches;
        const filteredMatches = filterArticlesBySuggestions(matchedArticles, selectedSuggestions);
        const suggestions = generateSearchSuggestions(matchedArticles);
        const compatibleSuggestions = getCompatibleSuggestions(
            articles,
            selectedSuggestions,
            suggestions
        );
        setArticleSuggestions(filteredMatches);
        setTransformedSuggestions(compatibleSuggestions);
        if (filteredMatches.length === 0 && value.length > 1) {
            control.setError('searchQuery', {
                type: 'manual',
                message: 'No matches found for your search criteria.',
            });
        } else {
            clearErrors('searchQuery');
        }
    };

    const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
        if (selectedSuggestions.some((s) => s._id === suggestion._id)) return;
        const newSelections = [...selectedSuggestions, suggestion];
        setSelectedSuggestions(newSelections);
        setValue('searchQuery', '');
        setSearchQuery('');
        const filteredArticles = filterArticlesBySuggestions(articles, newSelections);
        const availableSuggestions = generateSearchSuggestions(filteredArticles);
        const compatibleSuggestions = getCompatibleSuggestions(
            articles,
            newSelections,
            availableSuggestions
        );
        setArticleSuggestions(filteredArticles);
        setTransformedSuggestions(compatibleSuggestions);
        clearErrors('searchQuery');
    };

    const handleRemoveSuggestion = (suggestionToRemove: SearchSuggestion) => {
        const newSelections = selectedSuggestions.filter((s) => s._id !== suggestionToRemove._id);
        setSelectedSuggestions(newSelections);
        const filteredArticles = filterArticlesBySuggestions(articles, newSelections);
        setArticleSuggestions(filteredArticles);
    };

    const handleClearAllSuggestions = () => {
        setSelectedSuggestions([]);
        setArticleSuggestions(articles);
    };

    const containsArabic = (text: string): boolean => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    // Update suggestions and articles when filters change.
    useEffect(() => {
        const filteredArticles = applyFilters(
            articles,
            sortOption, // Already typed as SortOption
            timeFrameOption, // Already typed as TimeFrameOption
            selectedSuggestions
        );
        setArticleSuggestions(filteredArticles);

        const availableSuggestions = generateSearchSuggestions(filteredArticles);
        const compatibleSuggestions = getCompatibleSuggestions(
            articles,
            selectedSuggestions,
            availableSuggestions
        );
        setTransformedSuggestions(compatibleSuggestions);
        setCurrentPage(1);
    }, [articles, sortOption, timeFrameOption, selectedSuggestions]);

    // Show/hide overlay with correct close handler
    useEffect(() => {
        if (isOpen) {
            showOverlay({
                zIndex: 99,
                blurClass: '',
                onClick: closeModal, // Always use the same handler
            });
        } else {
            hideOverlay();
        }
        return () => hideOverlay();
    }, [isOpen, showOverlay, hideOverlay, closeModal]);

    // Escape key and click outside
    useEffect(() => {
        if (!isOpen) return;

        // Only dispatch fetchArticles if articles are not already loaded
        if (!articles || articles.length === 0) {
            dispatch(fetchArticles());
        }
        // Initialize suggestions once the modal is opened
        setArticleSuggestions(articles);
        const initialSuggestions = generateSearchSuggestions(articles);
        setTransformedSuggestions(initialSuggestions);
        setCurrentPage(1);

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) closeModal();
        };
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, closeModal, dispatch]); // Removed "articles" from here

    useEffect(() => {
        if (!isOpen) {
            // Reset all states when modal closes
            setSearchQuery('');
            setSelectedSuggestions([]);
            setTransformedSuggestions([]);
            setArticleSuggestions(articles);
            setCurrentPage(1);
            // Reset form values
            setValue('searchQuery', '');
            setValue('sortOption', 'trending');
            setValue('timeFrameOption', 'all');
        }
    }, [isOpen, setValue, articles]);

    if (!isOpen) return null;

    return (
        <AnimatedWrapper
            className="_modal__search"
            from={{
                opacity: 0,
                transform: isSm
                    ? 'translateY(-50px) translateX(-50%)'
                    : 'translateY(-50px) translateX(0)',
            }}
            to={{
                opacity: 1,
                transform: isSm ? 'translateY(0) translateX(-50%)' : 'translateY(0) translateX(0)',
            }}
            config={smoothConfig}
            ref={modalRef}
        >
            {/* Header */}
            <div className="_header">
                <div className="_formContainer">
                    <form>
                        <div className="_row">
                            <FormField
                                label="Search"
                                name="searchQuery"
                                type="text"
                                icon={<Search />}
                                error={
                                    transformedSuggestions.length === 0 && searchQuery
                                        ? 'No exact matches found, here are some suggestions.'
                                        : errors.searchQuery?.message
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
                        </div>
                    </form>
                </div>
                <AnimatedWrapper
                    as="button"
                    onClick={closeModal}
                    aria-label="Close Search"
                    className="__searchClose"
                    hover={{
                        from: { transform: 'translateX(-1%)', opacity: 0.5 },
                        to: { transform: 'translateX(0)', opacity: 1 },
                    }}
                    click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                    config={smoothConfig}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                        <g>
                            <line className="one" x1="29.5" y1="49.5" x2="70.5" y2="49.5" />
                            <line className="two" x1="29.5" y1="50.5" x2="70.5" y2="50.5" />
                        </g>
                    </svg>
                    {isSm && 'Esc'}
                </AnimatedWrapper>
            </div>

            {/* Body */}
            <div className="_body">
                {isLoading && <p>Loading articles...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                <div className="__suggestions">
                    <SimpleBar
                        className="_SimpleBar"
                        forceVisible="y"
                        autoHide={false}
                        style={{ maxHeight: '20vh' }}
                    >
                        {selectedSuggestions.length > 0 && (
                            <AnimatedWrapper
                                className="__suggestions-content"
                                from={{ opacity: 0 }}
                                to={{ opacity: 1 }}
                                config={smoothConfig}
                            >
                                <div className="selected-header">
                                    <h3>Selected Filters</h3>
                                    <button
                                        onClick={handleClearAllSuggestions}
                                        className="clear-all"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="selected-tags">
                                    {selectedSuggestions.map((suggestion) => (
                                        <AnimatedWrapper
                                            key={suggestion._id}
                                            className={`selected-tag ${suggestion.type}`}
                                            from={{ scale: 0.8, opacity: 0 }}
                                            to={{ scale: 1, opacity: 1 }}
                                            config={smoothConfig}
                                            hover={{
                                                from: { scale: 1 },
                                                to: { scale: 1.05 },
                                            }}
                                        >
                                            {suggestion.icon}
                                            <span
                                                lang={
                                                    containsArabic(suggestion.title) ? 'ar' : 'en'
                                                }
                                            >
                                                {suggestion.title}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveSuggestion(suggestion)}
                                                className="remove-tag"
                                            >
                                                <X size={14} />
                                            </button>
                                        </AnimatedWrapper>
                                    ))}
                                </div>
                            </AnimatedWrapper>
                        )}
                    </SimpleBar>

                    {/* FILTERS DROPDOWNS */}
                    <form className="__filters">
                        <div className="_row">
                            <FormField
                                control={control}
                                icon={isSm && <ArrowLeftRight />}
                                name="sortOption"
                                type="select"
                                options={[
                                    { value: 'trending', label: 'Trending' },
                                    { value: 'mostViewed', label: 'Most Viewed' },
                                    { value: 'topRated', label: 'Top Rated' },
                                    { value: 'mostRecent', label: 'Most Recent' },
                                    { value: 'mostRelevant', label: 'Most Relevant' },
                                ]}
                                rules={{ required: true }}
                            />
                            <FormField
                                control={control}
                                icon={isSm && <Timer />}
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
                        </div>
                    </form>
                </div>
                <SearchResults
                    articleSuggestions={getPaginatedArticles(articleSuggestions)}
                    onSearchClose={closeModal}
                />
            </div>

            {/* Footer */}
            <div className="_footer">
                <div className="results-info">
                    <div>
                        Showing&nbsp;
                        <strong>{currentPage * cardsPerPage - cardsPerPage + 1}</strong>
                        &nbsp;to&nbsp;
                        <strong>
                            {Math.min(currentPage * cardsPerPage, articleSuggestions.length)}
                        </strong>
                        &nbsp;of&nbsp;
                        <strong>{articleSuggestions.length}</strong>&nbsp;articles.
                    </div>
                </div>
                <ul className="_pageNumbers">
                    {(() => {
                        const totalPages = Math.ceil(articleSuggestions.length / cardsPerPage);
                        const visiblePages = [];

                        if (currentPage > 1) {
                            visiblePages.push(currentPage - 1); // Previous
                        }
                        visiblePages.push(currentPage); // Current
                        if (currentPage < totalPages) {
                            visiblePages.push(currentPage + 1); // Next
                        }

                        return visiblePages.map((number) => (
                            <li
                                key={number}
                                onClick={() => handleClickPage(number)}
                                className={currentPage === number ? 'current' : ''}
                            />
                        ));
                    })()}
                </ul>
            </div>
        </AnimatedWrapper>
    );
}
