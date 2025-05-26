/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://qasida.com',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    exclude: ['/admin/*', '/dashboard/*', '/login', '/secret-page'],
    robotsTxtOptions: {
        policies: [
            { userAgent: '*', allow: '/', disallow: ['/admin/', '/dashboard/', '/login', '/secret-page'] }
        ],
        additionalSitemaps: [
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://qasida.com'}/sitemap.xml`,
        ],
    },
    transform: async (config, path) => ({
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: new Date().toISOString(),
    }),
    additionalPaths: async () => {
        // Fetch dynamic articles with category, slug, and updatedAt
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/slugs`);
        const articles = await res.json();
        return articles.map(article => ({
            loc: `/blog/${article.category.toLowerCase()}/${article.slug}`,
            changefreq: 'weekly',
            priority: 0.6,
            lastmod: article.updatedAt || new Date().toISOString(),
        }));
    },
};