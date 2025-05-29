// utils/gtags.ts

export const GA_TRACKING_ID: string = process.env.NEXT_PUBLIC_GA_ID ?? '';

type GtagEvent = {
    action: string;
    category: string;
    label?: string;
    value?: number;
};

// Extend window.gtag signature
declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event',
            targetIdOrEventName: string,
            params?: Record<string, unknown>
        ) => void;
    }
}

/** Track a standard pageview. */
export function pageview(url: string): void {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_TRACKING_ID) {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    }
}

/** Track a custom event. */
export function event({ action, category, label, value }: GtagEvent): void {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', action, {
            event_category: category,
            ...(label ? { event_label: label } : {}),
            ...(typeof value === 'number' ? { value } : {}),
        });
    }
}

// Helpers
export function trackArticleView(articleId: string, title: string, category: string): void {
    event({
        action: 'view_article',
        category: 'Article',
        label: `${category} - ${title}`,
        value: 1,
    });
}

export function trackVote(articleId: string, direction: 'up' | 'down', title: string): void {
    event({
        action: direction === 'up' ? 'vote_up' : 'vote_down',
        category: 'Vote',
        label: title,
        value: 1,
    });
}

export function trackComment(articleId: string, title: string): void {
    event({
        action: 'comment',
        category: 'Comment',
        label: title,
        value: 1,
    });
}

export function trackSubscribe(email: string): void {
    event({
        action: 'subscribe',
        category: 'Subscriber',
        label: email,
        value: 1,
    });
}
