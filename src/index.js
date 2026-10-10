/**
 * gtmetrix-cwv-inspector — Core Telemetry & Benchmark Engine
 * Authored by Rajendra Singh Rathore (gtmetrix.in Performance Research Lab)
 * License: MIT
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Perform high-precision synthetic TTFB and network handshake measurement
 * @param {string} targetUrl 
 * @returns {Promise<Object>}
 */
function measureNetworkTelemetry(targetUrl) {
    return new Promise((resolve, reject) => {
        let parsedUrl;
        try {
            parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
        } catch (err) {
            return reject(new Error(`Invalid target URL: ${targetUrl}`));
        }

        const isHttps = parsedUrl.protocol === 'https:';
        const client = isHttps ? https : http;

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.pathname + (parsedUrl.search || ''),
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; gtmetrix-cwv-inspector/1.0; +https://gtmetrix.in)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            timeout: 10000
        };

        const startTime = process.hrtime.bigint();
        let dnsTime = 0;
        let tcpTime = 0;
        let tlsTime = 0;
        let ttfb = 0;
        let totalTime = 0;

        const req = client.request(options, (res) => {
            const firstByteTime = process.hrtime.bigint();
            ttfb = Number(firstByteTime - startTime) / 1e6; // in milliseconds

            let bodyLength = 0;
            res.on('data', (chunk) => {
                bodyLength += chunk.length;
            });

            res.on('end', () => {
                const endTime = process.hrtime.bigint();
                totalTime = Number(endTime - startTime) / 1e6;

                resolve({
                    url: parsedUrl.href,
                    statusCode: res.statusCode,
                    headers: res.headers,
                    contentLengthBytes: bodyLength,
                    metrics: {
                        dnsLookupMs: Math.round(dnsTime),
                        tcpHandshakeMs: Math.round(tcpTime),
                        tlsHandshakeMs: Math.round(tlsTime),
                        ttfbMs: Math.round(ttfb),
                        totalDownloadMs: Math.round(totalTime)
                    }
                });
            });
        });

        req.on('socket', (socket) => {
            socket.on('lookup', () => {
                dnsTime = Number(process.hrtime.bigint() - startTime) / 1e6;
            });
            socket.on('connect', () => {
                tcpTime = Number(process.hrtime.bigint() - startTime) / 1e6;
            });
            socket.on('secureConnect', () => {
                tlsTime = Number(process.hrtime.bigint() - startTime) / 1e6;
            });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Connection timeout after 10,000ms for ${targetUrl}`));
        });

        req.end();
    });
}

/**
 * Fetch 28-day Google Chrome User Experience Report (CrUX) Field Data via Google API
 * @param {string} targetUrl 
 * @param {string} [apiKey] 
 * @returns {Promise<Object>}
 */
async function fetchCruxFieldData(targetUrl, apiKey = '') {
    const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const endpoint = `https://chromeuxreport.googleapis.com/v1/records:queryRecord${apiKey ? `?key=${apiKey}` : ''}`;

    const payload = JSON.stringify({
        url: cleanUrl,
        formFactor: 'PHONE'
    });

    return new Promise((resolve) => {
        const req = https.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 8000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        return resolve({ available: true, record: json.record });
                    } catch (e) {
                        return resolve({ available: false, reason: 'Invalid JSON response' });
                    }
                }
                resolve({
                    available: false,
                    statusCode: res.statusCode,
                    reason: res.statusCode === 404 ? 'No CrUX field data found (Origin has insufficient traffic)' : 'API Key or Quota limit'
                });
            });
        });

        req.on('error', () => resolve({ available: false, reason: 'Network error contacting Google CrUX API' }));
        req.on('timeout', () => {
            req.destroy();
            resolve({ available: false, reason: 'CrUX API timeout' });
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Evaluate Core Web Vitals rating based on Google thresholds
 * @param {string} metricName 
 * @param {number} value 
 * @returns {Object} { status: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR', color: string }
 */
function evaluateRating(metricName, value) {
    switch (metricName.toUpperCase()) {
        case 'LCP': // Largest Contentful Paint (ms)
            if (value <= 2500) return { status: 'GOOD', badge: '✓ FAST', color: 'green' };
            if (value <= 4000) return { status: 'NEEDS_IMPROVEMENT', badge: '⚠ SLOW', color: 'yellow' };
            return { status: 'POOR', badge: '✗ CRITICAL', color: 'red' };
        case 'INP': // Interaction to Next Paint (ms)
            if (value <= 200) return { status: 'GOOD', badge: '✓ FAST', color: 'green' };
            if (value <= 500) return { status: 'NEEDS_IMPROVEMENT', badge: '⚠ LAG', color: 'yellow' };
            return { status: 'POOR', badge: '✗ SLOW', color: 'red' };
        case 'CLS': // Cumulative Layout Shift
            if (value <= 0.1) return { status: 'GOOD', badge: '✓ STABLE', color: 'green' };
            if (value <= 0.25) return { status: 'NEEDS_IMPROVEMENT', badge: '⚠ SHIFTS', color: 'yellow' };
            return { status: 'POOR', badge: '✗ UNSTABLE', color: 'red' };
        case 'TTFB': // Time to First Byte (ms)
            if (value <= 800) return { status: 'GOOD', badge: '✓ FAST', color: 'green' };
            if (value <= 1800) return { status: 'NEEDS_IMPROVEMENT', badge: '⚠ FAIR', color: 'yellow' };
            return { status: 'POOR', badge: '✗ SLOW', color: 'red' };
        case 'FCP': // First Contentful Paint (ms)
            if (value <= 1800) return { status: 'GOOD', badge: '✓ FAST', color: 'green' };
            if (value <= 3000) return { status: 'NEEDS_IMPROVEMENT', badge: '⚠ FAIR', color: 'yellow' };
            return { status: 'POOR', badge: '✗ SLOW', color: 'red' };
        default:
            return { status: 'INFO', badge: '• INFO', color: 'cyan' };
    }
}

module.exports = {
    measureNetworkTelemetry,
    fetchCruxFieldData,
    evaluateRating
};
