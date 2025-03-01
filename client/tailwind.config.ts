import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animated';

export default {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                d: 'rgb(var(--d) / <alpha-value>)',
                redNo: 'rgb(var(--redNo) / <alpha-value>)',
                greenYes: 'rgb(var(--greenYes) / <alpha-value>)',
                hoverGray: 'rgb(var(--hoverGray) / <alpha-value>)',
                whitePlusOne: 'rgb(var(--whitePlusOne) / <alpha-value>)',
                white: 'rgb(var(--white) / <alpha-value>)',
                background: 'rgb(var(--background) / <alpha-value>)',
                text: 'rgb(var(--text) / <alpha-value>)',
                primary: {
                    DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
                    light: 'rgb(var(--primary-light) / <alpha-value>)',
                    dark: 'rgb(var(--primary-dark) / <alpha-value>)',
                },
            },
            // If you want to keep some fallback transition settings (optional, since the plugin handles most animations)
            transitionTimingFunction: {
                DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            transitionDuration: {
                DEFAULT: '300ms',
            },
        },
    },
    plugins: [animate],
} satisfies Config;
