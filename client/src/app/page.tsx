'use client';
import Head from 'next/head';
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
import { fr } from 'date-fns/locale';
import _ from 'lodash';
import $ from 'jquery';
import { HomeSection1, HomeSection2 } from '@/components/ui/HeroImage';
import LongArrow from '@/components/ui/LongArrow';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { useLoading } from '@/context/LoadingContext';
import SectionObserver from '@/components/SectionObserver';
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

export default function HomePage() {
    const isSm = useMedia('(min-width: 640px)');
    const { isLoaded } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const articles = useSelector(selectArticles);
    const bioArticle = articles.find((a) => a.isBio);
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
        touchThreshold: 1,
        adaptiveHeight: true,
        onInit: () => {
            _handleArticleJSONTOHTML(articles, 0);
        },
        beforeChange: (current: number, next: number) => {
            _handleArticleJSONTOHTML(articles, next);
        },
    };

    function sanitizeHtmlForPreview(html: string): string {
        if (!html) return '';
        let sanitized = html;

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

        return sanitized;
    }

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return (
        <>
            <Head>
                <title>Qasidaty | Blog de poésie</title>
                <meta
                    name="description"
                    content={`Qasidaty est un blog de poésie qui présente une collection de pensées et d'écrits.`}
                />
            </Head>
            <main className="home">
                <SectionObserver theme={isSm ? 'light' : 'dark'}>
                    <section className="home__section-1">
                        <AnimatedWrapper
                            as="div"
                            className="home__section-1-left"
                            from={{
                                transform: isSm
                                    ? 'translateY(-10vh) translateX(-100%)'
                                    : 'translateY(0) translateX(-100%)',
                                opacity: 0,
                            }}
                            to={
                                isReady
                                    ? {
                                          transform: isSm
                                              ? 'translateY(-10vh) translateX(0)'
                                              : 'translateY(0) translateX(0)',
                                          opacity: 1,
                                      }
                                    : {}
                            }
                            config={{ mass: 1, tension: 170, friction: 26 }}
                        >
                            <div className="home__section-1-left-fadedText">
                                <p>Je suis Elmkinsi!</p>
                            </div>

                            <div className="home__section-1-left-text">
                                <h2>
                                    Bienvenue dans ma
                                    <br />
                                    <span className="__lastWord">collection</span> en ligne
                                    <br />
                                    de pensées et d’écrits.
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
                                    Lire la biographie complète.
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
                            from={{
                                transform: isSm
                                    ? 'translateY(-10vh) translateX(100%)'
                                    : 'translateY(0) translateX(100%)',
                                opacity: 0,
                            }}
                            to={
                                isReady
                                    ? {
                                          transform: isSm
                                              ? 'translateY(-10vh) translateX(0)'
                                              : 'translateY(0) translateX(0)',
                                          opacity: 1,
                                      }
                                    : {}
                            }
                            config={{ mass: 1, tension: 170, friction: 26 }}
                        >
                            <div className="home__section-1-right-image">
                                <HomeSection1 />
                            </div>
                            <div className="home__section-1-right-text">
                                <h1 className="home__section-1-right-text-hello">Enchantée.</h1>
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
                                to={
                                    isReady ? { transform: 'translateY(0)', opacity: 1 } : undefined
                                }
                                config={{ mass: 1, tension: 170, friction: 26 }} // Smooth animation
                                delay={1000}
                            >
                                {isLoading && <p>Chargement des articles...</p>}
                                {error && <p className="text-red-500">Erreur : {error}</p>}

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
                                                                    containsArabic(
                                                                        _article.category
                                                                    )
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
                                                                                _article.author
                                                                                    .lastName
                                                                            ) &&
                                                                                _.isEmpty(
                                                                                    _article.author
                                                                                        .firstName
                                                                                )
                                                                                ? _article.author
                                                                                      .username
                                                                                : !_.isEmpty(
                                                                                      _article
                                                                                          .author
                                                                                          .lastName
                                                                                  )
                                                                                ? `${
                                                                                      _article
                                                                                          .author
                                                                                          .lastName
                                                                                  } ${
                                                                                      _article
                                                                                          .author
                                                                                          .firstName ??
                                                                                      ''
                                                                                  }`.trim()
                                                                                : _article.author
                                                                                      .firstName ??
                                                                                  ''
                                                                        )
                                                                            ? 'ar'
                                                                            : 'en'
                                                                    }
                                                                >
                                                                    {_.isEmpty(
                                                                        _article.author.lastName
                                                                    ) &&
                                                                    _.isEmpty(
                                                                        _article.author.firstName
                                                                    )
                                                                        ? _article.author.username
                                                                        : !_.isEmpty(
                                                                              _article.author
                                                                                  .lastName
                                                                          )
                                                                        ? `${
                                                                              _article.author
                                                                                  .lastName
                                                                          } ${
                                                                              _article.author
                                                                                  .firstName ?? ''
                                                                          }`.trim()
                                                                        : _article.author
                                                                              .firstName ?? ''}
                                                                </span>
                                                                <Squircle />
                                                                <span>
                                                                    {formatDistanceToNow(
                                                                        new Date(
                                                                            _article.updatedAt!
                                                                        ),
                                                                        { locale: fr, addSuffix: true }
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
                                                                dangerouslySetInnerHTML={{
                                                                    __html: sanitizeHtmlForPreview(
                                                                        _article.body
                                                                    ),
                                                                }}
                                                            />

                                                            <div className="_row">
                                                                <Link
                                                                    href={`/blog/${normalizeString(
                                                                        _article.category
                                                                    )}/${_article.slug}`}
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
                                                                                from: {
                                                                                    width: '0%',
                                                                                },
                                                                                to: {
                                                                                    width: '100%',
                                                                                },
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
                                                                                from: {
                                                                                    height: '0%',
                                                                                },
                                                                                to: {
                                                                                    height: '100%',
                                                                                },
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
                                                                                from: {
                                                                                    width: '0%',
                                                                                },
                                                                                to: {
                                                                                    width: '100%',
                                                                                },
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
                                                                                from: {
                                                                                    height: '0%',
                                                                                },
                                                                                to: {
                                                                                    height: '100%',
                                                                                },
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
                                                                        Lire la suite de l&apos;article
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
                                                                    <b>
                                                                        {_.size(_article.views)}
                                                                    </b>{' '}
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
                                <span className="aboutMe">A propos de moi</span>

                                <h2 className="fullName">
                                    Elmkinsi
                                    <br />
                                    Fatima
                                </h2>

                                <p className="text">
                                    Je m&apos;appelle Fatima El Mkinsi et je suis née à Salé en 1946.<br/>Au cours de mes quarante années de carrière, entre Salé et Rabat, j&apos;ai mis à profit ma maîtrise de l&apos;arabe et du français pour inspirer les élèves en tant que professeure d&apos;éducation physique.<br/>Après avoir pris ma retraite volontaire en 2005, je consacre désormais cette plateforme au partage de mes œuvres littéraires et invite chaque passionné de littérature à se lancer dans un voyage transculturel et transgénérationnel à travers les mots.
                                </p>

                                <div className="_row">
                                    <Link
                                        href={`/blog`}
                                        className="_button __dark"
                                        id="_buttonAboutMe"
                                    >
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
                                                parentHoverSelector="#_buttonAboutMe" // <-- Updated parent hover selector
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
                                                parentHoverSelector="#_buttonAboutMe" // <-- Updated parent hover selector
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
                                            En savoir plus<b className="__dot">.</b>
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
        </>
    );
}
