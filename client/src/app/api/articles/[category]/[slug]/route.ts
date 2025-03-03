import { NextResponse } from 'next/server';
import { dummyArticles } from '@/data/dummyArticles';

// Define the type for the context parameter
interface Context {
    params: {
        category: string;
        slug: string;
    };
}

export async function GET(
    req: Request,
    context: Context // Use the correct type for the context parameter
) {
    const { category, slug } = context.params;

    // Find the article in the dummy data
    const article = dummyArticles.find(
        (article) => article.category === category && article.slug === slug
    );

    // If the article is not found, return a 404 response
    if (!article) {
        return new NextResponse('Article not found', { status: 404 });
    }

    // Return the article as a JSON response
    return NextResponse.json(article);
}