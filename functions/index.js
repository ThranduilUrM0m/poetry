const functions = require('firebase-functions');
const next = require('next');
const express = require('express');

const dev = false;
const app = next({
    dev,
    conf: { distDir: '../client/.next' }
});
const handle = app.getRequestHandler();

const server = express();

// Make sure paths are properly formatted
server.get('*', (req, res) => {
    return handle(req, res);
});

exports.nextjsFunc = functions.https.onRequest(server);