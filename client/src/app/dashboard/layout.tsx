import DashboardLayoutClient from './DashboardLayoutClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // No server-side auth check here, since you use JWT/Redux
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
