import { NextResponse } from 'next/server';
import { dummyArticles } from '@/data/dummyArticles';

interface Context {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

export async function GET(
    req: Request,
    context: Context
) {
    // Await the params
    const params = await context.params;
    const { category, slug } = params;

    const article = dummyArticles.find(
        (article) => article.category === category && article.slug === slug
    );

    if (!article) {
        return new NextResponse('Article not found', { status: 404 });
    }

    return NextResponse.json(article);
}