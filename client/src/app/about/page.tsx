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
import $ from 'jquery';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import LongArrow from '@/components/ui/LongArrow';
import { AboutSection1 } from '@/components/ui/HeroImage';
import { useLoading } from '@/context/LoadingContext';
import { Comment } from '@/types/article';
import { config } from '@react-spring/web';

interface SliderSettings {
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
    draggable?: boolean;
    touchThreshold?: number;
    adaptiveHeight?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    centerMode?: boolean;
    centerPadding?: string;
    rtl?: boolean;
    onInit: () => void;
    beforeChange: (current: number, next: number) => void;
    onSwipe?: (direction: string) => void;
    afterChange?: (current: number) => void;
    onDrag?: () => void;
}

export default function AboutPage() {
    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const comments = useSelector(selectComments); // Select comments from the store
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    // Single ready state that combines all loading conditions
    const [isReady, setIsReady] = useState(false);

    // Fetch articles on mount
    useEffect(() => {
        dispatch(fetchArticles());
    }, [dispatch]);

    // Fetch comments on mount
    useEffect(() => {
        dispatch(fetchComments());
    }, [dispatch]);

    // Set ready state when articles are loaded and page is loaded
    useEffect(() => {
        if (isLoaded && !isLoading && articles.length > 0) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isLoading, articles]);

    // Set ready state when comments are loaded and page is loaded
    useEffect(() => {
        if (isLoaded && !isLoading && comments.length > 0) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isLoading, comments]);

    const _handleCommentJSONTOHTML = (__comments: Comment[], __index: number) => {
        const __comment = _.orderBy(
            _.filter(__comments, (_c) => _c._comment_isOK),
            ['createdAt'],
            ['desc']
        )[__index];

        if (__comment && __comment._comment_body) {
            const _i = __index + 1;
            $('._number p').html(_i < 10 ? '0' + _i : '' + _i);
            $('._number p').attr('data-text', _i < 10 ? '0' + _i : '' + _i);
        }
    };

    const filteredComments = comments.filter((comment) => comment._comment_isOK);
    const displayComments =
        filteredComments.length >= 3
            ? filteredComments
            : [...filteredComments, ...filteredComments, ...filteredComments].slice(0, 9);

    const _slider1CommentsSettings: SliderSettings = {
        dots: false,
        infinite: true,
        speed: 2000,

        className: "center",
        centerMode: true,
        centerPadding: "25%",
        slidesToShow: 4,

        vertical: true,
        verticalSwiping: true,
        autoplay: false,
        arrows: false,
        swipeToSlide: false,
        onInit: () => {
            _handleCommentJSONTOHTML(displayComments, 0);
        },
        beforeChange: (current: number, next: number) => {
            _handleCommentJSONTOHTML(displayComments, next);
        },
    };

    const _slider2CommentsSettings: SliderSettings = {
        dots: false,
        infinite: true,
        speed: 2000,

        className: "center",
        centerMode: true,
        centerPadding: "25%",
        slidesToShow: 4,

        vertical: true,
        verticalSwiping: true,
        autoplay: false,
        arrows: false,
        swipeToSlide: false,
        onInit: () => {
            _handleCommentJSONTOHTML(displayComments, 0);
        },
        beforeChange: (current: number, next: number) => {
            _handleCommentJSONTOHTML(displayComments, next);
        },
    };

    return (
        <main className="about">
            <section className="about__section-1">
                <AnimatedWrapper
                    as="div"
                    className="about__section-1-left"
                    from={{ transform: 'translateY(-10vh) translateX(-100%)', opacity: 0 }}
                    to={
                        isLoaded ? { transform: 'translateY(-10vh) translateX(0)', opacity: 1 } : {}
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
                            Born into a lineage of poets, I am deeply rooted in the rich tapestry of
                            Moroccan Amazigh traditions. My poetry is a harmonious blend of
                            influences from Moroccan dialects, French, and Spanish, reflecting the
                            diverse cultural heritage that has shaped my perspective. Drawing
                            inspiration from the evocative rhythms of Ahwach, the soulful
                            expressions of Tamawayt, and the poignant narratives of Aita, I endeavor
                            to weave verses that resonate with themes of tradition, longing, and the
                            enduring connection to one&apos;s homeland. Through my work, I aim to
                            celebrate the beauty of our shared histories and the timeless traditions
                            that bind us across generations.
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
                            as="span" // Use a span to wrap the text and arrow
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
                                {displayComments.map((comment, index) => (
                                    <div
                                        key={index}
                                        className={`_card _card-${index} ${
                                            index < 2 ? 'special-display' : ''
                                        }`}
                                    >
                                        <div className="_cardBody">
                                            <form className="_form">
                                                <h2 className="_comment_author">
                                                    by <span>{comment._comment_author}</span>
                                                </h2>

                                                <span className="_comment_body">
                                                    {comment._comment_body}
                                                </span>

                                                <h2 className={`_article__title ${/[\u0600-\u06FF]/.test(comment.article.title) ? '_article__title__arabic' : ''}`}>
                                                    <span>{comment.article?.title}</span>
                                                </h2>

                                                <div className="information">
                                                    <span>
                                                        <b>{comment._comment_upvotes.length}</b>{' '}
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
                                    </div>
                                ))}
                            </Slider>
                        )}

                        <div className="_shadowIndex _number" data-text="">
                            <p></p>
                            <b className="pink_dot">.</b>
                        </div>
                        <div className="_shadowIndex _number _outlined" data-text="">
                            <p></p>
                            <b className="pink_dot">.</b>
                        </div>
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

                        <Slider {..._slider2CommentsSettings}>
                            {displayComments.map((comment, index) => (
                                <div
                                    key={index}
                                    className={`_card _card-${index} ${
                                        index < 2 ? 'special-display' : ''
                                    }`}
                                >
                                    <div className="_cardBody">
                                        <form className="_form">
                                            <h2 className="_comment_author">
                                                by <span>{comment._comment_author}</span>
                                            </h2>

                                            <span className="_comment_body">
                                                {comment._comment_body}
                                            </span>

                                            <h2 className={`_article__title ${/[\u0600-\u06FF]/.test(comment.article.title) ? '_article__title__arabic' : ''}`}>
                                                <span>{comment.article.title}</span>
                                            </h2>

                                            <div className="information">
                                                <span>
                                                    <b>{comment._comment_upvotes.length}</b> Likes
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
                                </div>
                            ))}
                        </Slider>

                        <div className="_shadowIndex _number" data-text="">
                            <p></p>
                            <b className="pink_dot">.</b>
                        </div>
                        <div className="_shadowIndex _number _outlined" data-text="">
                            <p></p>
                            <b className="pink_dot">.</b>
                        </div>
                    </AnimatedWrapper>
                </div>
            </section>
            <section className="about__section-4"></section>
        </main>
    );
}
