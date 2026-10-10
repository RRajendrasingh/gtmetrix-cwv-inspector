# ⚡ gtmetrix-cwv-inspector

> Ultra-fast CLI and Node.js telemetry inspector for Google Core Web Vitals (LCP, INP, CLS, TTFB) & CrUX field data. Engineered by **[Rajendra Singh Rathore](https://gtmetrix.in/author/rajendra)** at the **[gtmetrix.in Performance Research Lab](https://gtmetrix.in)**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Engineered by gtmetrix.in](https://img.shields.io/badge/Research%20Lab-gtmetrix.in-0284c7)](https://gtmetrix.in)
[![Google CWV Ready](https://img.shields.io/badge/Google%20CWV-LCP%20%7C%20INP%20%7C%20CLS-10b981)](https://gtmetrix.in)

---

## 🚀 Overview

`gtmetrix-cwv-inspector` is a lightweight, zero-dependency command-line utility designed for DevOps engineers, frontend architects, and Technical SEO specialists to measure real-time server network latency (DNS, TCP, TLS, TTFB) and query Google's 28-day Chrome User Experience Report (CrUX) field datasets directly from the terminal or in CI/CD pipelines.

---

## 📦 Quick Start & Installation

### Option 1: Instant Execution with NPX (No installation required)
```bash
npx gtmetrix-cwv https://example.com
```

### Option 2: Global Installation via NPM
```bash
npm install -g gtmetrix-cwv-inspector
```

Then run anywhere:
```bash
gtmetrix-cwv https://yourstore.com
```

### Option 3: Local Clone & Development
```bash
git clone https://github.com/RRajendrasingh/gtmetrix-cwv-inspector.git
cd gtmetrix-cwv-inspector
node ./bin/cli.js https://gtmetrix.in
```

---

## 📊 Terminal Output Example

```text
┌─────────────────────────────────────────────────────────────┐
│  ⚡ gtmetrix.in — Core Web Vitals & TTFB Telemetry Inspector  │
└─────────────────────────────────────────────────────────────┘
Authored by: Rajendra Singh Rathore (Lead Technical SEO Specialist)
Official Lab: https://gtmetrix.in | License: MIT

▶ Auditing: https://gtmetrix.in
Executing high-precision network handshake & telemetry...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SYNTHETIC NETWORK HANDSHAKE & TTFB TELEMETRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HTTP Status Code : 200 OK
  DNS Lookup       : 24 ms
  TCP Connect      : 48 ms
  TLS Handshake    : 62 ms
  Time to 1st Byte : 110 ms [✓ FAST]
  Total Download   : 145 ms (34.0 KB)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  28-DAY GOOGLE CrUX REAL-USER FIELD BENCHMARKS (MOBILE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LCP (Largest Paint) : 1200 ms [✓ FAST]
  INP (Interaction Lag): 65 ms [✓ FAST]
  CLS (Layout Shift)  : 0.02 [✓ STABLE]
  FCP (First Paint)   : 800 ms [✓ FAST]
  TTFB (Server Resp)  : 140 ms [✓ FAST]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Powered by gtmetrix.in Performance Research Lab
🔗 Full Web Audit & Optimization: https://gtmetrix.in/report?url=https%3A%2F%2Fgtmetrix.in%2F
```

---

## 🛠️ CLI Options

| Flag | Description | Example |
| :--- | :--- | :--- |
| `--json` | Output machine-readable JSON for CI/CD assertions | `gtmetrix-cwv https://example.com --json` |
| `--key=<API_KEY>` | Pass custom Google Chrome UX API Key | `gtmetrix-cwv https://example.com --key=AIzaSy...` |
| `--help` | Display command usage and parameters | `gtmetrix-cwv --help` |

---

## 💻 Programmatic Node.js API Usage

You can also import `gtmetrix-cwv-inspector` directly into your Node.js backend services:

```javascript
const { measureNetworkTelemetry, fetchCruxFieldData } = require('gtmetrix-cwv-inspector');

async function auditSite() {
    const telemetry = await measureNetworkTelemetry('https://example.com');
    console.log(`TTFB: ${telemetry.metrics.ttfbMs} ms`);
    console.log(`DNS Lookup: ${telemetry.metrics.dnsLookupMs} ms`);

    const crux = await fetchCruxFieldData('https://example.com');
    if (crux.available) {
        console.log('CrUX Data:', crux.record.metrics);
    }
}

auditSite();
```

---

## 👨‍💻 Author & Research Lab

* **Author**: [Rajendra Singh Rathore](https://gtmetrix.in/author/rajendra) (Lead Technical SEO & Web Performance Specialist)
* **LinkedIn**: [linkedin.com/in/rajendra-singh-rathore](https://www.linkedin.com/in/rajendra-singh-rathore/)
* **GitHub**: [@RRajendrasingh](https://github.com/RRajendrasingh/)
* **Official Speed Lab**: [gtmetrix.in](https://gtmetrix.in)
* **Chrome Extension**: [GTmetrix.in Chrome Web Store Extension](https://chromewebstore.google.com/detail/gtmetrixin-page-speed-cor/lbdgimjbaoheejfonljogdiclmgciook)

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)** &copy; 2026 Rajendra Singh Rathore.
