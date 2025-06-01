import React from 'react';
import { useRouter } from 'next/navigation';
import SimpleBar from 'simplebar-react';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import ArticleCard from '@/components/ui/ArticleCard';
import { Article } from '@/types/article';
import { normalizeString } from '@/utils/stringUtils';
import { useMedia } from 'react-use';

interface SearchResultsProps {
    readonly articleSuggestions: ReadonlyArray<Article>;
    readonly onSearchClose: () => void;
}

// Define the smooth beautiful configuration like in the Footer component
const smoothConfig = {
    mass: 1,
    tension: 170,
    friction: 26,
};

export default function SearchResults({
    articleSuggestions,
    onSearchClose,
}: Readonly<SearchResultsProps>) {
    const isSm = useMedia('(min-width: 640px)');
    const router = useRouter();

    const handleArticleClick = (article: Article) => {
        onSearchClose(); // Close the modal
        // Use the article's slug and category for navigation
        router.push(`/blog/${normalizeString(article.category)}/${article.slug}`);
    };

    return (
        <AnimatedWrapper
            className="__container"
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            config={smoothConfig}
        >
            {/* Articles Grid */}
            <div className="__articlesGrid">
                <SimpleBar
                    className="_SimpleBar"
                    forceVisible="y"
                    autoHide={false}
                    style={{ maxHeight: isSm ? '42.5vh' : '56.5vh' }}
                >
                    <div className="__articlesGrid-content">
                        {articleSuggestions.map((article, index) => (
                            <AnimatedWrapper
                                key={article._id!.toString()} // Ensure key is a string
                                onClick={() => handleArticleClick(article)}
                                className="__articleCard"
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
