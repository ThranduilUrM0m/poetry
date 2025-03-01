import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

async function getArticle(category: string, slug: string) {
    // Replace with your actual API call
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${category}/${slug}`);
    if (!res.ok) return null;
    return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const article = await getArticle(resolvedParams.category, resolvedParams.slug);
    if (!article) return { title: 'Article Not Found' };

    return {
        title: article.title,
        description: article.description,
    };
}

export default async function ArticlePage({ params }: Props) {
    const resolvedParams = await params;
    const article = await getArticle(resolvedParams.category, resolvedParams.slug);
    if (!article) notFound();

    return (
        <main className="article-page">
            <h1>{article.title}</h1>
            <div className="meta">
                <p>Category: {resolvedParams.category}</p>
                {/* Add other article metadata */}
            </div>
            <div className="content">{article.content}</div>
        </main>
    );
}
