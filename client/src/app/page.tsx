'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchArticles, selectArticles, selectIsLoading, selectError } from '@/slices/articleSlice';
import { config } from '@react-spring/web';
import { Article } from '@/types/article';
import Link from 'next/link';
import Slider from 'react-slick';
import { Squircle, MessagesSquare, ThumbsUp, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import $ from 'jquery';
import { HomeSection1, HomeSection2 } from '@/components/ui/HeroImage';
import LongArrow from '@/components/ui/LongArrow';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';

interface SliderSettings {
    dots: boolean;
    infinite: boolean;
    speed: number;
    slidesToShow: number;
    slidesToScroll: number;
    vertical: boolean;
    verticalSwiping: boolean;
    swipeToSlide: boolean;
    arrows: boolean;
    draggable?: boolean;
    touchThreshold?: number;
    adaptiveHeight?: boolean;
    onInit?: () => void;
    beforeChange?: (current: number, next: number) => void;
    onSwipe?: (direction: string) => void;
    afterChange?: (current: number) => void;
    onDrag?: () => void;
}

export default function HomePage() {
    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    // Single ready state that combines all loading conditions
    const [isReady, setIsReady] = useState(false);

    // Fetch articles on mount
    useEffect(() => {
        dispatch(fetchArticles());
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

    const _handleArticleJSONTOHTML = (__articles: Article[], __index: number) => {
        const __article = _.orderBy(
            _.filter(__articles, (_a) => !_a.isPrivate),
            ['views'],
            ['desc']
        )[__index];

        if (__article && __article.body) {
            const _i = __index + 1;
            $('._number p').html(_i < 10 ? '0' + _i : '' + _i);
            $('._number p').attr('data-text', _i < 10 ? '0' + _i : '' + _i);
        }
    };

    const _sliderArticlesSettings: SliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,
        swipeToSlide: true,
        arrows: false,
        draggable: true,
        touchThreshold: 1, // Reduce this value to make vertical swiping more sensitive
        adaptiveHeight: true,
        onInit: () => {
            _handleArticleJSONTOHTML(articles, 0);
        },
        beforeChange: (current: number, next: number) => {
            _handleArticleJSONTOHTML(articles, next);
        },
    };

    const extractFirstPhrase = (htmlContent: string) => {
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Get all text content, removing HTML tags
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // Split by sentence endings and get first sentence
        const firstSentence = textContent.split(/[.!?]+/)[0];

        return firstSentence.trim();
    };

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return (
        <main className="home">
            <SectionObserver theme="light">
                <section className="home__section-1">
                    <AnimatedWrapper
                        as="div"
                        className="home__section-1-left"
                        from={{ transform: 'translateY(-10vh) translateX(-100%)', opacity: 0 }}
                        to={
                            isReady
                                ? { transform: 'translateY(-10vh) translateX(0)', opacity: 1 }
                                : {}
                        }
                        config={{ mass: 1, tension: 170, friction: 26 }}
                    >
                        <div className="home__section-1-left-fadedText">
                            <p>Hi. I&apos;m Boutaleb!</p>
                        </div>

                        <div className="home__section-1-left-text">
                            <h2>
                                Welcome to my online
                                <br />
                                <span className="__lastWord">collection</span> of thoughts
                                <br />
                                and writings.
                            </h2>
                        </div>

                        <Link
                            href={`/blog/biography/##slugToBio`}
                            className="home__section-1-left-read"
                        >
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
                    <AnimatedWrapper
                        as="div"
                        className="home__section-1-right"
                        from={{ transform: 'translateY(-10vh) translateX(100%)', opacity: 0 }}
                        to={
                            isReady
                                ? { transform: 'translateY(-10vh) translateX(0)', opacity: 1 }
                                : {}
                        }
                        config={{ mass: 1, tension: 170, friction: 26 }}
                    >
                        <div className="home__section-1-right-image">
                            <HomeSection1 />
                        </div>
                        <div className="home__section-1-right-text">
                            <h1 className="home__section-1-right-text-hello">Hello.</h1>
                        </div>
                    </AnimatedWrapper>
                </section>
            </SectionObserver>

            <SectionObserver theme="dark">
                <section className="home__section-2">
                    <div className="home__section-2-left"></div>
                    <div className="home__section-2-right">
                        <AnimatedWrapper
                            as="div"
                            className="_sliderArticles"
                            from={{ transform: 'translateY(-100%)', opacity: 0 }}
                            to={isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined}
                            config={{ mass: 1, tension: 170, friction: 26 }} // Smooth animation
                            delay={1000}
                        >
                            {isLoading && <p>Loading articles...</p>}
                            {error && <p className="text-red-500">Error: {error}</p>}

                            {/* Slider */}
                            {!_.isEmpty(articles) && (
                                <Slider {..._sliderArticlesSettings}>
                                    {_.map(
                                        _.orderBy(
                                            _.filter(articles, (_a) => !_a.isPrivate),
                                            ['views'],
                                            ['desc']
                                        ).slice(0, 10),
                                        (_article, index) => (
                                            <div key={index} className={`_card _card-${index}`}>
                                                <div className="_cardBody">
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

                                                        <h2 className="articleAuthorCreation">
                                                            <span
                                                                lang={
                                                                    containsArabic(
                                                                        _.isEmpty(
                                                                            _article.author.lastName
                                                                        ) &&
                                                                            _.isEmpty(
                                                                                _article.author
                                                                                    .firstName
                                                                            )
                                                                            ? _article.author
                                                                                  .username
                                                                            : !_.isEmpty(
                                                                                  _article.author
                                                                                      .lastName
                                                                              )
                                                                            ? `${
                                                                                  _article.author
                                                                                      .lastName
                                                                              } ${
                                                                                  _article.author
                                                                                      .firstName ??
                                                                                  ''
                                                                              }`.trim()
                                                                            : _article.author
                                                                                  .firstName ?? ''
                                                                    )
                                                                        ? 'ar'
                                                                        : 'en'
                                                                }
                                                            >
                                                                {_.isEmpty(
                                                                    _article.author.lastName
                                                                ) &&
                                                                _.isEmpty(_article.author.firstName)
                                                                    ? _article.author.username
                                                                    : !_.isEmpty(
                                                                          _article.author.lastName
                                                                      )
                                                                    ? `${
                                                                          _article.author.lastName
                                                                      } ${
                                                                          _article.author
                                                                              .firstName ?? ''
                                                                      }`.trim()
                                                                    : _article.author.firstName ??
                                                                      ''}
                                                            </span>
                                                            <Squircle />
                                                            <span>
                                                                {formatDistanceToNow(
                                                                    new Date(_article.updatedAt!),
                                                                    { addSuffix: true }
                                                                )}
                                                            </span>
                                                        </h2>

                                                        <span
                                                            lang={
                                                                containsArabic(_article.body)
                                                                    ? 'ar'
                                                                    : 'en'
                                                            }
                                                            className="firstPhrase"
                                                        >
                                                            {_article.body &&
                                                                extractFirstPhrase(_article.body)}
                                                        </span>

                                                        <div className="_row">
                                                            <Link
                                                                href={`/blog/${_article.category.toLowerCase()}/${
                                                                    _article.slug
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
                                                                            clipPath:
                                                                                'inset(0 100% 0 0)',
                                                                        },
                                                                        to: {
                                                                            clipPath:
                                                                                'inset(0 0 0 0)',
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
                                                                    Read More About it
                                                                    <b className="__dot">.</b>
                                                                </AnimatedWrapper>
                                                            </Link>
                                                        </div>

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
                                                        </div>

                                                        <div className="_shadowIndex _word">
                                                            <p>
                                                                {(() => {
                                                                    const words =
                                                                        _article.title?.split(
                                                                            /[\s.]+/
                                                                        ) || [];
                                                                    const firstWord =
                                                                        _.head(words) || '';
                                                                    const secondWord =
                                                                        _.nth(words, 1) || '';

                                                                    return firstWord.length <= 2
                                                                        ? `${firstWord} ${secondWord}`.trim()
                                                                        : firstWord;
                                                                })()}
                                                                <b className="__dot">.</b>
                                                            </p>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </Slider>
                            )}
                            {/* Slider */}

                            <div className="_shadowIndex _number" data-text="">
                                <p></p>
                                <b className="__dot">.</b>
                            </div>
                            <div className="_shadowIndex _number _outlined" data-text="">
                                <p></p>
                                <b className="__dot">.</b>
                            </div>
                        </AnimatedWrapper>
                    </div>
                </section>
            </SectionObserver>

            <SectionObserver theme="dark">
                <section className="home__section-3">
                    <AnimatedWrapper
                        as="div"
                        className="home__section-3-left"
                        from={{
                            transform: 'translateY(-10vh) translateX(-100%)',
                            opacity: 0,
                        }}
                        to={
                            isReady
                                ? { transform: 'translateY(-10vh) translateX(0)', opacity: 1 }
                                : undefined
                        }
                        config={{ mass: 1, tension: 170, friction: 26 }} // Smooth animation
                    >
                        <form className="_form">
                            <span className="aboutMe">About Me</span>

                            <h2 className="fullName">
                                Boutaleb
                                <br />
                                Zakariae
                            </h2>

                            <p className="text">
                                Weaving emotions into words, painting worlds with poetry.
                                <br />
                                With verses that stir the soul and imagery that lingers,
                                [Poet&rsquo;s Name] crafts poetry that transcends time. Inspired by
                                life&rsquo;s quiet moments and its grand emotions, each line is a
                                journey through love, loss, hope, and wonder.
                            </p>

                            <div className="_row">
                                <Link href={`/blog`} className="_button __dark" id="_buttonAboutMe">
                                    {/* The sequential effect is still a mystery and the background effect is not reversing with ease */}
                                    <AnimatedWrapper
                                        as="span"
                                        className="buttonBackground"
                                        hover={{
                                            from: { clipPath: 'inset(0 100% 0 0)' },
                                            to: { clipPath: 'inset(0 0 0 0)' },
                                        }}
                                        config={{ mass: 1, tension: 170, friction: 26 }}
                                        parentHoverSelector="#_buttonAboutMe"
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
                                            parentHoverSelector="#_buttonAboutMe" // <-- Updated parent hover selector
                                            onRest={() => {
                                                // Trigger the next animation after this one completes
                                                document
                                                    .querySelector('.borderRight')
                                                    ?.dispatchEvent(new Event('startAnimation'));
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
                                            parentHoverSelector="#_buttonAboutMe" // <-- Updated parent hover selector
                                            onRest={() => {
                                                // Trigger the next animation after this one completes
                                                document
                                                    .querySelector('.borderBottom')
                                                    ?.dispatchEvent(new Event('startAnimation'));
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
                                            parentHoverSelector="#_buttonAboutMe" // <-- Updated parent hover selector
                                            onRest={() => {
                                                // Trigger the next animation after this one completes
                                                document
                                                    .querySelector('.borderLeft')
                                                    ?.dispatchEvent(new Event('startAnimation'));
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
                                            parentHoverSelector="#_buttonAboutMe" // <-- Updated parent hover selector
                                        />
                                    </div>
                                    <AnimatedWrapper
                                        as="span"
                                        className="buttonContent"
                                        hover={{
                                            from: {
                                                color: 'rgb(var(--white)/1)',
                                            },
                                            to: {
                                                color: 'rgb(var(--text)/1)',
                                            },
                                        }}
                                        config={{ mass: 1, tension: 170, friction: 26 }}
                                        parentHoverSelector="#_buttonAboutMe"
                                    >
                                        Find out more<b className="__dot">.</b>
                                    </AnimatedWrapper>
                                </Link>
                            </div>
                        </form>
                    </AnimatedWrapper>
                    <AnimatedWrapper
                        as="div"
                        className="home__section-3-right"
                        from={{ transform: 'translateY(-10vh) translateX(100%)', opacity: 0 }}
                        to={
                            isReady
                                ? { transform: 'translateY(-10vh) translateX(0)', opacity: 1 }
                                : undefined
                        }
                        config={{ mass: 1, tension: 170, friction: 26 }} // Smooth animation
                    >
                        <div className="home__section-3-right-image">
                            <HomeSection2 />
                        </div>
                    </AnimatedWrapper>
                </section>
            </SectionObserver>

            <SectionObserver theme="light">
                <section className="home__section-4"></section>
            </SectionObserver>
        </main>
    );
}
