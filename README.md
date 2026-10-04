# ThreatScope – IP & Website Threat Checker

A modern, professional, responsive cybersecurity threat intelligence web application designed for Security Operations Centers (SOC) and defensive network forensics.

---

## 🎨 Design Theme & Strict Color Palette

ThreatScope strictly employs the following unified cybersecurity palette:

| Tactical Role | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| **Dark Navy** | `#132440` | Main canvas background, navbar, sidebar, primary HUD cards |
| **Primary Red** | `#BF092F` | Critical alerts, scan CTA, threat indicators, high-risk flags |
| **Secondary Blue** | `#16476A` | Information panels, charts, secondary sections, telemetry cards |
| **Teal** | `#3B9797` | Safe verification status, success indicators, secondary accents |
| **Light Gray / White** | `#F8FAFC` | High-contrast readable typography and data labels |

---

## 🚀 Key Features

1. **Intelligent Target Auto-Detection**
   - Automatically determines target type: **IPv4**, **IPv6**, **DOMAIN**, or **URL**.
   - Single universal search input that requires zero manual mode switching.

2. **Threat Score Radial HUD**
   - Circular progress score (0 to 100) indicating calibrated risk severity.
   - Dynamic coloring: Safe (`#3B9797`), Warning (`#16476A`), High/Critical (`#BF092F`).
   - Signal confidence level, detection counts, and last checked timestamps.

3. **8-Vector Threat Intelligence Engine**
   - Blacklist Status (Clean / Blacklisted)
   - Malware Detection
   - Phishing Detection
   - Spam Reputation
   - Botnet Association
   - Abuse Reports
   - Suspicious Activity
   - Known Threats & Adversary IOCs

4. **IP Intelligence & Geolocation**
   - IP address, Reverse DNS (PTR), Country, City, Region, Timezone.
   - Autonomous System Number (ASN), ISP, and Hosting Provider.
   - Interactive radar-sweep map panel with targeting reticle and coordinate lock.

5. **Domain Intelligence & WHOIS**
   - Registrar, Creation Date, Expiration Date, Domain Age, Nameservers.
   - ICANN RDAP protocol integration with GDPR/privacy redaction handling.

6. **DNS Analysis Table**
   - Real-time native resolution for **A**, **AAAA**, **MX**, **NS**, **TXT**, and **CNAME** records.
   - Interactive type filtering and copy-to-clipboard actions.

7. **Security / SSL Analysis**
   - Real peer certificate handshake verification.
   - Certificate Issuer, Validity dates, Days remaining countdown, TLS version, Subject, and SANs.

8. **URL & Redirect Chain Analysis**
   - Step-by-step HTTP redirect flowchart (301, 302, 307, 308).
   - Highlighting suspicious redirect hops with `#BF092F`.
   - Technology stack fingerprinting (Web Server, CDN, Framework, CMS, JS Libraries, Analytics).
   - Browser defense headers inspection (HSTS, CSP, X-Frame-Options).

9. **Dashboard Statistics & Interactive Charts**
   - Recharts-powered **Threat Detection Trend** (7-Day Area Chart).
   - **Risk Distribution** (Donut Chart).
   - **Threat Categories Breakdown** (Horizontal Bar Chart).

10. **Auditable Scan History**
    - Searchable and filterable registry of past scans with instant re-scan and deletion.

11. **PDF Report Export**
    - Instant one-click PDF generation via dedicated print stylesheet.

12. **Defense-in-Depth Security (SSRF Protection)**
    - Strict pre-flight checks blocking private IPv4 (RFC 1918), loopback (127.0.0.0/8), link-local (169.254.0.0/16), cloud metadata endpoints (`169.254.169.254`), and internal hostnames.

---

## 🛠️ Tech Stack

- **Frontend**: React.js 18, Vite, React Router, Tailwind CSS, Lucide React, Recharts, Axios
- **Backend**: Node.js, Express.js, Helmet, Express Rate Limit, Native DNS & TLS sockets
- **Security**: SSRF Protection middleware, CORS policy, Request timeouts

---

## ⚡ Quick Start

### 1. Backend Server
```bash
cd server
npm install
npm run dev
# Server will run on http://localhost:5001
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
# Client will run on http://localhost:5173
```

---

## 🔐 Optional API Integrations

ThreatScope works out of the box using Node.js native DNS and TLS sockets. You can optionally connect external threat feeds by populating `server/.env`:

```env
PORT=5001
VIRUSTOTAL_API_KEY=your_virustotal_key
ABUSEIPDB_API_KEY=your_abuseipdb_key
IPINFO_TOKEN=your_ipinfo_token
URLSCAN_API_KEY=your_urlscan_key
```

*Note: API keys are loaded strictly in the backend and are NEVER exposed to the frontend bundle.*
