/**
 * gtags.ts
 * --------
 * Google Analytics 4 (GA4) utility functions for enhanced measurement, user properties,
 * custom dimensions/metrics, and robust event tracking.
 */

export const GA_TRACKING_ID: string = process.env.NEXT_PUBLIC_GA_ID ?? '';

/* type GtagEvent = {
    action: string;
    category?: string;
    label?: string;
    value?: number;
    params?: Record<string, string | number | boolean | null>;
}; */

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}

/**
 * Fires a pageview event with all custom dimensions and user properties.
 */
export function trackPageView(path: string, title?: string, referrer?: string): void {
    if (typeof window.gtag === 'function' && GA_TRACKING_ID) {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: path,
            page_title: title,
            referrer,
            send_page_view: true,
            ...getCustomDimensions(),
        });
    }
}

/**
 * Fires a custom event with robust parameter logging.
 */
export function trackEvent(
    name: string,
    params: Record<string, string | number | boolean | null>
): void {
    if (typeof window.gtag === 'function') {
        try {
            window.gtag('event', name, params);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[gtags] trackEvent error:', err, name, params);
        }
    }
}

/**
 * Sets custom dimensions/metrics for the session.
 */
export function setCustomDimensions(dimensions: Record<string, string | number | null>): void {
    if (typeof window.gtag === 'function') {
        window.gtag('set', 'custom_map', dimensions);
    }
}

/**
 * Tracks device/browser/OS info.
 */
export function trackDeviceInfo(): void {
    if (typeof window.gtag === 'function') {
        trackEvent('device_info', {
            device_type: getDeviceType(),
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            browser: getBrowserName(),
            os: getOSName(),
        });
    }
}

/**
 * Initializes GA4 with consent and error logging.
 */
export function initializeGtag(): void {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function (...args: unknown[]) {
            window.dataLayer!.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
            page_path: window.location.pathname,
        });
    }
}

// --- Helpers ---

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

function getCustomDimensions(): Record<string, string | number | null> {
    return {
        traffic_source: window.sessionStorage.getItem('traffic_source') ?? 'direct',
        campaign: window.sessionStorage.getItem('campaign') ?? '',
        medium: window.sessionStorage.getItem('medium') ?? '',
        content_group: window.sessionStorage.getItem('content_group') ?? '',
        experiment_id: window.sessionStorage.getItem('experiment_id') ?? '',
        session_id: window.sessionStorage.getItem('session_id') ?? '',
    };
}
