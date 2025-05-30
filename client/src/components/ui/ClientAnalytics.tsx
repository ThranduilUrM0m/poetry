/**
 * ClientAnalytics.tsx
 * -------------------
 * Client-side analytics tracker for all GA4 enhanced measurement events and user properties.
 * Ensures every supported GA event and property is tracked on route change and user interaction.
 */
'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
    trackPageView,
    trackEvent,
    setCustomDimensions,
    trackDeviceInfo,
    initializeGtag,
} from '@/utils/gtags';

export default function ClientAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize GA and enhanced measurement on mount
    useEffect(() => {
        initializeGtag();
    }, []);

    // Track pageview and custom dimensions on route change
    useEffect(() => {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        trackPageView(url, document.title, document.referrer);

        // Example: Set custom dimensions/metrics if available (replace with real values)
        setCustomDimensions({
            traffic_source: window.sessionStorage.getItem('traffic_source') ?? 'direct',
            campaign: window.sessionStorage.getItem('campaign') ?? '',
            medium: window.sessionStorage.getItem('medium') ?? '',
            content_group: window.sessionStorage.getItem('content_group') ?? '',
            experiment_id: window.sessionStorage.getItem('experiment_id') ?? '',
            session_id: window.sessionStorage.getItem('session_id') ?? '',
        });

        // Track device info on every pageview
        trackDeviceInfo();
    }, [pathname, searchParams]);

    // Enhanced measurement: scroll, outbound clicks, site search, file download, video engagement
    useEffect(() => {
        // Scroll tracking (thresholds: 25%, 50%, 75%, 90%)
        const thresholds = [25, 50, 75, 90];
        let lastSent = 0;
        const handleScroll = () => {
            const percent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) *
                    100
            );
            const threshold = thresholds.find((t) => percent >= t && t > lastSent);
            if (threshold) {
                trackEvent('scroll', { scroll_depth: `${threshold}%` });
                lastSent = threshold;
            }
        };

        // Outbound link tracking
        const handleClick = (e: MouseEvent) => {
            const link = (e.target as HTMLElement).closest('a');
            if (link && link.href && !link.href.startsWith(window.location.origin)) {
                trackEvent('outbound_click', { outbound_url: link.href });
            }
        };

        // Site search tracking
        const handleSearch = (e: Event) => {
            const input = e.target as HTMLInputElement;
            if (input && input.value) {
                trackEvent('site_search', { search_term: input.value });
            }
        };

        // File download tracking
        const handleDownload = (e: MouseEvent) => {
            const link = (e.target as HTMLElement).closest('a');
            if (link && link.href && /\.(pdf|docx?|xlsx?|zip|rar|csv|pptx?)$/i.test(link.href)) {
                trackEvent('file_download', { file_name: link.href.split('/').pop() ?? '' });
            }
        };

        // Video engagement tracking (example for HTML5 video)
        const handleVideoPlay = (e: Event) => {
            const video = e.target as HTMLVideoElement;
            if (video && video.currentSrc) {
                trackEvent('video_engagement', { video_title: video.currentSrc });
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleClick);
        document.addEventListener('click', handleDownload);
        document
            .querySelectorAll('input[type="search"]')
            .forEach((el) => el.addEventListener('change', handleSearch));
        document
            .querySelectorAll('video')
            .forEach((el) => el.addEventListener('play', handleVideoPlay));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('click', handleDownload);
            document
                .querySelectorAll('input[type="search"]')
                .forEach((el) => el.removeEventListener('change', handleSearch));
            document
                .querySelectorAll('video')
                .forEach((el) => el.removeEventListener('play', handleVideoPlay));
        };
    }, []);

    // Engagement: user active/inactive
    useEffect(() => {
        let engagementTimer: NodeJS.Timeout;
        const trackActiveEngagement = () => {
            clearTimeout(engagementTimer);
            engagementTimer = setTimeout(() => {
                trackEvent('user_inactive', { category: 'Engagement' });
            }, 30000);
            trackEvent('user_active', { category: 'Engagement' });
        };
        window.addEventListener('mousemove', trackActiveEngagement);
        window.addEventListener('keydown', trackActiveEngagement);
        window.addEventListener('scroll', trackActiveEngagement);

        return () => {
            clearTimeout(engagementTimer);
            window.removeEventListener('mousemove', trackActiveEngagement);
            window.removeEventListener('keydown', trackActiveEngagement);
            window.removeEventListener('scroll', trackActiveEngagement);
        };
    }, []);

    return null;
}
