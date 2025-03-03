import React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import SimpleBar from 'simplebar-react';

import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import ArticleCard from '@/components/ui/ArticleCard';
import { SearchSuggestion } from '@/types/search';
import { Article } from '@/types/article';

// Animation variants
const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const tagVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
};

const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
};

interface SearchResultsProps {
    readonly selectedSuggestions: ReadonlyArray<SearchSuggestion>;
    readonly articleSuggestions: ReadonlyArray<Article>;
    readonly onRemoveSuggestion: (suggestion: SearchSuggestion) => void;
    readonly onClearAllSuggestions: () => void;
    readonly onSearchClose: () => void;
}

export default function SearchResults({
    selectedSuggestions,
    articleSuggestions,
    onRemoveSuggestion,
    onClearAllSuggestions,
    onSearchClose,
}: Readonly<SearchResultsProps>) {
    const router = useRouter();

    const handleArticleClick = (article: Article) => {
        onSearchClose(); // Close the modal
        // Use the article's slug and category for navigation
        router.push(`/${article.category.toLowerCase()}/${article.slug}`);
    };

    return (
        <AnimatedWrapper
            className="search-results-container"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Selected Suggestions Panel */}
            <div className="selected-suggestions">
                <SimpleBar style={{ maxHeight: '100%' }}>
                    <AnimatePresence mode="wait">
                        {selectedSuggestions.length > 0 && (
                            <AnimatedWrapper
                                className="selected-suggestions-content"
                                variants={containerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                <div className="selected-header">
                                    <h3>Selected Filters</h3>
                                    <button onClick={onClearAllSuggestions} className="clear-all">
                                        Clear All
                                    </button>
                                </div>
                                <div className="selected-tags">
                                    <AnimatePresence>
                                        {selectedSuggestions.map((suggestion) => (
                                            <AnimatedWrapper
                                                key={suggestion._id}
                                                className={`selected-tag ${suggestion.type}`}
                                                variants={tagVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {suggestion.icon}
                                                <span>{suggestion.title}</span>
                                                <button
                                                    onClick={() => onRemoveSuggestion(suggestion)}
                                                    className="remove-tag"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </AnimatedWrapper>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </AnimatedWrapper>
                        )}
                    </AnimatePresence>
                </SimpleBar>
            </div>

            {/* Articles Grid */}
            <div className="articles-grid">
                <SimpleBar style={{ maxHeight: '100%' }}>
                    <div className="articles-grid-content">
                        <AnimatePresence>
                            {articleSuggestions.map((article, index) => (
                                <AnimatedWrapper
                                    key={article._id.toString()} // Convert ObjectId to string
                                    onClick={() => handleArticleClick(article)}
                                    className="article-card-wrapper"
                                    variants={cardVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{
                                        delay: index * 0.05, // Stagger effect
                                    }}
                                >
                                    <ArticleCard article={article} />
                                </AnimatedWrapper>
                            ))}
                        </AnimatePresence>
                    </div>
                </SimpleBar>
            </div>
        </AnimatedWrapper>
    );
}
