export const GA_TRACKING_ID: string = process.env.NEXT_PUBLIC_GA_ID ?? '';

type GtagEvent = {
    action: string;
    category?: string;
    label?: string;
    value?: number;
    params?: Record<string, string | number | boolean>;
};

declare global {
    interface Window {
        gtag: (command: 'config' | 'event' | 'consent', ...params: (string | object)[]) => void;
    }
}

// Enhanced pageview tracking
export function pageview(url: string): void {
    if (typeof window.gtag === 'function' && GA_TRACKING_ID) {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
            // Enable enhanced measurement
            send_page_view: true,
            // Add user properties if available
            user_properties: {
                user_id: getUserId() || 'anonymous', // Implement getUserId()
                age_group: getUserAgeGroup() || 'unknown', // Implement getUserAgeGroup()
            },
            // Enable all enhanced measurements
            enable_auto_pii: true,
        });

        // Track additional page information
        window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: url,
        });
    }
}

// Enhanced event tracking
export function event({ action, category, label, value, params = {} }: GtagEvent): void {
    if (typeof window.gtag === 'function') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
            ...params,
        });
    }
}

// Device and browser tracking
export function trackDeviceInfo(): void {
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'device_info', {
            device_type: getDeviceType(),
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            browser: getBrowserName(),
            os: getOSName(),
        });
    }
}

// Helper functions
function getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (
        /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
            ua
        )
    )
        return 'mobile';
    return 'desktop';
}

function getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
}

function getOSName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'MacOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
}

// User ID management (implement based on your auth system)
function getUserId(): string | null {
    // Example: return localStorage.getItem('userId');
    return null;
}

// Age group detection (if available)
function getUserAgeGroup(): string | null {
    // Implement based on your user data
    return null;
}

// Track user engagement
export function trackEngagement(): void {
    if (typeof window.gtag === 'function') {
        // Track scroll depth
        trackScrollDepth();

        // Track time on page
        trackTimeOnPage();

        // Track interactions
        document.addEventListener('click', trackOutboundLinks);
    }
}

function trackScrollDepth(): void {
    const thresholds = [25, 50, 75, 90];
    let lastSent = 0;

    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        const threshold = thresholds.find((t) => scrollPercent >= t && t > lastSent);

        if (threshold) {
            window.gtag('event', 'scroll', {
                scroll_depth: `${threshold}%`,
            });
            lastSent = threshold;
        }
    });
}

function trackTimeOnPage(): void {
    const startTime = Date.now();

    window.addEventListener('beforeunload', () => {
        const duration = Date.now() - startTime;
        window.gtag('event', 'timing_complete', {
            name: 'page_duration',
            value: Math.round(duration / 1000), // in seconds
            event_category: 'Engagement',
        });
    });
}

function trackOutboundLinks(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const link = target.closest('a');

    if (link && link.href && !link.href.startsWith(window.location.origin)) {
        window.gtag('event', 'click', {
            event_category: 'Outbound Link',
            event_label: link.href,
            transport_type: 'beacon',
        });
    }
}
