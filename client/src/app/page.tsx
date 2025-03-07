'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import { Squircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import $ from 'jquery';
import { HomeSection1, HomeSection2 } from '@/components/ui/HeroImage';
import LongArrow from '@/components/ui/LongArrow';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { dummyArticles } from '@/data/dummyArticles';
import { Article } from '@/types/article';
import { useLoading } from '@/context/LoadingContext';

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
    onInit: () => void;
    beforeChange: (current: number, next: number) => void;
}

const sliderVariants = {
    open: {
        translateY: 0, // Use translateY instead of y
        opacity: 1,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
    closed: {
        translateY: -100, // Use translateY instead of y
        opacity: 0,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
};

const homeSectionLeftVariants = {
    initial: {
        x: '-100%',
        opacity: 0,
    },
    animate: {
        x: '0%',
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 20,
            mass: 1,
        },
    },
};

const homeSectionRightVariants = {
    initial: {
        x: '100%',
        opacity: 0,
    },
    animate: {
        x: '0%',
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 20,
            mass: 1,
            delay: 0.2,
        },
    },
};

export default function HomePage() {
    const { isLoaded } = useLoading();
    const [_articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        const fetchArticles = () => {
            const sortedArticles = _.orderBy(
                _.filter(dummyArticles, (article) => !article.isPrivate),
                ['views'],
                ['desc']
            ).slice(0, 10);

            setArticles(sortedArticles);
        };

        fetchArticles();
    }, []);

    const _handleArticleJSONTOHTML = (__articles: Article[], __index: number) => {
        const __article = _.orderBy(
            _.filter(__articles, (_a) => !_a.isPrivate),
            ['views'],
            ['desc']
        )[__index];

        if (__article && __article.body) {
            const _i = __index + 1;
            const html = $.parseHTML(__article.body);
            const firstImage = $(html).find('img').first()[0]; // Get the first image element as a DOM element
            $('._home ._s2 ._figure').html(firstImage); // Pass the DOM element to .html()
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
        onInit: () => {
            _handleArticleJSONTOHTML(_articles, 0);
        },
        beforeChange: (current: number, next: number) => {
            _handleArticleJSONTOHTML(_articles, next);
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

    return (
        <main className="home">
            <section className="home__section-1">
                <AnimatedWrapper
                    as="div"
                    className="home__section-1-left"
                    variants={homeSectionLeftVariants}
                    initial="initial"
                    animate={isLoaded ? 'animate' : 'initial'}
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

                    <Link href="/__bio" className="home__section-1-left-read">
                        Read the full Bio.
                        <LongArrow />
                    </Link>
                </AnimatedWrapper>
                <AnimatedWrapper
                    as="div"
                    className="home__section-1-right"
                    variants={homeSectionRightVariants}
                    initial="initial"
                    animate={isLoaded ? 'animate' : 'initial'}
                >
                    <div className="home__section-1-right-image">
                        <HomeSection1 />
                    </div>
                    <div className="home__section-1-right-text">
                        <h1 className="home__section-1-right-text-hello">Hello.</h1>
                    </div>
                </AnimatedWrapper>
            </section>

            <section className="home__section-2">
                <div className="home__section-2-left"></div>
                <div className="home__section-2-right">
                    <AnimatedWrapper
                        as="div"
                        className="_sliderArticles"
                        variants={sliderVariants}
                        initial="closed"
                        animate={isLoaded ? 'open' : 'closed'}
                        transition={{ duration: 0.25, ease: 'easeInOut', delay: 1 }}
                    >
                        {!_.isEmpty(_articles) && (
                            <Slider {..._sliderArticlesSettings}>
                                {_.map(
                                    _.orderBy(
                                        _.filter(_articles, (_a) => !_a.isPrivate),
                                        ['views'],
                                        ['desc']
                                    ).slice(0, 10),
                                    (_article, index) => (
                                        <div key={index} className={`_card _card-${index}`}>
                                            <div className="_cardBody">
                                                <form className="_form">
                                                    <span className="category_author">
                                                        {_article.category}
                                                    </span>

                                                    <span className="firstPhrase">
                                                        {_article.body &&
                                                            extractFirstPhrase(_article.body)}
                                                    </span>

                                                    <h2>
                                                        {_article.title}
                                                        <br />
                                                        by{' '}
                                                        <span>
                                                            {_.isEmpty(_article.author.lastname) &&
                                                            _.isEmpty(_article.author.firstname)
                                                                ? _article.author.username
                                                                : !_.isEmpty(
                                                                      _article.author.lastname
                                                                  )
                                                                ? _article.author.lastname +
                                                                  ' ' +
                                                                  _article.author.firstname
                                                                : _article.author.firstname}
                                                        </span>
                                                    </h2>

                                                    <Link
                                                        href={`/blog/${_article._id}`}
                                                        className="_button"
                                                    >
                                                        <div className="buttonBorders">
                                                            <div className="borderTop"></div>
                                                            <div className="borderRight"></div>
                                                            <div className="borderBottom"></div>
                                                            <div className="borderLeft"></div>
                                                        </div>
                                                        <span>
                                                            Read More About it
                                                            <b className="pink_dot">.</b>
                                                        </span>
                                                    </Link>

                                                    <div className="information">
                                                        <span>
                                                            <b>{_.size(_article.views)}</b> Views
                                                        </span>
                                                        <Squircle />
                                                        <span>
                                                            {formatDistanceToNow(
                                                                new Date(_article.updatedAt),
                                                                { addSuffix: true }
                                                            )}
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
                                                            <b className="pink_dot">.</b>
                                                        </p>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )
                                )}
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
            </section>

            <section className="home__section-3">
                <AnimatedWrapper
                    as="div"
                    className="home__section-3-left"
                    variants={homeSectionLeftVariants}
                    initial="initial"
                    animate={isLoaded ? 'animate' : 'initial'}
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
                            With verses that stir the soul and imagery that lingers, [Poet&rsquo;s Name] crafts poetry that transcends time. Inspired by life&rsquo;s quiet moments and its grand emotions, each line is a journey through love, loss, hope, and wonder.
                        </p>

                        <Link href={`/__bio`} className="_button __dark">
                            <div className="buttonBorders">
                                <div className="borderTop"></div>
                                <div className="borderRight"></div>
                                <div className="borderBottom"></div>
                                <div className="borderLeft"></div>
                            </div>
                            <span>
                                Read More About it
                                <b className="pink_dot">.</b>
                            </span>
                        </Link>
                    </form>
                </AnimatedWrapper>
                <AnimatedWrapper
                    as="div"
                    className="home__section-3-right"
                    variants={homeSectionRightVariants}
                    initial="initial"
                    animate={isLoaded ? 'animate' : 'initial'}
                >
                    <div className="home__section-3-right-image">
                        <HomeSection2 />
                    </div>
                </AnimatedWrapper>
            </section>

            <section className="home__section-4">
            </section>
        </main>
    );
}
