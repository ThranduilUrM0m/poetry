/* import HeroImage from './components/home/HeroImage'; */
import LongArrow from './components/ui/LongArrow';

export default function HomePage() {
  return (
    <main className='home'>
      <section className='home__section-1'>
        <div className='home__section-1-left'>
          <div className='home__section-1-left-quote-container'>
            <div className='home__section-1-left-quote home__section-1-left-quote--image'>
              {/* <HeroImage /> */}
            </div>
            <div className='home__section-1-left-quote home__section-1-left-quote--solid' />
          </div>
        </div>

        <div className='home__section-1-right'>
          <h1 className='home__section-1-right-name'>
            Ahmed<br />El-Sayed
          </h1>
          
          <p className='home__section-1-right-bio'>
            A contemporary poet crafting verses that echo the depths of human experience,
            bringing forth poetry that resonates with both heart and mind.
          </p>
          
          <a href="#" className="home__section-1-right-read">
            Read
            <LongArrow />
          </a>
          
          <div className='home__section-1-right-cta'>
            <button className='home__section-1-right-cta-btn home__section-1-right-cta-btn--primary'>
              <span className="home__section-1-right-cta-btn-text">Blog</span>
            </button>
            <button className='home__section-1-right-cta-btn home__section-1-right-cta-btn--outline'>
              <span className="home__section-1-right-cta-btn-text">Biography</span>
            </button>
          </div>
        </div>
      </section>

      <section className='home__section-2'></section>
      <section className='home__section-3'></section>
      <section className='home__section-4'></section>
    </main>
  );
}