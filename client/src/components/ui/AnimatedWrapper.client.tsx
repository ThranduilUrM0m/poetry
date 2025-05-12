import dynamic from 'next/dynamic';

// Dynamically load the real AnimatedWrapper with SSR disabled
const AnimatedWrapper = dynamic(() => import('./AnimatedWrapper'), { ssr: false });

export default AnimatedWrapper;
