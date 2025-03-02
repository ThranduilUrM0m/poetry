'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <main>
            <h1>Dashboard</h1>
            <p>This is the protected dashboard. Authentication is required to access this page.</p>
            {/* Implement your dashboard content and authentication checks here */}
        </main>
    );
}
