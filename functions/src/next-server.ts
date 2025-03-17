// functions/src/next-server.ts
import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import next from 'next';
import express from 'express';

// Configure function resources
setGlobalOptions({
    region: 'your-region', // e.g. 'us-central1'
    memory: '1GiB',
    timeoutSeconds: 60,
});

const app = next({
    dev: false,
    conf: {
        distDir: '.next',
    },
});

const handle = app.getRequestHandler();

export const ssr = onRequest(async (req, res) => {
    await app.prepare();
    const server = express();
    server.all('*', (req, res) => handle(req, res));
    server(req, res);
});
