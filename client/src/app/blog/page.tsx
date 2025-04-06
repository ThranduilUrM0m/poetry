'use client';
import { useEffect, useState, JSX } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles, selectArticles, selectIsLoading } from '@/slices/articleSlice';
import _ from 'lodash';
import { formatDistanceToNow } from 'date-fns';
import { Hash } from 'lucide-react';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';
import { LuEye, LuThumbsUp, LuMessageSquareMore, LuSquircle } from 'react-icons/lu';
import { config } from '@react-spring/web';
import Link from 'next/link';
import { Article, Vote } from '@/types/article';
import { useSearchParams } from 'next/navigation';
import { useSearchModal } from '@/context/SearchModalContext';
import Image from 'next/image';

/**
 * Extracts the first <img> element from the given HTML string
 * and returns a Next.js <Image> component.
 * If no image is found, returns null.
 */
export function extractFirstImage(htmlContent: string): JSX.Element | null {
    if (!htmlContent) return null;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const imgElement = tempDiv.querySelector('img');
    if (imgElement) {
        const src = imgElement.getAttribute('src');
        const alt = imgElement.getAttribute('alt') || 'Article Image';
        if (src) {
            return <Image src={src} alt={alt} fill className="object-cover" />;
        }
    }
    return null;
}

/**
 * Extracts text from an HTML string.
 * If maxLength is provided, returns a substring of that length with ellipsis.
 * Otherwise, splits the text by punctuation and returns the first sentence.
 */
export function extractFirstPhrase(htmlContent: string, maxLength?: number): string {
    if (!htmlContent) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    if (maxLength && textContent.length > maxLength) {
        return textContent.slice(0, maxLength).trim() + '...';
    }

    const firstSentence = textContent.split(/[.!?]+/)[0];
    return firstSentence.trim();
}

