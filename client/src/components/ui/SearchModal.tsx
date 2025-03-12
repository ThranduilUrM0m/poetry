'use client';
import React, { useState, useEffect, useRef, JSX } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles } from '@/slices/articleSlice';
import { selectArticles, selectIsLoading, selectError } from '@/slices/articleSlice';
import { Search, Hash, UserSearch } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import * as stringSimilarity from 'string-similarity';
import FormField from '@/components/ui/FormField';
import Overlay from '@/components/ui/Overlay';
import SearchResults from '@/components/ui/SearchResults';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { SearchSuggestion } from '@/types/search';
import { Article } from '@/types/article';
import _ from 'lodash';

// Define the validation schema
const searchSchema = Yup.object().shape({
    searchQuery: Yup.string().required('Search query is required'),
});

// Define the structure of your form data
interface FormValues {
    searchQuery: string;
}

// Define the smooth beautiful configuration like in the Footer component
const smoothConfig = { mass: 1, tension: 170, friction: 26 };

// Helper function to get compatible suggestions
const filterArticlesBySuggestions = (
    articles: Article[],
    suggestions: SearchSuggestion[]
): Article[] => {
    if (suggestions.length === 0) return articles;

    const groupedSuggestions = _.groupBy(suggestions, 'type');

    return articles.filter((article) => {
        // Tags: OR within themselves
        const tagMatches =
            !groupedSuggestions.tag ||
            groupedSuggestions.tag.some((tag) =>
                article.tags.some((t) => _.toLower(t) === _.toLower(tag.title))
            );

        // Categories: OR within themselves
        const categoryMatches =
            !groupedSuggestions.category ||
            groupedSuggestions.category.some(
                (cat) => _.toLower(article.category) === _.toLower(cat.title)
            );

        // Authors: OR within themselves
        const authorMatches =
            !groupedSuggestions.author ||
            groupedSuggestions.author.some(
                (auth) => _.toLower(article.author.username) === _.toLower(auth.title)
            );

        // AND between different types
        return tagMatches && categoryMatches && authorMatches;
    });
};

const getCompatibleSuggestions = (
    articles: Article[],
    selected: SearchSuggestion[],
    current: SearchSuggestion[]
): SearchSuggestion[] => {
    // If no selections, all suggestions are compatible
    if (selected.length === 0) return current;

    // Filter suggestions that would result in matches when combined with existing selections
    return current.filter((suggestion) => {
        const hypotheticalSelections = [...selected, suggestion];
        const filteredArticles = filterArticlesBySuggestions(articles, hypotheticalSelections);
        return filteredArticles.length > 0; // If we have any matches, the suggestion is compatible
    });
};

