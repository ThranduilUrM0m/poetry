'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles, selectArticles, selectIsLoading, selectError } from '@/slices/articleSlice';
import { fetchComments, selectComments } from '@/slices/commentSlice';
import Link from 'next/link';
import Slider from 'react-slick';
import { formatDistanceToNow } from 'date-fns';
import { Squircle } from 'lucide-react';
import _ from 'lodash';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import LongArrow from '@/components/ui/LongArrow';
import { AboutSection1 } from '@/components/ui/HeroImage';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';
import { config } from '@react-spring/web';
import { BiSolidQuoteAltLeft } from 'react-icons/bi';

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

    const filteredComments = comments.filter((comment) => comment._comment_isOK);
    const displayComments =
        filteredComments.length >= 3
            ? filteredComments
            : [...filteredComments, ...filteredComments, ...filteredComments].slice(0, 9);

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

    return (
        <main className="about">
            <SectionObserver theme="dark">
                <section className="about__section-1">
                    <AnimatedWrapper
                        as="div"
                        className="about__section-1-left"
                        from={{ transform: 'translateY(-10vh) translateX(-100%)', opacity: 0 }}
                        to={
                            isLoaded
                                ? { transform: 'translateY(-10vh) translateX(0)', opacity: 1 }
                                : {}
                        }
                        config={{ mass: 1, tension: 170, friction: 26 }}
                    >
                        <div className="about__section-1-left-fadedText">
                            <p>
                                About me<b className="pink_dot">.</b>
                            </p>
                        </div>
                        <div className="about__section-1-left-text">
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
                    </AnimatedWrapper>
                    <AnimatedWrapper
                        as="div"
                        className="about__section-1-right"
                        from={{ transform: 'translateX(100%)', opacity: 0 }}
                        to={isLoaded ? { transform: 'translateX(0)', opacity: 1 } : {}}
                        config={{ mass: 1, tension: 170, friction: 26 }}
                    >
                        <div className="about__section-1-right-image">
                            <AboutSection1 />
                        </div>
                        <Link href="/__bio" className="about__section-1-right-read">
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
                            {!_.isEmpty(displayComments) && (
                                <Slider {..._slider1CommentsSettings}>
                                    {_.map(displayComments, (comment, index) => {
                                        const opacity = computeOpacity(
                                            index,
                                            currentSlide1,
                                            displayComments.length,
                                            _slider1CommentsSettings.rtl || false
                                        );
                                        const extraClass = index % 3 === 0 ? '__differentSlide' : '';
                                        return (
                                            <AnimatedWrapper
                                                key={index}
                                                animationStyle={{ opacity }}
                                                config={{
                                                    mass: 1,
                                                    tension: 120,
                                                    friction: 14, // Reduce friction for smoother transitions
                                                    precision: 0.01,
                                                    duration: 400, // Add a duration to ensure smooth transitions
                                                }}
                                            >
                                                <div
                                                    className={`_card _card-${index} ${
                                                        index < 2 ? 'special-display' : ''
                                                    } ${extraClass}`}
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
                                                                        {
                                                                            comment._comment_upvotes
                                                                                .length
                                                                        }
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
                            {!_.isEmpty(displayComments) && (
                                <Slider {..._slider2CommentsSettings}>
                                    {[...displayComments].reverse().map((comment, index) => {
                                        const opacity = computeOpacity(
                                            index,
                                            currentSlide2,
                                            displayComments.length,
                                            _slider2CommentsSettings.rtl || false
                                        );
                                        const extraClass = index % 3 === 0 ? '__differentSlide' : '';
                                        return (
                                            <AnimatedWrapper
                                                key={index}
                                                animationStyle={{ opacity }}
                                                config={{
                                                    mass: 1,
                                                    tension: 120,
                                                    friction: 14, // Reduce friction for smoother transitions
                                                    precision: 0.01,
                                                    duration: 400, // Add a duration to ensure smooth transitions
                                                }}
                                            >
                                                <div
                                                    className={`_card _card-${index} ${
                                                        index < 2 ? 'special-display' : ''
                                                    } ${extraClass}`}
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
                                                                        {
                                                                            comment._comment_upvotes
                                                                                .length
                                                                        }
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
            <SectionObserver theme="dark">
                <section className="about__section-4"></section>
            </SectionObserver>
        </main>
    );
}
