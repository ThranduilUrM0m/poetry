// components/ClientAnalytics.tsx

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { pageview } from '@/utils/gtags';

export default function ClientAnalytics() {
    const pathname = usePathname();
    useEffect(() => {
        pageview(pathname);
    }, [pathname]);
    return null;
}
