'use client';

import React, { useState, useEffect, useRef, JSX } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, Hash, UserSearch } from 'lucide-react'; // Add Hash and UserSearch imports
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { AnimatePresence } from 'framer-motion';
import * as stringSimilarity from 'string-similarity';

import FormField from '@/components/ui/FormField';
import Overlay from '@/components/ui/Overlay';
import SearchResults from '@/components/ui/SearchResults';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { dummyArticles } from '@/data/dummyArticles';
import { SearchSuggestion, ArticleSuggestion } from '@/types/search';

import _ from 'lodash';

// Define the validation schema
const searchSchema = Yup.object().shape({
    searchQuery: Yup.string().required('Search query is required'),
});

// Define the structure of your form data
interface FormValues {
    searchQuery: string;
}

// Update the modal variants
const modalVariants = {
    open: {
        opacity: 1,
        x: '-50%',
        y: 0,
        scale: 1,
        display: 'block',
    },
    closed: {
        opacity: 0,
        x: '-50%',
        y: -50,
        scale: 0.95,
        transitionEnd: {
            display: 'none',
        },
    },
};

// Add this helper function
const getCompatibleSuggestions = (
    articles: ArticleSuggestion[],
    selected: SearchSuggestion[],
    current: SearchSuggestion[]
): SearchSuggestion[] => {
    // First, get articles that match current selections
    const compatibleArticles = articles.filter((article) => {
        return selected.every((selection) => {
            switch (selection.type) {
                case 'tag':
                    return article.tags.includes(selection.title);
                case 'category':
                    return article.category === selection.title;
                case 'author':
                    return article.author.username === selection.title;
                case 'title':
                    return article.title === selection.title;
                default:
                    return false;
            }
        });
    });

    // Then, filter suggestions that could combine with current selections
    return current.filter((suggestion) => {
        // Check if adding this suggestion would still result in matches
        const hypotheticalSelections = [...selected, suggestion];
        return compatibleArticles.some((article) => {
            return hypotheticalSelections.every((selection) => {
                switch (selection.type) {
                    case 'tag':
                        return article.tags.includes(selection.title);
                    case 'category':
                        return article.category === selection.title;
                    case 'author':
                        return article.author.username === selection.title;
                    case 'title':
                        return article.title === selection.title;
                    default:
                        return false;
                }
            });
        });
    });
};

