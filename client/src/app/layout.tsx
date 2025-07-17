// app/layout.tsx
import { Analytics } from '@vercel/analytics/next';
import Head from 'next/head';
import Script from 'next/script';
import LayoutWrapper from './LayoutWrapper';
import Providers from '@/components/providers';
import '@/assets/scss/globals.scss';
import 'simplebar/dist/simplebar.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <Head>
                    <meta property="og:title" content="Qasidaty | Blog de poetry" />
                    <meta
                        property="og:description"
                        content="En savoir plus sur Qasidaty et notre communauté poétique."
                    />
                    <meta property="og:image" content="/images/og-image.jpg" />
                    <meta property="og:type" content="website" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="Qasidaty | Blog de poetry" />
                    <meta
                        name="twitter:description"
                        content="En savoir plus sur Qasidaty et notre communauté poétique."
                    />
                    <meta name="twitter:image" content="/images/og-image.jpg" />
                </Head>

                {/* GA4 snippet */}
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="gtag-init" strategy="afterInteractive">
                    {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
                </Script>
            </head>
            <body>
                <Providers>
                    <LayoutWrapper>
                        {children}
                        <Analytics />
                    </LayoutWrapper>
                </Providers>
            </body>
        </html>
    );
}
