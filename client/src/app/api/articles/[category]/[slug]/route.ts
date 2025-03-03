import { NextResponse } from 'next/server';
import { dummyArticles } from '@/data/dummyArticles';

export async function GET(
    req: Request,
    context: {
        params: {
            category: string;
            slug: string;
        }
    }
) {
    const article = dummyArticles.find(
        (article) => article.category === context.params.category && article.slug === context.params.slug
    );

    if (!article) {
        return new NextResponse('Article not found', { status: 404 });
    }

    return NextResponse.json(article);
}
