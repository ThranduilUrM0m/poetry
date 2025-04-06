// /client/src/app/blog/[category]/page.tsx
import { redirect, notFound } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/articles';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    // ⚠️ Await params before destructuring:
    const { category } = await params;

    try {
        // Reuse your existing endpoint to fetch all articles in this category
        const { data: articles } = await axios.get(`${API_BASE_URL}/${category}`);

        if (Array.isArray(articles) && articles.length > 0) {
            // Valid category → redirect to /blog?slug=
            redirect(`/blog?slug=${encodeURIComponent(category)}`);
        } else {
            // No articles → 404
            notFound();
        }
    } catch (err: unknown) {
        // Skip catching NEXT_REDIRECT errors
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
            throw err; // Re-throw the redirect
        }

        // Handle actual errors
        if (axios.isAxiosError(err) && err.response?.status === 404) {
            notFound();
        }
        console.error('Category lookup failed:', err);
        notFound();
    }

    // This line is unnecessary since redirect/notFound will handle the response
    // return null;
}
