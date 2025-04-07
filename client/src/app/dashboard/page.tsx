// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import { logout } from '@/slices/authSlice';

export default function DashboardPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { token, user } = useSelector((state: RootState) => state.auth);

    // Protect the route: if token is missing, redirect to login.
    useEffect(() => {
        if (!token) {
            router.push('/login');
        }
    }, [token, router]);

    // Logout handler: clears the auth state and navigates back to login.
    const handleLogout = () => {
        dispatch(logout());
        // Optionally clear any persisted state if needed.
        router.push('/login');
    };

    // While waiting for authentication verification, you can show a loading state.
    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    {user && (
                        <p className="mt-2 text-lg">Welcome, {user.username || user.email}!</p>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </header>
            <main>
                {/* Insert your secure dashboard components or content here */}
                <section>
                    <p>
                        This is your secure dashboard. Access sensitive resources, metrics, or
                        workflows here with enterprise-grade security protocols.
                    </p>
                </section>
            </main>
        </div>
    );
}
