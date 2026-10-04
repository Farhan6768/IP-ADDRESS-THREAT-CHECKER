# ThreatScope – IP & Website Threat Checker

A modern, professional, responsive cybersecurity threat intelligence web application designed for Security Operations Centers (SOC) and defensive network forensics.

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
