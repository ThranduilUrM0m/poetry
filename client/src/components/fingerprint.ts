import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const getFingerprint = async () => {
    try {
        const fpPromise = FingerprintJS.load(); // Remove region parameter
        const fp = await fpPromise;
        const result = await fp.get();

        if (typeof window !== 'undefined') {
            localStorage.setItem('fp', result.visitorId);
        }

        return result.visitorId;
    } catch (_error) {
        // has to use the _error to avoid eslint issues
        console.log(_error);
        const fallback = localStorage.getItem('fp') || Math.random().toString(36).substring(2);
        localStorage.setItem('fp', fallback);
        return fallback;
    }
};
