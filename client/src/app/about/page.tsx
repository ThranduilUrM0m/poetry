'use client';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles, selectArticles, selectIsLoading, selectError } from '@/slices/articleSlice';
import { fetchComments, selectComments, selectFeaturedComments } from '@/slices/commentSlice';
import Slider from 'react-slick';
import { formatDistanceToNow } from 'date-fns';
import { Squircle } from 'lucide-react';
import _ from 'lodash';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { AboutSection1 } from '@/components/ui/HeroImage';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';
import { BiSolidQuoteAltLeft } from 'react-icons/bi';
import Link from 'next/link';
import LongArrow from '@/components/ui/LongArrow';
import { config } from '@react-spring/web';
import { Comment } from '@/types/article';
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

// Helper function: duplicate an array until target length is reached.
function repeatComments<T>(comments: T[], target: number): T[] {
    if (comments.length === 0) return [];
    return Array.from({ length: target }, (_, i) => comments[i % comments.length]);
}

export default function AboutPage() {
    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const bioArticle = articles.find((a) => a.isBio);
    const comments = useSelector(selectComments);
    const featuredComments = useSelector(selectFeaturedComments);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    // Combined ready state
    const [isReady, setIsReady] = useState(false);
    // Track current slide indices for each slider
    const [currentSlide1, setCurrentSlide1] = useState(0);
    const [currentSlide2, setCurrentSlide2] = useState(0);

    // Fetch articles and comments on mount
    useEffect(() => {
        dispatch(fetchArticles());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchComments());
    }, [dispatch]);

    useEffect(() => {
        if (isLoaded && !isLoading && (articles.length > 0 || comments.length > 0)) {
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isLoading, articles, comments]);

    // STEP 1: Filter out only approved comments with detailed logging
    const validComments = featuredComments.filter((comment: Comment) => {
        // Accept comments that are either explicitly approved or don't have the field
        return comment._comment_isOK;
    });

    // STEP 2: Time range filtering with detailed logging
    const now: Date = new Date();
    const initialRangeDaysComments = 7;
    const timeRangesComments: number[] = [initialRangeDaysComments, 30, 60, 90, 120, 150, 180];

    const filteredCommentsByTime = _.chain(validComments)
        .thru((comms: Comment[]) => {
            for (const range of timeRangesComments) {
                const filtered = comms.filter((comment) => {
                    if (!comment.createdAt) {
                        return true; // Include comments without dates
                    }

                    const createdAt = new Date(comment.createdAt);
                    if (isNaN(createdAt.getTime())) {
                        return true; // Include comments with invalid dates
                    }

                    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
                    return diffDays <= range;
                });

                if (filtered.length > 0) {
                    return filtered;
                }
            }
            return comms;
        })
        .map((comment: Comment) => {
            const votes = comment._comment_votes || [];

            const upvotes = votes.filter((vote) => vote.direction === 'up').length;
            const downvotes = votes.filter((vote) => vote.direction === 'down').length;

            return { ...comment, score: 3 * upvotes - 2 * downvotes };
        })
        .orderBy(['score'], ['desc'])
        .value();

    // STEP 3: Limit the number of comments to 9 for each slider.
    // If fewer than 9 unique comments, duplicate until you have exactly 9.
    const maxDisplayComments = 9;
    const displayCommentsUpdated = repeatComments(filteredCommentsByTime, maxDisplayComments);

    // Slider configuration for a smooth, continuous slide.
    const _slider1CommentsSettings: SliderSettings = {
        dots: false,
        infinite: true,
        speed: 5000,
        cssEase: 'linear',
        className: 'center',
        centerMode: true,
        slidesToShow: 3,
        vertical: true,
        verticalSwiping: true,
        autoplay: true,
        autoplaySpeed: 0,
        arrows: false,
        swipeToSlide: false,
        pauseOnHover: false,
        pauseOnFocus: false,
        adaptiveHeight: true,
        beforeChange: (current, next) => {
            setCurrentSlide1(next);
        },
    };

    const _slider2CommentsSettings: SliderSettings = {
        dots: false,
        infinite: true,
        speed: 10000,
        cssEase: 'linear',
        className: 'center',
        centerMode: true,
        slidesToShow: 3,
        vertical: true,
        verticalSwiping: true,
        autoplay: true,
        autoplaySpeed: 0,
        arrows: false,
        swipeToSlide: false,
        pauseOnHover: false,
        pauseOnFocus: false,
        adaptiveHeight: true,
        beforeChange: (current, next) => {
            setCurrentSlide2(next);
        },
    };

    const computeOpacity = (index: number, current: number, total: number, rtl: boolean) => {
        if (!rtl) {
            const activeLeft = current;
            const activeRight = (current + 1) % total;
            const leftPartial = (current - 1 + total) % total;
            const rightPartial = (current + 2) % total;
            if (index === activeLeft || index === activeRight) return 1;
            if (index === leftPartial || index === rightPartial) return 0.75;
            return 0.25;
        } else {
            const activeRight = current;
            const activeLeft = (current + 1) % total;
            const rightPartial = (current - 1 + total) % total;
            const leftPartial = (current + 2) % total;
            if (index === activeRight || index === activeLeft) return 1;
            if (index === rightPartial || index === leftPartial) return 0.75;
            return 0.25;
        }
    };

    const extractFirstPhrases = (htmlContent: string) => {
        if (!htmlContent) return '';
        // Replace <br> and <br/> with \n
        let text = htmlContent.replace(/<br\s*\/?>/gi, '\n');
        // Replace </p> with \n (paragraphs)
        text = text.replace(/<\/p>/gi, '\n');
        // Remove all other tags
        text = text.replace(/<[^>]+>/g, '');
        // Collapse multiple newlines
        text = text.replace(/\n{2,}/g, '\n');
        // Split into lines
        const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);

        let preview = '';
        let charCount = 0;
        let lineCount = 0;

        for (const line of lines) {
            if (preview) preview += '\n';
            preview += line;
            charCount += line.length;
            lineCount++;
            if (charCount >= 500 || lineCount >= 1000) break;
        }
        return preview.trim();
    };

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => /[\u0600-\u06FF]+/.test(text);

    return (
        <>
            <Head>
                <title>About Qasida | Poetry Website</title>
                <meta
                    name="description"
                    content="Learn more about Qasida and our poetry community."
                />
            </Head>
            <main className="about">
                <SectionObserver theme="dark">
                    <section className="about__section-1">
                        <AnimatedWrapper
                            as={AboutSection1}
                            className="about__section-1-image"
                            from={{ transform: 'translateY(-10vh) translateX(-100%)', opacity: 0 }}
                            to={
                                isLoaded
                                    ? { transform: 'translateY(-10vh) translateX(0)', opacity: 1 }
                                    : {}
                            }
                            config={{ mass: 1, tension: 170, friction: 26 }}
                        ></AnimatedWrapper>
                        <AnimatedWrapper
                            as="div"
                            className="about__section-1-left"
                            from={{ transform: 'translateX(100%)', opacity: 0 }}
                            to={isLoaded ? { transform: 'translateX(0)', opacity: 1 } : {}}
                            config={{ mass: 1, tension: 170, friction: 26 }}
                        ></AnimatedWrapper>
                        <AnimatedWrapper
                            as="div"
                            className="about__section-1-right"
                            from={{ transform: 'translateX(-100%)', opacity: 0 }}
                            to={isLoaded ? { transform: 'translateX(0)', opacity: 1 } : {}}
                            config={{ mass: 1, tension: 170, friction: 26 }}
                        >
                            <div className="about__section-1-right-fadedText">
                                <p>
                                    About
                                    <br />
                                    <b className="__dot">me.</b>
                                </p>
                            </div>
                            <div className="about__section-1-right-text">
                                <h2
                                    lang={containsArabic(bioArticle?.body || '') ? 'ar' : 'en'}
                                    className="firstPhrase"
                                >
                                    {bioArticle?.body && extractFirstPhrases(bioArticle?.body)}
                                </h2>
                            </div>
                            <Link
                                href={
                                    bioArticle
                                        ? `/blog/${normalizeString(bioArticle.category)}/${
                                              bioArticle.slug
                                          }`
                                        : '#'
                                }
                                className="about__section-1-right-read"
                            >
                                <AnimatedWrapper
                                    as="span"
                                    hover={{
                                        from: { transform: 'translateX(0px)' },
                                        to: { transform: 'translateX(10px)' },
                                    }}
                                    config={config.wobbly}
                                >
                                    Read the full Bio.
                                    <AnimatedWrapper
                                        as={LongArrow}
                                        hover={{
                                            from: { transform: 'translateX(0px)' },
                                            to: { transform: 'translateX(20px)' },
                                        }}
                                        config={config.wobbly}
                                    />
                                </AnimatedWrapper>
                            </Link>
                        </AnimatedWrapper>
                    </section>
                </SectionObserver>
                <SectionObserver theme="dark">
                    <section className="about__section-2">
                        <div className="about__section-2-left">
                            <AnimatedWrapper
                                as="div"
                                className="_sliderComments"
                                from={{ transform: 'translateY(-100%)', opacity: 0 }}
                                to={
                                    isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined
                                }
                                config={{ mass: 1, tension: 170, friction: 26 }}
                                delay={1000}
                            >
                                {isLoading && <p>Loading comments...</p>}
                                {error && <p className="text-red-500">Error: {error}</p>}
                                {!_.isEmpty(displayCommentsUpdated) && (
                                    <Slider {..._slider1CommentsSettings}>
                                        {_.map(displayCommentsUpdated, (comment, index) => {
                                            const opacity = computeOpacity(
                                                index,
                                                currentSlide1,
                                                displayCommentsUpdated.length,
                                                _slider1CommentsSettings.rtl || false
                                            );
                                            // Apply the extra class only to every 3rd item
                                            const extraClass =
                                                index % 3 === 0 ? '__differentSlide' : '';
                                            return (
                                                <AnimatedWrapper
                                                    key={index}
                                                    animationStyle={{ opacity }}
                                                    config={{
                                                        mass: 1,
                                                        tension: 120,
                                                        friction: 14,
                                                        precision: 0.01,
                                                        duration: 400,
                                                    }}
                                                >
                                                    <div
                                                        className={`_card _card-${index} ${extraClass}`}
                                                    >
                                                        <div className="_cardBody">
                                                            <form className="_form">
                                                                <h2 className="_comment_author">
                                                                    by{' '}
                                                                    <span
                                                                        lang={
                                                                            containsArabic(
                                                                                comment._comment_author
                                                                            )
                                                                                ? 'ar'
                                                                                : 'en'
                                                                        }
                                                                    >
                                                                        {comment._comment_author}
                                                                    </span>
                                                                </h2>
                                                                <span
                                                                    lang={
                                                                        containsArabic(
                                                                            comment._comment_body
                                                                        )
                                                                            ? 'ar'
                                                                            : 'en'
                                                                    }
                                                                    className="_comment_body"
                                                                >
                                                                    {comment._comment_body}
                                                                </span>
                                                                <h2 className="_article__title">
                                                                    <span
                                                                        lang={
                                                                            containsArabic(
                                                                                comment.article
                                                                                    ?.title || ''
                                                                            )
                                                                                ? 'ar'
                                                                                : 'en'
                                                                        }
                                                                    >
                                                                        {comment.article?.title}
                                                                    </span>
                                                                </h2>
                                                                <div className="information">
                                                                    <span>
                                                                        <b>
                                                                            {_.get(
                                                                                comment,
                                                                                '_comment_votes.length',
                                                                                0
                                                                            )}{' '}
                                                                        </b>
                                                                        Votes
                                                                    </span>
                                                                    <Squircle />
                                                                    <span>
                                                                        {formatDistanceToNow(
                                                                            new Date(
                                                                                comment.createdAt!
                                                                            )
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </form>
                                                        </div>
                                                        {extraClass && <BiSolidQuoteAltLeft />}
                                                    </div>
                                                </AnimatedWrapper>
                                            );
                                        })}
                                    </Slider>
                                )}
                            </AnimatedWrapper>
                        </div>
                        <div className="about__section-2-right">
                            <AnimatedWrapper
                                as="div"
                                className="_sliderComments"
                                from={{ transform: 'translateY(-100%)', opacity: 0 }}
                                to={
                                    isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined
                                }
                                config={{ mass: 1, tension: 170, friction: 26 }}
                                delay={1000}
                            >
                                {isLoading && <p>Loading comments...</p>}
                                {error && <p className="text-red-500">Error: {error}</p>}
                                {!_.isEmpty(displayCommentsUpdated) && (
                                    <Slider {..._slider2CommentsSettings}>
                                        {[...displayCommentsUpdated]
                                            .reverse()
                                            .map((comment, index) => {
                                                const opacity = computeOpacity(
                                                    index,
                                                    currentSlide2,
                                                    displayCommentsUpdated.length,
                                                    _slider2CommentsSettings.rtl || false
                                                );
                                                const extraClass =
                                                    index % 3 === 0 ? '__differentSlide' : '';
                                                return (
                                                    <AnimatedWrapper
                                                        key={index}
                                                        animationStyle={{ opacity }}
                                                        config={{
                                                            mass: 1,
                                                            tension: 120,
                                                            friction: 14,
                                                            precision: 0.01,
                                                            duration: 400,
                                                        }}
                                                    >
                                                        <div
                                                            className={`_card _card-${index} ${extraClass}`}
                                                        >
                                                            <div className="_cardBody">
                                                                <form className="_form">
                                                                    <h2 className="_comment_author">
                                                                        by{' '}
                                                                        <span>
                                                                            {
                                                                                comment._comment_author
                                                                            }
                                                                        </span>
                                                                    </h2>
                                                                    <span className="_comment_body">
                                                                        {comment._comment_body}
                                                                    </span>
                                                                    <h2
                                                                        className={`_article__title ${
                                                                            /[\u0600-\u06FF]/.test(
                                                                                comment.article
                                                                                    ?.title || ''
                                                                            )
                                                                                ? '_article__title__arabic'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        <span>
                                                                            {comment.article?.title}
                                                                        </span>
                                                                    </h2>
                                                                    <div className="information">
                                                                        <span>
                                                                            <b>
                                                                                {_.get(
                                                                                    comment,
                                                                                    '_comment_upvotes.length',
                                                                                    0
                                                                                )}
                                                                            </b>{' '}
                                                                            Likes
                                                                        </span>
                                                                        <Squircle />
                                                                        <span>
                                                                            {formatDistanceToNow(
                                                                                new Date(
                                                                                    comment.createdAt!
                                                                                ),
                                                                                { addSuffix: true }
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                            {extraClass && <BiSolidQuoteAltLeft />}
                                                        </div>
                                                    </AnimatedWrapper>
                                                );
                                            })}
                                    </Slider>
                                )}
                            </AnimatedWrapper>
                        </div>
                    </section>
                </SectionObserver>
                <SectionObserver theme="light">
                    <section className="about__section-4"></section>
                </SectionObserver>
            </main>
        </>
    );
}
