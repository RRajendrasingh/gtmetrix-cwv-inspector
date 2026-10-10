#!/usr/bin/env node

/**
 * gtmetrix-cwv-inspector CLI
 * Command-Line Interface for Instant Google Core Web Vitals & TTFB Diagnostics
 * Maintained by Rajendra Singh Rathore (https://gtmetrix.in/author/rajendra)
 */

const { measureNetworkTelemetry, fetchCruxFieldData, evaluateRating } = require('../src/index');

const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    bgBlue: '\x1b[44m\x1b[37m',
    bgGreen: '\x1b[42m\x1b[30m'
};

function printBanner() {
    console.log(`
${colors.cyan}${colors.bold}┌─────────────────────────────────────────────────────────────┐
│  ⚡ gtmetrix.in — Core Web Vitals & TTFB Telemetry Inspector  │
└─────────────────────────────────────────────────────────────┘${colors.reset}
${colors.dim}Authored by: Rajendra Singh Rathore (Lead Technical SEO Specialist)
Official Lab: https://gtmetrix.in | License: MIT${colors.reset}
`);
}

async function run() {
    const args = process.argv.slice(2);
    const targetUrl = args.find(a => !a.startsWith('--'));
    const isJson = args.includes('--json');
    const apiKey = (args.find(a => a.startsWith('--key=')) || '').replace('--key=', '');

    if (!targetUrl || args.includes('--help') || args.includes('-h')) {
        printBanner();
        console.log(`Usage:
  npx gtmetrix-cwv <url> [options]
  node ./bin/cli.js <url> [options]

Options:
  --json           Output raw JSON results for CI/CD pipelines
  --key=<api_key>  Optional Google Chrome UX Report API Key
  --help, -h       Show this help dialog

Examples:
  npx gtmetrix-cwv https://example.com
  npx gtmetrix-cwv flipkart.com --json
`);
        process.exit(0);
    }

    if (!isJson) {
        printBanner();
        console.log(`${colors.blue}▶ Auditing:${colors.reset} ${colors.bold}${targetUrl}${colors.reset}`);
        console.log(`${colors.dim}Executing high-precision network handshake & telemetry...${colors.reset}\n`);
    }

    try {
        const netStart = Date.now();
        const [networkRes, cruxRes] = await Promise.all([
            measureNetworkTelemetry(targetUrl),
            fetchCruxFieldData(targetUrl, apiKey)
        ]);

        if (isJson) {
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                auditDurationMs: Date.now() - netStart,
                target: networkRes.url,
                syntheticTelemetry: networkRes,
                cruxFieldData: cruxRes
            }, null, 2));
            return;
        }

        // Print Network Handshake Table
        const ttfbRating = evaluateRating('TTFB', networkRes.metrics.ttfbMs);
        const ttfbColor = colors[ttfbRating.color] || colors.reset;

        console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.bold}  SYNTHETIC NETWORK HANDSHAKE & TTFB TELEMETRY${colors.reset}`);
        console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`  HTTP Status Code : ${networkRes.statusCode === 200 ? colors.green + '200 OK' : colors.yellow + networkRes.statusCode}${colors.reset}`);
        console.log(`  DNS Lookup       : ${networkRes.metrics.dnsLookupMs} ms`);
        console.log(`  TCP Connect      : ${networkRes.metrics.tcpHandshakeMs} ms`);
        console.log(`  TLS Handshake    : ${networkRes.metrics.tlsHandshakeMs} ms`);
        console.log(`  Time to 1st Byte : ${ttfbColor}${colors.bold}${networkRes.metrics.ttfbMs} ms [${ttfbRating.badge}]${colors.reset}`);
        console.log(`  Total Download   : ${networkRes.metrics.totalDownloadMs} ms (${(networkRes.contentLengthBytes / 1024).toFixed(1)} KB)`);
        console.log(``);

        // Print CrUX 28-Day Real-User Field Data
        console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.bold}  28-DAY GOOGLE CrUX REAL-USER FIELD BENCHMARKS (MOBILE)${colors.reset}`);
        console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

        if (cruxRes.available && cruxRes.record && cruxRes.record.metrics) {
            const metrics = cruxRes.record.metrics;

            const printCruxMetric = (label, key, unit = 'ms') => {
                if (!metrics[key] || !metrics[key].percentiles) return;
                const p75 = metrics[key].percentiles.p75;
                const rating = evaluateRating(key.replace('_', ''), p75);
                const col = colors[rating.color] || colors.reset;
                console.log(`  ${label.padEnd(20)}: ${col}${colors.bold}${p75} ${unit}${colors.reset} [${rating.badge}]`);
            };

            printCruxMetric('LCP (Largest Paint)', 'largest_contentful_paint', 'ms');
            printCruxMetric('INP (Interaction Lag)', 'interaction_to_next_paint', 'ms');
            printCruxMetric('CLS (Layout Shift)', 'cumulative_layout_shift', '');
            printCruxMetric('FCP (First Paint)', 'first_contentful_paint', 'ms');
            printCruxMetric('TTFB (Server Resp)', 'experimental_time_to_first_byte', 'ms');
        } else {
            console.log(`  ${colors.yellow}ℹ CrUX Note:${colors.reset} ${cruxRes.reason || 'Insufficient real-user traffic data for this specific URL.'}`);
            console.log(`  ${colors.dim}Synthetic audits and lab diagnostics remain accurate.${colors.reset}`);
        }

        console.log(`\n${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`⚡ Powered by gtmetrix.in Performance Research Lab`);
        console.log(`🔗 Full Web Audit & Optimization: https://gtmetrix.in/report?url=${encodeURIComponent(networkRes.url)}${colors.reset}\n`);

    } catch (err) {
        if (isJson) {
            console.error(JSON.stringify({ error: err.message }));
        } else {
            console.error(`\n${colors.red}${colors.bold}✗ Audit Failed:${colors.reset} ${err.message}\n`);
        }
        process.exit(1);
    }
}

run();
