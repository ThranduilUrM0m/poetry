// dashboard/Sidebar.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { LayoutDashboard, Newspaper, UserCog, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import logo from '@/assets/images/b_white_orange..svg';
import { clearAuth } from '@/slices/authSlice';
import { clearUserState } from '@/slices/userSlice';
import { useDashboard } from '@/context/DashboardContext';

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const { isReady } = useDashboard();
    const smoothConfig = { mass: 1, tension: 170, friction: 26 };
    const dispatch = useDispatch();
    const router = useRouter();

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
                        click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                    >
                        <Link href="/dashboard">
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
                        click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                    >
                        <Link href="/dashboard/articles">
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
                        click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                    >
                        <Link href="/dashboard/settings">
                            <span>
                                <UserCog />
                            </span>
                            {isSidebarOpen && <span className="__liText">Settings</span>}
                        </Link>
                    </AnimatedWrapper>
                    <AnimatedWrapper
                        as="li"
                        config={smoothConfig}
                        hover={{ from: { opacity: 0.5 }, to: { opacity: 1 } }}
                        click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
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
