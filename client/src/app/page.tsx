import Link from 'next/link';
import HeroImage from '@/components/ui/HeroImage';
import LongArrow from '@/components/ui/LongArrow';

export default function HomePage() {
    return (
        <main className="home">
            <section className="home__section-1">
                <div className="home__section-1-left">
                    <div className="home__section-1-left-fadedText">
                        <p>Whispers of art, echoes of Morocco.</p>
                    </div>

                    <div className="home__section-1-left-text">
                        <h2>
                            Speaking My Journey in
                            <br />
                            <span className="__lastWord">Words.</span>
                        </h2>
                    </div>

                    {/* Href needs to point at the bio article. */}
                    <Link href="/desired-path" className="home__section-1-left-read">
                        Read the full Bio.
                        <LongArrow />
                    </Link>
                </div>
                <div className="home__section-1-right">
                    <div className="home__section-1-right-image">
                        <HeroImage />
                    </div>
                    <div className="home__section-1-right-text">
                        <h1 className="home__section-1-right-text-hello">Hello.</h1>
                    </div>
                </div>
            </section>

            <section className="home__section-2">
                <div className="home__section-2-left"></div>
                <div className="home__section-2-right"></div>
            </section>
            <section className="home__section-3"></section>
            <section className="home__section-4"></section>
        </main>
    );
}
