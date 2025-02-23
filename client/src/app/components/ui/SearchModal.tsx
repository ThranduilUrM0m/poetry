'use client';

import React, { useState, useEffect, useRef } from 'react';
/* import Link from 'next/link'; */
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import FormField from './FormField';
import AnimatedWrapper from './AnimatedWrapper';
/* import _ from 'lodash'; */

// Define the structure of your form data
interface FormValues {
    searchQuery: string;
}

// Define the structure of an article suggestion
interface ArticleSuggestion {
    id: string;
    title: string;
    body: string;
    author: string;
    category: string;
    isPrivate: boolean;
    tags: string[];
    comments: string[];
    views: string[];
    upvotes: string[];
    downvotes: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

// Backdrop variants
const backdropVariants = {
    open: {
        opacity: 1,
        zIndex: 20,
        transition: {
            duration: 0.3,
            ease: 'easeInOut',
        },
    },
    closed: {
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: 'easeInOut',
        },
    },
};

// Modal variants
const modalVariants = {
    open: {
        opacity: 1,
        zIndex: 30,
        filter: 'blur(0px)',
        RotateX: 0,
        transformX: '-50%',
        transition: {
            duration: 0.5,
            ease: 'easeInOut',
        },
    },
    closed: {
        opacity: 0,
        filter: 'blur(10px)',
        RotateX: 90,
        transformX: '-50%',
        transition: {
            duration: 0.5,
            ease: 'easeInOut',
        },
    },
};

export default function SearchModal({
    isSearchOpen,
    onSearchClose,
}: Readonly<{
    isSearchOpen: boolean;
    onSearchClose: () => void;
}>) {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [articleSuggestions, setArticleSuggestions] = useState<ArticleSuggestion[]>([]);
    const {
        control,
        setValue,
        formState: { errors },
    } = useForm<FormValues>();

    const handleClear = () => {
        setValue('searchQuery', '');
    };

    // Handle suggestion selection
    /* const handleSuggestionSelect = (suggestion: ArticleSuggestion) => {
        setValue('searchQuery', suggestion.title);
        // Perform additional actions upon selecting a suggestion, if needed
    }; */

    /* const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 6;

    interface Article {
        title: string;
        description: string;
        link: string;
        // Add other relevant properties here
    } */

    // Sample data for articles and projects
    /* const articles = [
        {
            title: 'Understanding JavaScript Closures',
            description: 'A deep dive into closures in JavaScript.',
            link: '/articles/js-closures',
        },
        {
            title: 'A Guide to Responsive Web Design',
            description: 'Learn how to create responsive layouts.',
            link: '/articles/responsive-design',
        },
    ]; */

    // Filter articles based on search query
    /* const filteredArticles = _.filter(articles, (article: Article) =>
        _.includes(_.toLower(article.title), _.toLower(searchQuery))
    ); */

    // Paginate filtered articles
    // const paginatedArticles = _.chunk(filteredArticles, cardsPerPage)[currentPage - 1] || [];

    // Calculate total pages
    // const totalPages = _.ceil(_.size(filteredArticles) / cardsPerPage);

    // Handle page change
    /* const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    }; */

    useEffect(() => {
        // Dummy data representing articles
        const dummyArticles: ArticleSuggestion[] = [
            {
                id: '1',
                title: 'Understanding React Hooks',
                body: 'An in-depth look at React Hooks and how to use them effectively.',
                author: 'Jane Doe',
                category: 'React',
                isPrivate: false,
                tags: ['react', 'hooks', 'javascript'],
                comments: [],
                views: [],
                upvotes: [],
                downvotes: [],
                status: 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: '2',
                title: 'Advanced TypeScript Tips',
                body: 'Enhance your TypeScript skills with these advanced tips and tricks.',
                author: 'John Smith',
                category: 'TypeScript',
                isPrivate: false,
                tags: ['typescript', 'javascript', 'programming'],
                comments: [],
                views: [],
                upvotes: [],
                downvotes: [],
                status: 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            // Add more dummy articles as needed
        ];

        // Simulate an API call with a timeout
        setTimeout(() => {
            setArticleSuggestions(dummyArticles.filter(article => !article.isPrivate));
        }, 500); // Adjust the timeout as needed

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSearchOpen) {
                onSearchClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (overlayRef.current && overlayRef.current.contains(event.target as Node)) {
                // Click is on the overlay; close the menu
                onSearchClose();
            } else if (modalRef.current && modalRef.current.contains(event.target as Node)) {
                // Click is inside the background; keep the menu open
                return;
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
    }, [isSearchOpen, onSearchClose]);

    return (
        isSearchOpen && (
            <>
                {/* Backdrop Overlay */}
                <AnimatedWrapper
                    as="div"
                    className="__overlay"
                    ref={overlayRef}
                    variants={backdropVariants}
                    initial="closed"
                    animate={isSearchOpen ? 'open' : 'closed'}
                    exit="closed"
                />

                {/* Search Modal */}
                <AnimatedWrapper
                    as="div"
                    ref={modalRef}
                    className="_modal__search"
                    variants={modalVariants}
                    initial="closed"
                    animate={isSearchOpen ? 'open' : 'closed'}
                    exit="closed"
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
                                    error={errors.searchQuery?.message}
                                    suggestions={articleSuggestions}
                                    control={control}
                                    rules={{ required: 'This field is required' }}
                                    onClear={handleClear}
                                    /* onSuggestionSelect={handleSuggestionSelect} */
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
                    {/* <div className="_body">
                            {paginatedArticles.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {paginatedArticles.map((article: Article, index: number) => (
                                        <div
                                            key={index}
                                            className="p-4 border rounded shadow hover:shadow-md transition-shadow"
                                        >
                                            <h3 className="text-lg font-semibold">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {article.description}
                                            </p>
                                            <Link href={article.link}>
											Read more
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No results found.</p>
                            )}
                        </div> */}

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
        )
    );
}