export default function SearchModal({
    isSearchOpen,
    onSearchClose,
}: Readonly<{
    isSearchOpen: boolean;
    onSearchClose: () => void;
}>) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [articleSuggestions, setArticleSuggestions] = useState<ArticleSuggestion[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [transformedSuggestions, setTransformedSuggestions] = useState<SearchSuggestion[]>([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState<SearchSuggestion[]>([]);

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
        const filteredArticles = filterArticlesBySuggestions(dummyArticles, selectedSuggestions);
        const availableSuggestions = generateSearchSuggestions(filteredArticles);
        const compatibleSuggestions = getCompatibleSuggestions(
            dummyArticles,
            selectedSuggestions,
            availableSuggestions
        );
        setArticleSuggestions(filteredArticles);
        setTransformedSuggestions(compatibleSuggestions);
        clearErrors('searchQuery');
    };

    const generateSearchSuggestions = (articles: ArticleSuggestion[]): SearchSuggestion[] => {
        const createSuggestion = (
            article: ArticleSuggestion,
            type: 'title' | 'category' | 'author' | 'tag',
            title: string,
            priority: number,
            icon?: JSX.Element
        ): SearchSuggestion => ({
            id: `${article.id}-${type}`,
            title,
            type,
            source: article,
            priority,
            icon, // Add icon to the suggestion object
        });

        return _.flatMap(articles, (article) => [
            createSuggestion(article, 'title', article.title, 1),
            createSuggestion(article, 'category', article.category, 2),
            ...article.tags.map((tag) =>
                createSuggestion(article, 'tag', tag, 3, <Hash size={16} />)
            ),
            createSuggestion(
                article,
                'author',
                article.author.username,
                4,
                <UserSearch size={16} />
            ),
        ]);
    };

    const getFuzzyMatches = (
        searchTerm: string,
        articles: ArticleSuggestion[]
    ): {
        exactMatches: ArticleSuggestion[];
        similarMatches: ArticleSuggestion[];
    } => {
        const searchLower = _.toLower(searchTerm);

        // First try exact matches in all fields
        const exactMatches = articles.filter(
            (article) =>
                _.includes(_.toLower(article.title), searchLower) ||
                _.includes(_.toLower(article.category), searchLower) ||
                _.includes(_.toLower(article.author.username), searchLower) ||
                article.tags.some((tag) => _.includes(_.toLower(tag), searchLower))
        );

        if (exactMatches.length > 0) {
            return { exactMatches, similarMatches: [] };
        }

        // If no exact matches, try fuzzy matching
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
                )
            ),
        }));

        // Filter articles with good similarity (above 0.4)
        const similarMatches = articlesWithSimilarity
            .filter((item) => item.similarity > 0.4)
            .sort((a, b) => b.similarity - a.similarity)
            .map((item) => item.article);

        return { exactMatches: [], similarMatches };
    };

    const filterArticlesBySuggestions = (
        articles: ArticleSuggestion[],
        suggestions: SearchSuggestion[]
    ): ArticleSuggestion[] => {
        if (suggestions.length === 0) return articles;

        const groupedSuggestions = _.groupBy(suggestions, 'type');

        return articles.filter((article) => {
            // Tags: OR within themselves
            const tagMatches =
                !groupedSuggestions.tag ||
                groupedSuggestions.tag.some((tag) => article.tags.includes(tag.title));

            // Categories: OR within themselves
            const categoryMatches =
                !groupedSuggestions.category ||
                groupedSuggestions.category.some((cat) => article.category === cat.title);

            // Authors: OR within themselves
            const authorMatches =
                !groupedSuggestions.author ||
                groupedSuggestions.author.some((auth) => article.author.username === auth.title);

            // AND between different types
            return tagMatches && categoryMatches && authorMatches;
        });
    };

    // Fix: Update handleSearch to properly handle compatible suggestions
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setValue('searchQuery', value);

        if (!value) {
            const filteredArticles = filterArticlesBySuggestions(
                dummyArticles,
                selectedSuggestions
            );
            const availableSuggestions = generateSearchSuggestions(filteredArticles); // Changed from dummyArticles to filteredArticles
            const compatibleSuggestions = getCompatibleSuggestions(
                dummyArticles,
                selectedSuggestions,
                availableSuggestions
            );

            setArticleSuggestions(filteredArticles);
            setTransformedSuggestions(compatibleSuggestions);
            clearErrors('searchQuery');
            return;
        }

        // First filter by selected suggestions
        const preFilteredArticles = filterArticlesBySuggestions(dummyArticles, selectedSuggestions);
        const { exactMatches, similarMatches } = getFuzzyMatches(value, preFilteredArticles);

        // Generate and filter suggestions
        const suggestions = generateSearchSuggestions(exactMatches);
        const compatibleSuggestions = getCompatibleSuggestions(
            dummyArticles,
            selectedSuggestions,
            suggestions
        );

        setArticleSuggestions(exactMatches.length > 0 ? exactMatches : similarMatches);
        setTransformedSuggestions(compatibleSuggestions);

        // Error handling
        if (exactMatches.length === 0) {
            if (value.length > 1) {
                control.setError('searchQuery', {
                    type: 'manual',
                    message: 'No exact matches found.',
                });
            } else {
                clearErrors('searchQuery');
            }
        } else {
            clearErrors('searchQuery');
        }
    };

    const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
        // Don't add duplicate selections
        if (selectedSuggestions.some((s) => s.id === suggestion.id)) {
            return;
        }

        const newSelections = [...selectedSuggestions, suggestion];
        setSelectedSuggestions(newSelections);

        // Clear input after selection
        setValue('searchQuery', '');
        setSearchQuery('');

        // Filter articles based on all selections
        const filteredArticles = filterArticlesBySuggestions(dummyArticles, newSelections);
        // Generate new suggestions based on filtered articles
        const availableSuggestions = generateSearchSuggestions(filteredArticles);
        const compatibleSuggestions = getCompatibleSuggestions(
            dummyArticles,
            newSelections,
            availableSuggestions
        );

        setArticleSuggestions(filteredArticles);
        setTransformedSuggestions(compatibleSuggestions);
        clearErrors('searchQuery');
    };

    const handleRemoveSuggestion = (suggestionToRemove: SearchSuggestion) => {
        const newSelections = selectedSuggestions.filter((s) => s.id !== suggestionToRemove.id);
        setSelectedSuggestions(newSelections);

        // Refilter articles with remaining selections
        const filteredArticles = filterArticlesBySuggestions(dummyArticles, newSelections);
        setArticleSuggestions(filteredArticles);
    };

    const handleClearAllSuggestions = () => {
        setSelectedSuggestions([]);
        setArticleSuggestions(dummyArticles);
    };

    useEffect(() => {
        // Initialize with all articles and their suggestions
        setArticleSuggestions(dummyArticles);
        const initialSuggestions = generateSearchSuggestions(dummyArticles);
        setTransformedSuggestions(initialSuggestions);

        // Event listeners for Escape key and click outside
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSearchOpen) {
                onSearchClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (overlayRef.current && overlayRef.current.contains(event.target as Node)) {
                onSearchClose();
            } else if (modalRef.current && modalRef.current.contains(event.target as Node)) {
                return;
            }
        };

        if (isSearchOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Listen for route changes using pathname and searchParams
        const handleRouteChange = () => {
            if (isSearchOpen) {
                onSearchClose();
            }
        };

        // Trigger handleRouteChange when pathname or searchParams change
        handleRouteChange();

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, onSearchClose, pathname, searchParams]);

    return (
        <AnimatePresence mode="wait">
            {isSearchOpen && (
                <>
                    <Overlay
                        isVisible={isSearchOpen}
                        onClick={onSearchClose}
                        zIndex={20} // Explicitly set z-20 for search modal
                    />
                    <AnimatedWrapper
                        className="_modal__search"
                        variants={modalVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        transition={{
                            duration: 0.2,
                            ease: 'easeInOut',
                        }}
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
                                        allArticles={dummyArticles} // Pass the original articles array
                                        control={control}
                                        rules={{ required: 'This field is required' }}
                                        onClear={handleClear}
                                        onInputChange={handleSearch}
                                        onSuggestionSelect={handleSuggestionSelect}
                                        selectedSuggestions={selectedSuggestions} // Fix: Add missing selectedSuggestions prop to FormField
                                    />
                                </form>
                            </div>
                            <AnimatedWrapper
                                as="button"
                                onClick={onSearchClose}
                                aria-label="Close Search"
                                className="__searchClose"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.5 }}
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
                            <SearchResults
                                selectedSuggestions={selectedSuggestions}
                                articleSuggestions={articleSuggestions}
                                onRemoveSuggestion={handleRemoveSuggestion}
                                onClearAllSuggestions={handleClearAllSuggestions}
                            />
                        </div>

                        {/* Footer */}
                        {/* <div className="_footer">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">
                                        Showing{' '}
                                        <strong>
                                            {currentPage * cardsPerPage - cardsPerPage + 1} -{' '}
                                            {Math.min(
                                                currentPage * cardsPerPage,
                                                _.size(filteredArticles)
                                            )}
                                        </strong>{' '}
                                        of <strong>{_.size(filteredArticles)}</strong> articles.
                                    </p>
                                    <div className="flex space-x-1">
                                        {_.times(totalPages, (page: number) => (
                                            <button
                                                key={page + 1}
                                                onClick={() => handlePageClick(page + 1)}
                                                className={`px-2 py-1 border rounded ${
                                                    currentPage === page + 1
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white text-blue-500'
                                                }`}
                                            >
                                                {page + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div> */}
                    </AnimatedWrapper>
                </>
            )}
        </AnimatePresence>
    );
}
