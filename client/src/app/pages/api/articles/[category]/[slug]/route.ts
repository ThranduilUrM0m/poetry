import { NextResponse } from 'next/server';
import { dummyArticles } from '@/app/data/dummyArticles';

export async function GET(
    request: Request,
    { params }: { params: { category: string; slug: string } }
) {
    const article = dummyArticles.find(
        (article) => article.category === params.category && article.slug === params.slug
    );

    if (!article) {
        return new NextResponse('Article not found', { status: 404 });
    }

    return NextResponse.json(article);
}
