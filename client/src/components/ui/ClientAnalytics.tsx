'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { pageview, trackDeviceInfo, trackEngagement } from '@/utils/gtags';

export default function ClientAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        pageview(url);
        trackDeviceInfo();
        trackEngagement();
    }, [pathname, searchParams]);

    return null;
}
