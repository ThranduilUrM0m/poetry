'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles, selectArticles, selectIsLoading, selectError } from '@/slices/articleSlice';
import { fetchComments, selectComments } from '@/slices/commentSlice';
import Slider from 'react-slick';
import { formatDistanceToNow } from 'date-fns';
import { Squircle } from 'lucide-react';
import _ from 'lodash';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { AboutSection1 } from '@/components/ui/HeroImage';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';
import { BiSolidQuoteAltLeft } from 'react-icons/bi';
import Link from 'next/link';
import LongArrow from '@/components/ui/LongArrow';
import { config } from '@react-spring/web';
import { Comment } from '@/types/article';

interface SliderSettings {
    centerMode?: boolean;
    centerPadding?: string;
    className?: string;
    dots?: boolean;
    infinite?: boolean;
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
    const repeated: T[] = [];
    while (repeated.length < target) {
        repeated.push(...comments);
    }
    return repeated.slice(0, target);
}

export default function AboutPage() {
    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const comments = useSelector(selectComments);
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
        if (isLoaded && !isLoading && articles.length > 0) {
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isLoading, articles]);

    useEffect(() => {
        if (isLoaded && !isLoading && comments.length > 0) {
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isLoading, comments]);

    // STEP 1: Filter out only approved comments.
    const validComments = comments.filter((comment: Comment) => comment._comment_isOK);

    // STEP 2: Use a similar time range & scoring logic as the best-of-week article.
    const now: Date = new Date();
    const initialRangeDaysComments = 7; // Editable initial time range in days
    const timeRangesComments: number[] = [initialRangeDaysComments, 30, 60, 90, 120, 150, 180];

    const filteredCommentsByTime = _.chain(validComments)
        .thru((comms: Comment[]) => {
            for (const range of timeRangesComments) {
                const filtered = comms.filter((comment) => {
                    const createdAt = new Date(comment.createdAt);
                    const diffDays: number =
                        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
                    return diffDays <= range;
                });
                if (filtered.length > 0) return filtered;
            }
            return comms;
        })
        .map((comment: Comment) => ({
            ...comment,
            score:
                3 * _.get(comment, '_comment_upvotes.length', 0) -
                2 * _.get(comment, '_comment_downvotes.length', 0),
        }))
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

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return (
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
                            <h2>
                                Born into a lineage of poets, I am deeply rooted in the rich
                                tapestry of Moroccan Amazigh traditions. My poetry is a harmonious
                                blend of influences from Moroccan dialects, French, and Spanish,
                                reflecting the diverse cultural heritage that has shaped my
                                perspective. Drawing inspiration from the evocative rhythms of
                                Ahwach, the soulful expressions of Tamawayt, and the poignant
                                narratives of Aita, I endeavor to weave verses that resonate with
                                themes of tradition, longing, and the enduring connection to
                                one&apos;s homeland. Through my work, I aim to celebrate the beauty
                                of our shared histories and the timeless traditions that bind us
                                across generations.
                            </h2>
                        </div>
                        <Link
                            href={`/blog/biography/##slugToBio`}
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
                            to={isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined}
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
                                                                            comment.article?.title
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
                                                                            '_comment_upvotes.length',
                                                                            0
                                                                        )}
                                                                    </b>{' '}
                                                                    Likes
                                                                </span>
                                                                <Squircle />
                                                                <span>
                                                                    {formatDistanceToNow(
                                                                        new Date(comment.createdAt),
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
                    <div className="about__section-2-right">
                        <AnimatedWrapper
                            as="div"
                            className="_sliderComments"
                            from={{ transform: 'translateY(-100%)', opacity: 0 }}
                            to={isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined}
                            config={{ mass: 1, tension: 170, friction: 26 }}
                            delay={1000}
                        >
                            {isLoading && <p>Loading comments...</p>}
                            {error && <p className="text-red-500">Error: {error}</p>}
                            {!_.isEmpty(displayCommentsUpdated) && (
                                <Slider {..._slider2CommentsSettings}>
                                    {[...displayCommentsUpdated].reverse().map((comment, index) => {
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
                                                                    {comment._comment_author}
                                                                </span>
                                                            </h2>
                                                            <span className="_comment_body">
                                                                {comment._comment_body}
                                                            </span>
                                                            <h2
                                                                className={`_article__title ${
                                                                    /[\u0600-\u06FF]/.test(
                                                                        comment.article.title
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
                                                                        new Date(comment.createdAt),
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
    );
}
