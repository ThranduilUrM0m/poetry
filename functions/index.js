// filepath: functions/index.js
const functions = require('firebase-functions');
const next = require('next');
const express = require('express');
const path = require('path');

const dev = false;
const app = next({
    dev,
    conf: { distDir: '../client/.next' }
});
const handle = app.getRequestHandler();

const server = express();

// SSR handler for all non-API routes
server.all('*', (req, res) => {
    return handle(req, res);
});

exports.nextjsFunc = functions.https.onRequest(server);