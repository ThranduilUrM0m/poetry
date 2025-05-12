// dashboard/Sidebar.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { LayoutDashboard, Newspaper, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import logo from '@/assets/images/b_white_orange..svg';
import { clearAuth } from '@/slices/authSlice';
import { clearUserState } from '@/slices/userSlice';
import { useDashboard } from '@/context/DashboardContext';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const { isReady } = useDashboard();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();

    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

    const handleMouseEnter = () => setIsSidebarOpen(true);
    const handleMouseLeave = () => setIsSidebarOpen(false);

    const handleLogout = () => {
        dispatch(clearAuth());
        localStorage.removeItem('token');
        dispatch(clearUserState());
        router.push('/login');
    };

    return (
        <AnimatedWrapper
            as="aside"
            className={`dashboard__sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
            from={{ opacity: 0.5 }}
            to={isReady ? { opacity: 1 } : undefined}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="dashboard__sidebar-header">
                <Link href="/" className="dashboard__sidebar-header-logo">
                    <Image src={logo} alt="Logo" width={32} height={32} />
                </Link>
            </div>
            <nav className="dashboard__sidebar-nav">
                <ul className="dashboard__sidebar-nav-list">
                    <AnimatedWrapper
                        as="li"
                        config={smoothConfig}
                        hover={{ from: { opacity: 0.5 }, to: { opacity: 1 } }}
                    >
                        <Link
                            href="/dashboard"
                            className={pathname === '/dashboard' ? 'active' : ''}
                        >
                            <span>
                                <LayoutDashboard />
                            </span>
                            {isSidebarOpen && <span className="__liText">Dashboard</span>}
                        </Link>
                    </AnimatedWrapper>
                    <AnimatedWrapper
                        as="li"
                        config={smoothConfig}
                        hover={{ from: { opacity: 0.5 }, to: { opacity: 1 } }}
                    >
                        <Link
                            href="/dashboard/articles"
                            className={pathname === '/dashboard/articles' ? 'active' : ''}
                        >
                            <span>
                                <Newspaper />
                            </span>
                            {isSidebarOpen && <span className="__liText">Articles</span>}
                        </Link>
                    </AnimatedWrapper>
                    <AnimatedWrapper
                        as="li"
                        config={smoothConfig}
                        hover={{ from: { opacity: 0.5 }, to: { opacity: 1 } }}
                    >
                        <button onClick={handleLogout} className="__logout">
                            <span>
                                <LogOut />
                            </span>
                            {isSidebarOpen && <span className="__liText">Logout</span>}
                        </button>
                    </AnimatedWrapper>
                </ul>
            </nav>
        </AnimatedWrapper>
    );
}
