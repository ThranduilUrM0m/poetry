'use client';
import Head from 'next/head';
import { useEffect, useState, JSX } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles, selectArticles, selectIsLoading } from '@/slices/articleSlice';
import _ from 'lodash';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Hash, MessagesSquare, ThumbsUp, Clock9 } from 'lucide-react';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';
import { LuEye, LuThumbsUp, LuMessageSquareMore, LuSquircle } from 'react-icons/lu';
import { config } from '@react-spring/web';
import Link from 'next/link';
import { Article, Vote } from '@/types/article';
import { useSearchParams } from 'next/navigation';
import { useSearchModal } from '@/context/SearchModalContext';
import Image from 'next/image';
import Slider from 'react-slick';
import { useMedia } from 'react-use';
import { normalizeString } from '@/utils/stringUtils';

interface SliderSettings {
    centerMode?: boolean;
    centerPadding?: string;
    className?: string;
    dots?: boolean;
    infinite?: boolean;
    draggable?: boolean;
    touchThreshold?: number;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    vertical?: boolean;
    verticalSwiping?: boolean;
    swipeToSlide?: boolean;
    arrows?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    rtl?: boolean;
    adaptiveHeight?: boolean;
    cssEase?: string;
    pauseOnFocus?: boolean;
    pauseOnHover?: boolean;
    onInit?: () => void;
    beforeChange?: (current: number, next: number) => void;
    onSwipe?: (direction: string) => void;
    afterChange?: (current: number) => void;
    onDrag?: () => void;
}

/**
 * Extracts the first <img> element from the given HTML string
 * and returns a Next.js <Image> component.
 * If no image is found, returns null.
 */
