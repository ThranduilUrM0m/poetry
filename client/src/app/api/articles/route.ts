import { NextResponse } from 'next/server';
import { dummyArticles } from '@/data/dummyArticles';

export async function GET() {
    return NextResponse.json(dummyArticles);
}

export async function POST(request: Request) {
    const article = await request.json();
    // Add validation and processing here
    return NextResponse.json(article);
}