export default function BlogPage() {
    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles) || [];
    const isLoading = useSelector(selectIsLoading);
    const { openModal } = useSearchModal();

    // Combined ready state
    const [isReady, setIsReady] = useState(false);

    // Catgeory
    const params = useSearchParams()
    const category = params.get('slug')

    useEffect(() => {
        if (category) {
            openModal({
                initialSuggestions: [
                    {
                        _id: `category-${category}`, // Unique ID for the suggestion
                        title: category, // The category name
                        type: 'category', // Type must match the expected values
                    },
                ],
            });
            console.log('category', category);
        }
    }, [category]);

    // Fetch articles on mount
    useEffect(() => {
        dispatch(fetchArticles());
    }, [dispatch]);

    useEffect(() => {
        if (isLoaded && !isLoading && articles.length > 0) {
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isLoading, articles]);

    /* Best of the week */
    // Editable initial time range in days (e.g., 7 for a week, can be changed to 1, etc.)
    const initialRangeDays = 7;
    // Define a hierarchy of time ranges (in days) for gradual timeline broadening
    const timeRanges: number[] = [initialRangeDays, 30, 60, 90, 120, 150, 180];

    // Function to calculate the attraction score for each article
    const getAttractionScore = (article: Article) => {
        const viewsCount = _.get(article, 'views.length', 0);
        const commentsCount = _.get(article, 'comments.length', 0);

        const votes = _.get(article, 'votes', []);
        const upvotesCount = votes.filter((vote: Vote) => vote.direction === 'up').length;
        const downvotesCount = votes.filter((vote: Vote) => vote.direction === 'down').length;

        // Compute weighted score: adjust weights as needed for your business logic
        let score: number = viewsCount + 2 * commentsCount + 3 * upvotesCount - 2 * downvotesCount;

        // Apply boost if the designated field (isFeatured) is true
        if (article.isFeatured) {
            score *= 1.5;
        }
        return score;
    };

    const now: Date = new Date();
    const bestArticle = _.chain(articles)
        .thru((articles: Article[]) => {
            // Iteratively check each time range: if articles exist within the current range, use them
            for (const range of timeRanges) {
                const filtered = articles.filter((article) => {
                    const createdAt = new Date(article.createdAt!);
                    const diffDays: number =
                        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
                    return diffDays <= range;
                });
                if (filtered.length > 0) {
                    return filtered;
                }
            }
            // Fallback: if no articles match any time range, return the full list
            return articles;
        })
        .map((article: Article) => ({
            ...article,
            score: getAttractionScore(article),
        }))
        .maxBy('score')
        .value();
    /* Best of the week */

    /* views and rating */
    // Function to calculate view score based on recency
    const calculateViewScore = (article: Article): number => {
        const viewsCount = _.get(article, 'views.length', 0);
        const createdAt = new Date(article.createdAt!);
        const now = new Date();
        const daysSincePublication = Math.floor(
            (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const recencyFactor = Math.max(0, 30 - daysSincePublication); // Articles within 30 days get higher recency factor
        return viewsCount * (1 + recencyFactor / 30); // Adjust the divisor to scale the recency impact
    };

    // Function to calculate upvote score based on recency using the new vote model
    const calculateUpvoteScore = (article: Article): number => {
        const votes = _.get(article, 'votes', []);
        const upvotesCount = votes.filter((vote: Vote) => vote.direction === 'up').length;
        const createdAt = new Date(article.createdAt!);
        const now = new Date();
        const daysSincePublication = Math.floor(
            (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const recencyFactor = Math.max(0, 30 - daysSincePublication);
        return upvotesCount * (1 + recencyFactor / 30);
    };

    // Calculate scores for each article
    const articlesWithViewScores = articles.map((article) => ({
        ...article,
        viewScore: calculateViewScore(article),
    }));

    const articlesWithUpvoteScores = articles.map((article) => ({
        ...article,
        upvoteScore: calculateUpvoteScore(article),
    }));

    // Sort articles by view score in descending order
    const mostViewedArticles = _.orderBy(articlesWithViewScores, ['viewScore'], ['desc']).slice(
        0,
        4
    );

    // Sort articles by upvote score in descending order
    const topRatedArticles = _.orderBy(articlesWithUpvoteScores, ['upvoteScore'], ['desc']).slice(
        0,
        3
    );

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return (
        <main className="blog">
            <SectionObserver theme="dark">
                <section className="blog__section-1 !pb-0">
                    <AnimatedWrapper
                        as="div"
                        className="blog__section-1-left"
                        from={{ transform: 'translateX(-100%)', opacity: 0 }}
                        to={isReady ? { transform: 'translateX(0)', opacity: 1 } : undefined}
                        config={{ mass: 1, tension: 170, friction: 26 }}
                        delay={1000}
                    >
                        <div className="__bestOfWeek">
                            <h1 className="__title">Best of the week</h1>
                            <div className="_card">
                                <div className="_cardBody">
                                    {bestArticle ? (
                                        <>
                                            <div className="__background">
                                                {extractFirstImage(bestArticle.body)}
                                            </div>

                                            <form className="_form">
                                                <div className="__top">
                                                    <span
                                                        lang={
                                                            containsArabic(bestArticle.category)
                                                                ? 'ar'
                                                                : 'en'
                                                        }
                                                        className="__articleCategory"
                                                    >
                                                        {_.upperFirst(bestArticle.category)}
                                                    </span>
                                                    <span className="__articleDate">
                                                        {formatDistanceToNow(
                                                            new Date(bestArticle.updatedAt!),
                                                            {
                                                                addSuffix: true,
                                                            }
                                                        )}
                                                    </span>
                                                </div>

                                                <span
                                                    lang={
                                                        containsArabic(bestArticle.body)
                                                            ? 'ar'
                                                            : 'en'
                                                    }
                                                    className="firstPhrase"
                                                >
                                                    {bestArticle.body &&
                                                        extractFirstPhrase(bestArticle.body)}
                                                </span>

                                                <h2
                                                    className={`${
                                                        containsArabic(bestArticle.title) && '__ar'
                                                    }`}
                                                    lang={
                                                        containsArabic(bestArticle.title)
                                                            ? 'ar'
                                                            : 'en'
                                                    }
                                                >
                                                    {bestArticle.title}
                                                    <b className="__dot">.</b>
                                                </h2>

                                                <div className="tags">
                                                    {_.map(bestArticle.tags, (tag, index) => (
                                                        <span
                                                            lang={containsArabic(tag) ? 'ar' : 'en'}
                                                            key={index}
                                                            className="tag"
                                                        >
                                                            <Hash />
                                                            {_.upperFirst(tag)}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="_row">
                                                    <Link
                                                        href={`/blog/${bestArticle.category.toLowerCase()}/${
                                                            bestArticle.slug
                                                        }`}
                                                        className="_button"
                                                        id="_buttonArticle"
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
                                                            parentHoverSelector="#_buttonArticle"
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
                                                                parentHoverSelector="#_buttonArticle" // <-- Updated parent hover selector
                                                                onRest={() => {
                                                                    // Trigger the next animation after this one completes
                                                                    document
                                                                        .querySelector('.borderRight')
                                                                        ?.dispatchEvent(
                                                                            new Event('startAnimation')
                                                                        );
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
                                                                parentHoverSelector="#_buttonArticle" // <-- Updated parent hover selector
                                                                onRest={() => {
                                                                    // Trigger the next animation after this one completes
                                                                    document
                                                                        .querySelector('.borderBottom')
                                                                        ?.dispatchEvent(
                                                                            new Event('startAnimation')
                                                                        );
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
                                                                parentHoverSelector="#_buttonArticle" // <-- Updated parent hover selector
                                                                onRest={() => {
                                                                    // Trigger the next animation after this one completes
                                                                    document
                                                                        .querySelector('.borderLeft')
                                                                        ?.dispatchEvent(
                                                                            new Event('startAnimation')
                                                                        );
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
                                                                parentHoverSelector="#_buttonArticle" // <-- Updated parent hover selector
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
                                                            parentHoverSelector="#_buttonArticle"
                                                        >
                                                            Read More About it
                                                            <b className="__dot">.</b>
                                                        </AnimatedWrapper>
                                                    </Link>
                                                </div>

                                                <div className="information">
                                                    <b>
                                                        {_.size(bestArticle.comments)}{' '}
                                                        <LuMessageSquareMore />
                                                    </b>
                                                    <b>
                                                        {
                                                            // Use the unified vote model to show the number of upvotes
                                                            _.size(
                                                                bestArticle.votes?.filter(
                                                                    (vote: Vote) =>
                                                                        vote.direction === 'up'
                                                                ) || []
                                                            )
                                                        }{' '}
                                                        <LuThumbsUp />
                                                    </b>
                                                    <b>
                                                        {_.size(bestArticle.views)} <LuEye />
                                                    </b>
                                                    <LuSquircle />
                                                    <b>
                                                        by{' '}
                                                        {_.isEmpty(bestArticle.author.lastName) &&
                                                        _.isEmpty(bestArticle.author.firstName)
                                                            ? bestArticle.author.username
                                                            : !_.isEmpty(
                                                                  bestArticle.author.lastName
                                                              )
                                                            ? `${bestArticle.author.lastName} ${bestArticle.author.firstName}`
                                                            : bestArticle.author.firstName ??
                                                              bestArticle.author.username}
                                                    </b>
                                                </div>
                                            </form>
                                        </>
                                    ) : (
                                        // Render a fallback UI or message indicating no articles are available
                                        <p>Loading articles...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="__topRated">
                            <div className="__header">
                                <h2 className="__title">Top Rated</h2>
                                <button
                                    className="__viewMore"
                                    onClick={() =>
                                        openModal({
                                            sortOption: 'topRated',
                                            timeFrameOption: 'all',
                                        })
                                    }
                                >
                                    <AnimatedWrapper
                                        as="span" // Use a span to wrap the text and arrow
                                        hover={{
                                            from: { transform: 'translateX(0px)' },
                                            to: { transform: 'translateX(-5px)' },
                                        }}
                                        config={config.wobbly}
                                    >
                                        View more
                                    </AnimatedWrapper>
                                </button>
                            </div>
                            <ul>
                                {topRatedArticles.map((article) => (
                                    <li key={article._id}>
                                        <Link
                                            href={`/blog/${article.category.toLowerCase()}/${
                                                article.slug
                                            }`}
                                        >
                                            <div className="__top">
                                                <span
                                                    lang={
                                                        containsArabic(article.title) ? 'ar' : 'en'
                                                    }
                                                    className={`__articleTitle ${
                                                        containsArabic(bestArticle.title) && '__ar'
                                                    }`}
                                                >
                                                    {_.upperFirst(article.title)}
                                                </span>
                                                <span className="__articleDate">
                                                    {formatDistanceToNow(
                                                        new Date(article.updatedAt!),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                            <p
                                                lang={containsArabic(article.body) ? 'ar' : 'en'}
                                                className="firstPhrase"
                                            >
                                                {extractFirstPhrase(article.body)}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AnimatedWrapper>

                    <AnimatedWrapper
                        as="div"
                        className="blog__section-1-right"
                        from={{ transform: 'translateX(100%)', opacity: 0 }}
                        to={isReady ? { transform: 'translateX(0)', opacity: 1 } : undefined}
                        config={{ mass: 1, tension: 170, friction: 26 }}
                        delay={1000}
                    >
                        <div className="__header">
                            <h1 className="__title">Most viewed</h1>
                            <button
                                className="__viewMore"
                                onClick={() =>
                                    openModal({ sortOption: 'mostViewed', timeFrameOption: 'all' })
                                }
                            >
                                <AnimatedWrapper
                                    as="span" // Use a span to wrap the text and arrow
                                    hover={{
                                        from: { transform: 'translateX(0px)' },
                                        to: { transform: 'translateX(-5px)' },
                                    }}
                                    config={config.wobbly}
                                >
                                    View more
                                </AnimatedWrapper>
                            </button>
                        </div>
                        <ul>
                            {mostViewedArticles.map((article, index) => (
                                <li key={article._id}>
                                    {index === 0 && (
                                        <div className="__background">
                                            {extractFirstImage(article.body)}
                                        </div>
                                    )}
                                    <Link
                                        href={`/blog/${article.category.toLowerCase()}/${
                                            article.slug
                                        }`}
                                    >
                                        <div className="__top">
                                            <span
                                                lang={containsArabic(article.title) ? 'ar' : 'en'}
                                                className={`__articleTitle ${
                                                    containsArabic(bestArticle.title) && '__ar'
                                                }`}
                                            >
                                                {_.upperFirst(article.title)}
                                            </span>
                                            <span className="__articleDate">
                                                {formatDistanceToNow(new Date(article.updatedAt!), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </div>
                                        <p
                                            lang={containsArabic(article.body) ? 'ar' : 'en'}
                                            className="firstPhrase"
                                        >
                                            {extractFirstPhrase(article.body)}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </AnimatedWrapper>
                </section>
            </SectionObserver>

            <SectionObserver theme="dark">
                <section className="blog__section-4"></section>
            </SectionObserver>
        </main>
    );
}
