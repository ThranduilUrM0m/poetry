import React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import ArticleCard from '@/components/ui/ArticleCard';
import { SearchSuggestion } from '@/types/search';
import { Article } from '@/types/article';

interface SearchResultsProps {
    readonly selectedSuggestions: ReadonlyArray<SearchSuggestion>;
    readonly articleSuggestions: ReadonlyArray<Article>;
    readonly onRemoveSuggestion: (suggestion: SearchSuggestion) => void;
    readonly onClearAllSuggestions: () => void;
    readonly onSearchClose: () => void;
}

// Define the smooth beautiful configuration like in the Footer component
const smoothConfig = {
    mass: 1,
    tension: 170,
    friction: 26,
};

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
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            config={smoothConfig}
        >
            {/* Selected Suggestions Panel */}
            <div className="selected-suggestions">
                <SimpleBar style={{ maxHeight: '100%' }}>
                    {selectedSuggestions.length > 0 && (
                        <AnimatedWrapper
                            className="selected-suggestions-content"
                            from={{ opacity: 0 }}
                            to={{ opacity: 1 }}
                            config={smoothConfig}
                        >
                            <div className="selected-header">
                                <h3>Selected Filters</h3>
                                <button onClick={onClearAllSuggestions} className="clear-all">
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
                                        <span>{suggestion.title}</span>
                                        <button
                                            onClick={() => onRemoveSuggestion(suggestion)}
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
            </div>
            {/* Articles Grid */}
            <div className="articles-grid">
                <SimpleBar style={{ maxHeight: '100%' }}>
                    <div className="articles-grid-content">
                        {articleSuggestions.map((article, index) => (
                            <AnimatedWrapper
                                key={article._id.toString()} // Ensure key is a string
                                onClick={() => handleArticleClick(article)}
                                className="article-card-wrapper"
                                from={{ transform: 'translateY(20%)', opacity: 0 }}
                                to={{ transform: 'translateY(0)', opacity: 1 }}
                                config={smoothConfig}
                                delay={index * 50} // Stagger effect
                            >
                                <ArticleCard article={article} />
                            </AnimatedWrapper>
                        ))}
                    </div>
                </SimpleBar>
            </div>
        </AnimatedWrapper>
    );
}