export default function SearchModal({
    isSearchOpen,
    onSearchClose,
}: Readonly<{ isSearchOpen: boolean; onSearchClose: () => void }>) {
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [articleSuggestions, setArticleSuggestions] = useState<Article[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [transformedSuggestions, setTransformedSuggestions] = useState<SearchSuggestion[]>([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState<SearchSuggestion[]>([]);

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 4; // Shows 4 cards per page

    const handleClickPage = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate pagination values
    const getPaginatedArticles = (articles: Article[]) => {
        const indexOfLastCard = currentPage * cardsPerPage;
        const indexOfFirstCard = indexOfLastCard - cardsPerPage;
        return articles.slice(indexOfFirstCard, indexOfLastCard);
    };

    // Use the schema in the useForm hook
    const {
        control,
        setValue,
        formState: { errors },
        clearErrors,
    } = useForm<FormValues>({
        resolver: yupResolver(searchSchema),
    });

    const handleClear = () => {
        setValue('searchQuery', '');
        setSearchQuery('');
        // Only clear the search, keep selected suggestions
        const filteredArticles = filterArticlesBySuggestions(articles, selectedSuggestions);
        const availableSuggestions = generateSearchSuggestions(filteredArticles);
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
        // Helper function to create suggestion objects
        const createSuggestion = (
            id: string,
            type: 'title' | 'category' | 'author' | 'tag',
            title: string,
            article: Article,
            priority: number,
            icon?: JSX.Element
        ): SearchSuggestion => ({
            _id: id,
            title: _.startCase(title), // Capitalize first letter of each word
            type,
            source: article,
            priority,
            icon,
        });

        // Get unique values using Sets with case-insensitive comparison
        const uniqueTitles = new Set(articles.map((a) => _.startCase(a.title)));
        const uniqueCategories = new Set(articles.map((a) => _.startCase(a.category)));
        const uniqueTags = new Set(articles.flatMap((a) => a.tags.map((tag) => _.startCase(tag))));
        const uniqueAuthors = new Set(articles.map((a) => _.startCase(a.author.username)));

        // Create suggestions arrays
        const suggestions: SearchSuggestion[] = [];

        // Add title suggestions
        uniqueTitles.forEach((title) => {
            const article = articles.find((a) => _.toLower(a.title) === _.toLower(title))!;
            suggestions.push(
                createSuggestion(`title-${_.toLower(title)}`, 'title', title, article, 1)
            );
        });

        // Add category suggestions
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

        // Add tag suggestions
        uniqueTags.forEach((tag) => {
            const article = articles.find((a) =>
                a.tags.some((t) => _.toLower(t) === _.toLower(tag))
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

        // Add author suggestions
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

        // First try exact matches in all fields
        const exactMatches = articles.filter(
            (article) =>
                _.includes(_.toLower(article.title), searchLower) ||
                _.includes(_.toLower(article.category), searchLower) ||
                _.includes(_.toLower(article.author.username), searchLower) ||
                article.tags.some((tag) => _.includes(_.toLower(tag), searchLower))
        );

        // If no exact matches, try fuzzy matching with improved relevance scoring
        if (exactMatches.length === 0) {
            const articlesWithSimilarity = articles.map((article) => ({
                article,
                similarity: Math.max(
                    stringSimilarity.compareTwoStrings(searchLower, _.toLower(article.title)),
                    stringSimilarity.compareTwoStrings(searchLower, _.toLower(article.category)),
                    article.tags.reduce(
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

    // Fix: Update handleSearch to properly handle compatible suggestions
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setValue('searchQuery', value);

        // If empty input, show filtered results based on selections
        if (!value) {
            const filteredArticles = filterArticlesBySuggestions(articles, selectedSuggestions);
            const availableSuggestions = generateSearchSuggestions(articles); // Generate from ALL articles
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

        // Search in ALL articles first
        const { exactMatches, similarMatches } = getFuzzyMatches(value, articles);
        const matchedArticles = exactMatches.length > 0 ? exactMatches : similarMatches;

        // Then filter by selected suggestions
        const filteredMatches = filterArticlesBySuggestions(matchedArticles, selectedSuggestions);

        // Generate suggestions from ALL articles matching the search
        const suggestions = generateSearchSuggestions(matchedArticles);
        const compatibleSuggestions = getCompatibleSuggestions(
            articles,
            selectedSuggestions,
            suggestions
        );

        setArticleSuggestions(filteredMatches);
        setTransformedSuggestions(compatibleSuggestions);

        // Handle errors
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
        // Don't add duplicate selections
        if (selectedSuggestions.some((s) => s._id === suggestion._id)) {
            return;
        }

        const newSelections = [...selectedSuggestions, suggestion];
        setSelectedSuggestions(newSelections);

        // Clear input after selection
        setValue('searchQuery', '');
        setSearchQuery('');

        // Filter articles based on all selections
        const filteredArticles = filterArticlesBySuggestions(articles, newSelections);

        // Generate new suggestions based on filtered articles
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

        // Refilter articles with remaining selections
        const filteredArticles = filterArticlesBySuggestions(articles, newSelections);
        setArticleSuggestions(filteredArticles);
    };

    const handleClearAllSuggestions = () => {
        setSelectedSuggestions([]);
        setArticleSuggestions(articles);
    };

    useEffect(() => {
        if (isSearchOpen) {
            dispatch(fetchArticles());
            // Show all articles initially
            setArticleSuggestions(articles);
            // Generate initial suggestions from ALL articles
            const initialSuggestions = generateSearchSuggestions(articles);
            setTransformedSuggestions(initialSuggestions);
            // Reset pagination
            setCurrentPage(1);
        }

        // Event listeners for Escape key and click outside
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSearchOpen) {
                onSearchClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) && // Click is outside the modal
                overlayRef.current &&
                overlayRef.current.contains(event.target as Node) // Click is on the overlay
            ) {
                onSearchClose();
            }
        };

        if (isSearchOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, onSearchClose, dispatch]);

    return (
        <>
            {isSearchOpen && (
                <>
                    <Overlay
                        isVisible={isSearchOpen}
                        onClick={onSearchClose}
                        zIndex={20} // Explicitly set z-20 for search modal
                    />
                    <AnimatedWrapper
                        className="_modal__search"
                        from={{ opacity: 0, transform: 'translateY(-50px) translateX(-50%)' }}
                        to={{ opacity: 1, transform: 'translateY(0) translateX(-50%)' }}
                        config={smoothConfig}
                        ref={modalRef}
                    >
                        {/* Header */}
                        <div className="_header">
                            <div className="_formContainer">
                                <form>
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
                                        allArticles={articles} // Pass the original articles array
                                        control={control}
                                        rules={{ required: 'This field is required' }}
                                        onClear={handleClear}
                                        onInputChange={handleSearch}
                                        onSuggestionSelect={handleSuggestionSelect}
                                        selectedSuggestions={selectedSuggestions}
                                    />
                                </form>
                            </div>
                            <AnimatedWrapper
                                as="button"
                                onClick={onSearchClose}
                                aria-label="Close Search"
                                className="__searchClose"
                                hover={{ from: { scale: 1 }, to: { scale: 1.1 } }}
                                click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                                config={smoothConfig}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                    <g>
                                        <line
                                            className="one"
                                            x1="29.5"
                                            y1="49.5"
                                            x2="70.5"
                                            y2="49.5"
                                        ></line>
                                        <line
                                            className="two"
                                            x1="29.5"
                                            y1="50.5"
                                            x2="70.5"
                                            y2="50.5"
                                        ></line>
                                    </g>
                                </svg>
                            </AnimatedWrapper>
                        </div>

                        {/* Body */}
                        <div className="_body">
                            {isLoading && <p>Loading articles...</p>}
                            {error && <p className="text-red-500">Error: {error}</p>}
                            <SearchResults
                                selectedSuggestions={selectedSuggestions}
                                articleSuggestions={getPaginatedArticles(articleSuggestions)}
                                onRemoveSuggestion={handleRemoveSuggestion}
                                onClearAllSuggestions={handleClearAllSuggestions}
                                onSearchClose={onSearchClose}
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
                                        {Math.min(
                                            currentPage * cardsPerPage,
                                            articleSuggestions.length
                                        )}
                                    </strong>
                                    &nbsp;of&nbsp;
                                    <strong>{articleSuggestions.length}</strong>
                                    &nbsp;articles.
                                </div>
                            </div>
                            <ul className="_pageNumbers">
                                {_.map(
                                    _.range(
                                        1,
                                        Math.ceil(articleSuggestions.length / cardsPerPage) + 1
                                    ),
                                    (number) => (
                                        <li
                                            key={number}
                                            onClick={() => handleClickPage(number)}
                                            className={currentPage === number ? 'current' : ''}
                                        ></li>
                                    )
                                )}
                            </ul>
                        </div>
                    </AnimatedWrapper>
                </>
            )}
        </>
    );
}