function extractFirstImage(htmlContent: string): JSX.Element | null {
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
/* function extractFirstPhrase(htmlContent: string, maxLength?: number): string {
    if (!htmlContent) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    if (maxLength && textContent.length > maxLength) {
        return textContent.slice(0, maxLength).trim() + '...';
    }

    const firstSentence = textContent.split(/[.!?]+/)[0];
    return firstSentence.trim();
} */

function sanitizeHtmlForPreview(html: string, maxLength?: number): string {
    if (!html) return '';
    let sanitized = html;

    // Remove all style attributes (double or single quotes)
    sanitized = sanitized.replace(/\s*style\s*=\s*(['"])[\s\S]*?\1/gi, '');

    // 1. Remove <p> or <div> that only contain a media element (img, video, iframe, a)
    sanitized = sanitized.replace(
        /<(p|div)[^>]*>\s*(<img[^>]*>|<video[^>]*>.*?<\/video>|<iframe[^>]*>.*?<\/iframe>|<a[^>]*>.*?<\/a>)\s*<\/\1>/gi,
        ''
    );

    // 2. Remove standalone media elements (not wrapped)
    sanitized = sanitized
        .replace(/<img[^>]*>/gi, '')
        .replace(/<video[^>]*>.*?<\/video>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/<a[^>]*>.*?<\/a>/gi, '');

    // 3. Remove all tags except <br>, <p>, <b>, <i>, <strong>, <em>
    sanitized = sanitized.replace(/<(?!\/?(br|p|b|i|strong|em)\b)[^>]+>/gi, '');

    // 4. Remove empty paragraphs (including those with only whitespace or <br>)
    sanitized = sanitized.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

    // 5. Collapse multiple consecutive <br> into one
    sanitized = sanitized.replace(/(<br\s*\/?>\s*){2,}/gi, '<br>');

    // 6. Trim leading/trailing whitespace and <br>
    sanitized = sanitized.replace(/^(<br\s*\/?>)+/i, '').replace(/(<br\s*\/?>)+$/i, '');

    // 7. If maxLength is provided, truncate the text content (preserving HTML tags is non-trivial, so we strip tags for preview)
    if (maxLength) {
        // Remove all tags for plain text truncation
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitized;
        let textContent = tempDiv.textContent || tempDiv.innerText || '';
        if (textContent.length > maxLength) {
            textContent = textContent.slice(0, maxLength).trim() + '...';
        }
        return textContent;
    }

    return sanitized;
}

export default function BlogPage() {
    const isSm = useMedia('(min-width: 640px)');

    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles) || [];
    const isLoading = useSelector(selectIsLoading);
    const { openModal } = useSearchModal();

    // Combined ready state
    const [isReady, setIsReady] = useState(false);

    // Catgeory
    const params = useSearchParams();
    const category = params.get('slug');

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

    const sliderSettings__1: SliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        arrows: false,
        draggable: true,
        touchThreshold: 1,
        adaptiveHeight: false,
    };

    const sliderSettings__2: SliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 2,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        arrows: false,
        draggable: true,
        touchThreshold: 1,
        adaptiveHeight: false,
    };

    const latestArticles = _.orderBy(
        _.filter(articles, (_a) => !_a.isPrivate),
        [(article) => new Date(article.createdAt || 0)],
        ['desc']
    ).slice(0, 100);

    const commentedArticles = _.orderBy(
        _.filter(articles, (_a) => !_a.isPrivate),
        [(article) => _.size(article.comments)],
        ['desc']
    ).slice(0, 100);

    return (
        <>
            <Head>
                <title>Blog | Blog de poésie</title>
                <meta name="description" content="Lisez tous les poèmes de Qasidaty." />
            </Head>
            <main className="blog">
                <SectionObserver theme="dark">
                    <section className={`blog__section-1 !pb-0 ${!isSm && '!h-full'}`}>
                        <AnimatedWrapper
                            as="div"
                            className="blog__section-1-left"
                            from={{ transform: 'translateX(-100%)', opacity: 0 }}
                            to={isReady ? { transform: 'translateX(0)', opacity: 1 } : undefined}
                            config={{ mass: 1, tension: 170, friction: 26 }}
                            delay={1000}
                        >
                            <div className="__bestOfWeek">
                                <h1 className="__title">Meilleure de la semaine</h1>
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
                                                                    locale: fr,
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
                                                        dangerouslySetInnerHTML={{
                                                            __html: sanitizeHtmlForPreview(
                                                                bestArticle?.body
                                                            ),
                                                        }}
                                                    />

                                                    <h2
                                                        className={`${
                                                            containsArabic(bestArticle.title) &&
                                                            '__ar'
                                                        }`}
                                                        lang={
                                                            containsArabic(bestArticle.title)
                                                                ? 'ar'
                                                                : 'en'
                                                        }
                                                    >
                                                        {bestArticle.title}
                                                    </h2>

                                                    <div className="tags">
                                                        {_.map(bestArticle.tags, (tag, index) => (
                                                            <span
                                                                lang={
                                                                    containsArabic(tag)
                                                                        ? 'ar'
                                                                        : 'en'
                                                                }
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
                                                            href={`/blog/${normalizeString(
                                                                bestArticle.category
                                                            )}/${bestArticle.slug}`}
                                                            className="_button"
                                                            id="_buttonArticle"
                                                        >
                                                            {/* The sequential effect is still a mystery and the background effect is not reversing with ease */}
                                                            <AnimatedWrapper
                                                                as="span"
                                                                className="buttonBackground"
                                                                hover={{
                                                                    from: {
                                                                        clipPath:
                                                                            'inset(0 100% 0 0)',
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
                                                                            .querySelector(
                                                                                '.borderRight'
                                                                            )
                                                                            ?.dispatchEvent(
                                                                                new Event(
                                                                                    'startAnimation'
                                                                                )
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
                                                                            .querySelector(
                                                                                '.borderBottom'
                                                                            )
                                                                            ?.dispatchEvent(
                                                                                new Event(
                                                                                    'startAnimation'
                                                                                )
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
                                                                            .querySelector(
                                                                                '.borderLeft'
                                                                            )
                                                                            ?.dispatchEvent(
                                                                                new Event(
                                                                                    'startAnimation'
                                                                                )
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
                                                                En savoir plus
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
                                                            par{' '}
                                                            {_.isEmpty(
                                                                bestArticle.author.lastName
                                                            ) &&
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
                                            <p>Chargement des articles...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="__topRated">
                                <div className="__header">
                                    <h2 className="__title">Les mieux notés</h2>
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
                                            Voir plus
                                            <b className="__dot">.</b>
                                        </AnimatedWrapper>
                                    </button>
                                </div>
                                <ul>
                                    {topRatedArticles.map((article) => (
                                        <li key={article._id}>
                                            <Link
                                                href={`/blog/${normalizeString(article.category)}/${
                                                    article.slug
                                                }`}
                                            >
                                                <div className="__top">
                                                    <span
                                                        lang={
                                                            containsArabic(article.title)
                                                                ? 'ar'
                                                                : 'en'
                                                        }
                                                        className={`__articleTitle ${
                                                            containsArabic(bestArticle.title) &&
                                                            '__ar'
                                                        }`}
                                                    >
                                                        {_.upperFirst(article.title)}
                                                    </span>
                                                    <span className="__articleDate">
                                                        {formatDistanceToNow(
                                                            new Date(article.updatedAt!),
                                                            { locale: fr, addSuffix: true }
                                                        )}
                                                    </span>
                                                </div>
                                                <p
                                                    lang={
                                                        containsArabic(article.body) ? 'ar' : 'en'
                                                    }
                                                    className="firstPhrase"
                                                    dangerouslySetInnerHTML={{
                                                        __html: sanitizeHtmlForPreview(
                                                            article?.body
                                                        ),
                                                    }}
                                                />
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
                                <h1 className="__title">Les plus vues</h1>
                                <button
                                    className="__viewMore"
                                    onClick={() =>
                                        openModal({
                                            sortOption: 'mostViewed',
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
                                        Voir plus
                                        <b className="__dot">.</b>
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
                                            href={`/blog/${normalizeString(article.category)}/${
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
                                                        { locale: fr, addSuffix: true }
                                                    )}
                                                </span>
                                            </div>
                                            <p
                                                lang={containsArabic(article.body) ? 'ar' : 'en'}
                                                className="firstPhrase"
                                                dangerouslySetInnerHTML={{
                                                    __html: sanitizeHtmlForPreview(article?.body),
                                                }}
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </AnimatedWrapper>
                    </section>
                </SectionObserver>

                <SectionObserver theme="dark">
                    <section className={`blog__section-2 !h-full ${!isSm && '!py-0'}`}>
                        <div className="blog__section-2-left">
                            <AnimatedWrapper
                                as="div"
                                className="_sliderArticles"
                                from={{ transform: 'translateY(-100%)', opacity: 0 }}
                                to={
                                    isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined
                                }
                                config={{ mass: 1, tension: 170, friction: 26 }}
                                delay={1000}
                            >
                                {!_.isEmpty(articles) && (
                                    <Slider {...sliderSettings__1}>
                                        {_.map(latestArticles, (_article, index) => (
                                            <div
                                                key={_article._id}
                                                className={`_card _card-${index}`}
                                            >
                                                <Link
                                                    className="_cardBody"
                                                    href={`/blog/${normalizeString(
                                                        _article.category
                                                    )}/${_article.slug}`}
                                                >
                                                    <div className="__background">
                                                        {extractFirstImage(_article.body)}
                                                    </div>

                                                    <form className="_form">
                                                        <span
                                                            lang={
                                                                containsArabic(_article.category)
                                                                    ? 'ar'
                                                                    : 'en'
                                                            }
                                                            className="articleCategory"
                                                        >
                                                            {_article.category}
                                                        </span>

                                                        <h2
                                                            lang={
                                                                containsArabic(_article.title)
                                                                    ? 'ar'
                                                                    : 'en'
                                                            }
                                                            className="articleTitle"
                                                        >
                                                            {_article.title}
                                                        </h2>

                                                        <span
                                                            lang={
                                                                containsArabic(_article.body)
                                                                    ? 'ar'
                                                                    : 'en'
                                                            }
                                                            className="firstPhrase"
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeHtmlForPreview(
                                                                    _article?.body
                                                                ),
                                                            }}
                                                        />

                                                        <div className="information">
                                                            <span>
                                                                <MessagesSquare />
                                                                <b>
                                                                    {_.size(_article.comments)}
                                                                </b>{' '}
                                                            </span>
                                                            <span>
                                                                <ThumbsUp />
                                                                <b>
                                                                    {_.size(
                                                                        _article.votes?.filter(
                                                                            (vote) =>
                                                                                vote.direction ===
                                                                                'up'
                                                                        )
                                                                    )}
                                                                </b>{' '}
                                                            </span>
                                                            <span>
                                                                <Eye />
                                                                <b>{_.size(_article.views)}</b>{' '}
                                                            </span>

                                                            <span>
                                                                <b>
                                                                    {format(
                                                                        new Date(
                                                                            _article.updatedAt!
                                                                        ),
                                                                        'dd MMMM yyyy',
                                                                        {
                                                                            locale: fr,
                                                                        }
                                                                    )}
                                                                </b>
                                                                <Clock9 />
                                                                {isSm && (
                                                                    <b>
                                                                        {format(
                                                                            new Date(
                                                                                _article.updatedAt!
                                                                            ),
                                                                            'HH:mm',
                                                                            {
                                                                                locale: fr,
                                                                            }
                                                                        )}
                                                                    </b>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </form>
                                                </Link>
                                            </div>
                                        ))}
                                    </Slider>
                                )}
                            </AnimatedWrapper>
                        </div>

                        <div className="blog__section-2-right">
                            <AnimatedWrapper
                                as="div"
                                className="_sliderArticles"
                                from={{ transform: 'translateY(-100%)', opacity: 0 }}
                                to={
                                    isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined
                                }
                                config={{ mass: 1, tension: 170, friction: 26 }}
                                delay={1000}
                            >
                                {!_.isEmpty(articles) && (
                                    <Slider {...sliderSettings__2}>
                                        {_.map(commentedArticles, (_article, index) => (
                                            <div
                                                key={_article._id}
                                                className={`_card _card-${index}`}
                                            >
                                                <Link
                                                    className="_cardBody"
                                                    href={`/blog/${normalizeString(
                                                        _article.category
                                                    )}/${_article.slug}`}
                                                >
                                                    <div className="__background">
                                                        {extractFirstImage(_article.body)}
                                                    </div>

                                                    <form className="_form">
                                                        <span
                                                            lang={
                                                                containsArabic(_article.category)
                                                                    ? 'ar'
                                                                    : 'en'
                                                            }
                                                            className="articleCategory"
                                                        >
                                                            {_article.category}
                                                        </span>

                                                        <h2
                                                            lang={
                                                                containsArabic(_article.title)
                                                                    ? 'ar'
                                                                    : 'en'
                                                            }
                                                            className="articleTitle"
                                                        >
                                                            {_article.title}
                                                        </h2>

                                                        <span
                                                            lang={
                                                                containsArabic(_article.body)
                                                                    ? 'ar'
                                                                    : 'en'
                                                            }
                                                            className="firstPhrase"
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeHtmlForPreview(
                                                                    _article?.body
                                                                ),
                                                            }}
                                                        />

                                                        <div className="information">
                                                            <span>
                                                                <MessagesSquare />
                                                                <b>
                                                                    {_.size(_article.comments)}
                                                                </b>{' '}
                                                            </span>
                                                            <span>
                                                                <ThumbsUp />
                                                                <b>
                                                                    {_.size(
                                                                        _article.votes?.filter(
                                                                            (vote) =>
                                                                                vote.direction ===
                                                                                'up'
                                                                        )
                                                                    )}
                                                                </b>{' '}
                                                            </span>
                                                            <span>
                                                                <Eye />
                                                                <b>{_.size(_article.views)}</b>{' '}
                                                            </span>

                                                            <span>
                                                                <b>
                                                                    {format(
                                                                        new Date(
                                                                            _article.updatedAt!
                                                                        ),
                                                                        'dd MMMM yyyy',
                                                                        {
                                                                            locale: fr,
                                                                        }
                                                                    )}
                                                                </b>
                                                                <Clock9 />
                                                                <b>
                                                                    {format(
                                                                        new Date(
                                                                            _article.updatedAt!
                                                                        ),
                                                                        'HH:mm',
                                                                        {
                                                                            locale: fr,
                                                                        }
                                                                    )}
                                                                </b>
                                                            </span>
                                                        </div>
                                                    </form>
                                                </Link>
                                            </div>
                                        ))}
                                    </Slider>
                                )}
                            </AnimatedWrapper>
                        </div>
                    </section>
                </SectionObserver>

                <SectionObserver theme="dark">
                    <section className="blog__section-4"></section>
                </SectionObserver>
            </main>
        </>
    );
}
