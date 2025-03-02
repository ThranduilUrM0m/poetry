import { Metadata } from 'next';

interface Props {
    params: {
        category: string;
        slug: string;
    };
}

async function getArticle(category: string, slug: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${category}/${slug}`);
    if (!res.ok) return null;
    return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const article = await getArticle(params.category, params.slug);
    if (!article) return { title: 'Article Not Found' };

    return {
        title: article.title,
        description: article.description,
    };
}
