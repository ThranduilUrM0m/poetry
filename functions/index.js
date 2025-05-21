const functions = require('firebase-functions');
const next = require('next');
const express = require('express');

const dev = false;
const app = next({
    dev,
    conf: { distDir: 'client/.next' } // Changed path
});

exports.nextjsFunc = functions.https.onRequest(async (req, res) => {
    try {
        await app.prepare();
        const handle = app.getRequestHandler();
        return handle(req, res);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});