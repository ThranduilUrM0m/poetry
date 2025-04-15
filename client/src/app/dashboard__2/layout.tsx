'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Bell
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: FileText, label: 'Articles', href: '/dashboard/articles' },
    { icon: MessageSquare, label: 'Comments', href: '/dashboard/comments' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [notifications] = useState<{ id: string; message: string }[]>([]);

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                </div>
                <nav className="px-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${
                                pathname === item.href
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="h-16 flex items-center justify-end px-6 border-b bg-white">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger className="relative p-2 hover:bg-gray-100 rounded">
                            <Bell className="w-5 h-5" />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="w-64 mt-2 bg-white rounded-md shadow-lg">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <DropdownMenu.Item key={notif.id} className="p-4 hover:bg-gray-100">
                                        {notif.message}
                                    </DropdownMenu.Item>
                                ))
                            )}
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
