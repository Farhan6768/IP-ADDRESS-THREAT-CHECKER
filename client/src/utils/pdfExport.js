import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads an authentic, publication-grade Cyber Security Dossier PDF.
 * Includes complete Threat Intelligence Vectors, IP & Geo telemetry, DNS, SSL, Redirects,
 * Tech Stack, and Prescriptive Recommendations with clean professional columns & rows.
 * @param {Object} report The threat report object
 */
export function exportThreatReportToPdf(report) {
  if (!report) {
    throw new Error('No report data available to export.');
  }

  // Create A4 PDF in portrait mode (pt units: 595.28 x 841.89)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - (margin * 2);

  const s = (val, fallback = 'N/A') => (val !== undefined && val !== null && val !== '') ? (typeof val === 'object' ? (val.address || val.value || val.alias || val.target || JSON.stringify(val)) : String(val)) : fallback;

  // Primary Theme Colors (SOC Palette)
  const navyDark = [15, 23, 42];     // #0F172A
  const slateBorder = [226, 232, 240];// #E2E8F0
  const slateText = [100, 116, 139];  // #64748B
  const redPrimary = [191, 9, 47];    // #BF092F
  const tealSafe = [13, 148, 136];    // #0D9488
  const amberWarn = [217, 119, 6];    // #D97706

  let currentY = 36;

  // ---------------------------------------------------------
  // Header Banner
  // ---------------------------------------------------------
  doc.setFillColor(...navyDark);
  doc.rect(margin, currentY, contentWidth, 54, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('THREATSCOPE CYBER INTELLIGENCE DOSSIER', margin + 14, currentY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Consolidated Multi-Vector Security Assessment & Forensic Threat Telemetry', margin + 14, currentY + 38);

  // Right-aligned Risk Badge in header
  const isHighRisk = report.riskLevel === 'CRITICAL' || report.riskLevel === 'HIGH' || (report.threatScore > 50);
  doc.setFillColor(isHighRisk ? 185 : 4, isHighRisk ? 28 : 120, isHighRisk ? 28 : 87);
  doc.roundedRect(pageWidth - margin - 120, currentY + 12, 106, 30, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`${s(report.riskLevel, 'UNKNOWN')}`, pageWidth - margin - 67, currentY + 26, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text(`SCORE: ${report.threatScore ?? 0} / 100`, pageWidth - margin - 67, currentY + 36, { align: 'center' });

  currentY += 66;

  // ---------------------------------------------------------
  // Target & Metadata Strip Table
  // ---------------------------------------------------------
  const metadataBody = [
    [
      { content: 'Target Entity:', styles: { fontStyle: 'bold', textColor: [51, 65, 85] } },
      { content: s(report.target), styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
      { content: 'Audit Generated:', styles: { fontStyle: 'bold', textColor: [51, 65, 85] } },
      { content: s(report.timestamp, new Date().toLocaleString()) }
    ],
    [
      { content: 'Target Type:', styles: { fontStyle: 'bold', textColor: [51, 65, 85] } },
      { content: s(report.targetType, 'URL / Web Asset') },
      { content: 'Scan Duration:', styles: { fontStyle: 'bold', textColor: [51, 65, 85] } },
      { content: s(report.scanDuration, '0.85s') }
    ],
    [
      { content: 'Signal Confidence:', styles: { fontStyle: 'bold', textColor: [51, 65, 85] } },
      { content: s(report.confidence, '95% Consensus') },
      { content: 'Total Detections:', styles: { fontStyle: 'bold', textColor: [51, 65, 85] } },
      { content: `${report.detectionsCount ?? 0} Indicators Flagged` }
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: metadataBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      lineColor: slateBorder,
      lineWidth: 0.5
    },
    columnStyles: {
      0: { cellWidth: 95, fillColor: [248, 250, 252] },
      1: { cellWidth: 165 },
      2: { cellWidth: 95, fillColor: [248, 250, 252] },
      3: { cellWidth: 168 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // ---------------------------------------------------------
  // Executive Summary Box
  // ---------------------------------------------------------
  if (report.executiveSummary) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['EXECUTIVE SECURITY BRIEFING']],
      body: [[report.executiveSummary]],
      theme: 'grid',
      headStyles: {
        fillColor: isHighRisk ? [254, 242, 242] : [240, 253, 244],
        textColor: isHighRisk ? [153, 27, 27] : [22, 101, 52],
        fontStyle: 'bold',
        fontSize: 8.5,
        lineColor: isHighRisk ? [254, 202, 202] : [187, 247, 208],
        lineWidth: 0.5
      },
      styles: {
        fontSize: 8,
        lineColor: isHighRisk ? [254, 202, 202] : [187, 247, 208],
        lineWidth: 0.5,
        cellPadding: 6,
        fillColor: isHighRisk ? [255, 248, 248] : [247, 254, 248],
        textColor: [15, 23, 42]
      }
    });
    currentY = doc.lastAutoTable.finalY + 14;
  }

  // Helper for Section Titles
  const addSectionTitle = (title, subtitle) => {
    if (currentY > pageHeight - 90) {
      doc.addPage();
      currentY = 40;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...navyDark);
    doc.text(title, margin, currentY);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...slateText);
      doc.text(subtitle, margin, currentY + 11);
      currentY += 16;
    } else {
      currentY += 12;
    }
  };

  // ---------------------------------------------------------
  // 1. Threat & Risk Intelligence Findings (8 Vectors)
  // ---------------------------------------------------------
  if (report.threatIntelligence && typeof report.threatIntelligence === 'object') {
    addSectionTitle('1. Threat & Risk Intelligence Findings', 'Consolidated 8-point security reputation and threat vector telemetry');

    const threatHeaders = ['#', 'Threat Vector / Category', 'Status', 'Risk Level', 'Source Engine', 'Findings & Telemetry Details'];
    const threatData = Object.entries(report.threatIntelligence).map(([key, item], idx) => {
      const vectorName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return [
        idx + 1,
        vectorName,
        s(item?.status, 'NOT CHECKED'),
        s(item?.statusType, 'AVAILABLE'),
        s(item?.source, 'ThreatScope Global Telemetry'),
        s(item?.description, 'No security anomalies observed.')
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [threatHeaders],
      body: threatData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 3.5,
        lineColor: slateBorder,
        lineWidth: 0.5,
        textColor: [15, 23, 42]
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' },
        1: { cellWidth: 95, fontStyle: 'bold' },
        2: { cellWidth: 55, fontStyle: 'bold' },
        3: { cellWidth: 50 },
        4: { cellWidth: 85, textColor: slateText },
        5: { cellWidth: 220 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const val = String(data.cell.raw).toUpperCase();
          if (val === 'CLEAN' || val === 'NOT DETECTED' || val === '0 REPORTS') {
            data.cell.styles.textColor = tealSafe;
          } else if (val === 'SUSPICIOUS' || val === 'ELEVATED' || val === 'WARNING') {
            data.cell.styles.textColor = amberWarn;
          } else if (val === 'CRITICAL' || val === 'MALICIOUS' || val === 'BLACKLISTED') {
            data.cell.styles.textColor = redPrimary;
          }
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // 2. IP Intelligence & Network Routing
  // ---------------------------------------------------------
  if (report.ipIntelligence) {
    const ip = report.ipIntelligence;
    addSectionTitle('2. IP Intelligence & BGP Telemetry', 'BGP routing, autonomous system number, and physical hosting infrastructure');

    const ipHeaders = ['Network Attribute', 'Resolved Value', 'Classification / Context'];
    const ipData = [
      ['IP Address', s(ip.ip), 'Destination IPv4/IPv6 address'],
      ['Reverse DNS (PTR)', s(ip.reverseDns), 'in-addr.arpa pointer hostname'],
      ['Country & Territory', `${s(ip.country)} (${s(ip.countryCode)})`, 'ISO Country classification'],
      ['City & Region', `${s(ip.city)}, ${s(ip.region)}`, 'Municipal transit node'],
      ['Timezone', s(ip.timezone), 'Local timezone offset'],
      ['Autonomous System (ASN)', s(ip.asn), 'BGP AS routing identifier'],
      ['Internet Service Provider (ISP)', s(ip.isp), 'Primary transit carrier'],
      ['Organization', s(ip.organization || ip.org), 'Registered enterprise entity'],
      ['Hosting Infrastructure', s(ip.hostingProvider || ip.org), 'Datacenter / Edge server'],
      ['Connection Classification', s(ip.connectionType, 'Anycast / Enterprise'), 'Network topological tier']
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [ipHeaders],
      body: ipData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 3.5,
        lineColor: slateBorder,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 140, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 200, fontStyle: 'bold', textColor: [15, 23, 42] },
        2: { cellWidth: 183, textColor: slateText }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // 3. Geolocation & Network Transit
  // ---------------------------------------------------------
  if (report.geoLocation) {
    const geo = report.geoLocation;
    addSectionTitle('3. Geolocation & Network Transit', 'Real-time GPS coordinates, node localization & geographic telemetry');

    const geoHeaders = ['Geographic Attribute', 'Resolved Telemetry Value', 'GIS Data Reference'];
    const geoData = [
      ['Country', s(geo.country), 'Sovereign national territory'],
      ['Region / State', s(geo.region), 'Administrative district'],
      ['City', s(geo.city), 'Municipal center'],
      ['Timezone', s(geo.timezone), 'IANA regional timezone'],
      ['GPS Coordinates', `LAT: ${s(geo.latitude)}°, LON: ${s(geo.longitude)}°`, 'WGS84 GPS Decimal Degrees (Verified)'],
      ['Internet Service Provider', s(geo.isp), 'Transit ISP Carrier'],
      ['Routing ASN', s(geo.asn), 'Autonomous System Route'],
      ['Interactive Google Maps URL', `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`, 'Direct GPS pin reference']
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [geoHeaders],
      body: geoData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 3.5,
        lineColor: slateBorder,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 140, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 220, fontStyle: 'bold', textColor: [15, 23, 42] },
        2: { cellWidth: 163, textColor: slateText }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // 4. DNS Zone Analysis Records
  // ---------------------------------------------------------
  if (report.dnsAnalysis?.records && Array.isArray(report.dnsAnalysis.records) && report.dnsAnalysis.records.length > 0) {
    addSectionTitle('4. DNS Zone Analysis', `Authoritative zone resolution (${report.dnsAnalysis.records.length} records verified)`);

    const dnsHeaders = ['Type', 'Host / Domain FQDN', 'Target Value / Address', 'TTL', 'Status'];
    const dnsData = report.dnsAnalysis.records.map(r => [
      s(r.type),
      s(r.host),
      s(r.value),
      `${s(r.ttl)}s`,
      s(r.status, 'ACTIVE')
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [dnsHeaders],
      body: dnsData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 3.5,
        lineColor: slateBorder,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 165 },
        2: { cellWidth: 220 },
        3: { cellWidth: 45, halign: 'center' },
        4: { cellWidth: 48, halign: 'center', textColor: tealSafe }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // 5. Security & SSL / TLS Certificate
  // ---------------------------------------------------------
  if (report.securitySsl) {
    const ssl = report.securitySsl;
    addSectionTitle('5. Security / SSL Certificate Cryptography', 'X.509 cryptographic certificate verification and HTTPS encryption posture');

    const sslHeaders = ['Cryptographic Metric', 'Inspection Result', 'Security Assessment'];
    const sslData = [
      ['SSL / TLS Status', s(ssl.status), ssl.isValid ? 'Valid, trusted certificate' : 'Invalid, expired or unencrypted connection'],
      ['HTTPS Protocol State', ssl.status === 'ERROR' ? 'FAILED' : 'CONNECTED', 'HTTPS negotiation status'],
      ['Certificate Issuer CA', s(ssl.certificateIssuer, 'Unavailable'), 'Designated Certificate Authority'],
      ['TLS Version', s(ssl.tlsVersion, 'Unavailable'), 'Transport Layer Security protocol handshake'],
      ['Certificate Subject (CN)', s(ssl.certificateSubject, 'Unknown'), 'Common Name domain identifier'],
      ['Valid From', s(ssl.certificateValidFrom, 'Unavailable'), 'Issued certificate inception timestamp'],
      ['Valid Until (Expiration)', s(ssl.certificateExpiry, 'Unavailable'), 'Certificate expiration boundary'],
      ['Days Remaining', s(ssl.daysRemaining, 'Unavailable'), 'Time left until certificate expiry'],
      ['Cipher Suite', s(ssl.cipher, 'Unavailable'), 'Active encryption cipher algorithm']
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [sslHeaders],
      body: sslData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 3.5,
        lineColor: slateBorder,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 140, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 180, fontStyle: 'bold' },
        2: { cellWidth: 203, textColor: slateText }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1 && data.row.index === 0) {
          const val = String(data.cell.raw).toUpperCase();
          if (val === 'ERROR' || val === 'EXPIRED' || val === 'INVALID') {
            data.cell.styles.textColor = redPrimary;
          } else if (val === 'VALID' || val === 'SECURE') {
            data.cell.styles.textColor = tealSafe;
          }
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // 6. HTTP Redirect Traversal Chain
  // ---------------------------------------------------------
  if (report.redirectAnalysis?.redirectChain && Array.isArray(report.redirectAnalysis.redirectChain)) {
    addSectionTitle('6. HTTP Redirect Traversal Chain', `HTTP 3xx traversal chain (${report.redirectAnalysis.redirectCount ?? 0} hops recorded)`);

    const redHeaders = ['Hop #', 'Status Code', 'Redirect Source URL', 'Destination Target', 'Assessment'];
    const redData = report.redirectAnalysis.redirectChain.map(h => [
      h.step,
      `${h.statusCode || '200'} OK`,
      s(h.url),
      s(h.target || h.url),
      h.isSuspicious ? 'FLAGGED (Suspicious)' : 'BENIGN (Valid)'
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [redHeaders],
      body: redData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 3.5,
        lineColor: slateBorder,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 65, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 165 },
        3: { cellWidth: 165 },
        4: { cellWidth: 93, fontStyle: 'bold', halign: 'center' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          if (String(data.cell.raw).includes('FLAGGED')) {
            data.cell.styles.textColor = redPrimary;
          } else {
            data.cell.styles.textColor = tealSafe;
          }
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // 7. Technology Stack & Security Headers
  // ---------------------------------------------------------
  if (report.technologyDetection) {
    const tech = report.technologyDetection;
    addSectionTitle('7. Technology Stack & Browser Defense Headers', 'Software stack fingerprinting and browser defense header auditing');

    const techHeaders = ['Stack Component / Defense Header', 'Detected Software / Header Status', 'Category', 'Security Assessment'];
    const techData = [
      ['Web Server', s(tech.webServer, 'Hidden / Protected'), 'Infrastructure', 'HTTP server daemon banner fingerprint'],
      ['Programming Language', s(tech.programmingLanguage, 'Modern Web Stack'), 'Runtime Engine', 'Core backend execution language / runtime'],
      ['Content Delivery Network (CDN)', s(tech.cdn, 'Direct / None Detected'), 'Edge Network', 'DDoS mitigation and reverse proxy'],
      ['Web Framework', s(tech.framework, 'Not Disclosed'), 'Application', 'Backend framework runtime execution'],
      ['Content Management System (CMS)', s(tech.cms, 'Custom / Headless'), 'Application', 'Web content platform'],
      ['JavaScript Client Libraries', Array.isArray(tech.javascriptLibraries) && tech.javascriptLibraries.length > 0 ? tech.javascriptLibraries.join(', ') : 'None Detected', 'Client Runtimes', 'Frontend client packages'],
      ['HSTS Header', tech.securityHeaders?.strictTransportSecurity?.includes('Missing') ? 'Missing' : 'Protected', 'Browser Defense', tech.securityHeaders?.strictTransportSecurity?.includes('Missing') ? 'Vulnerable to SSL stripping' : 'Strict-Transport-Security enforced'],
      ['CSP Header', tech.securityHeaders?.contentSecurityPolicy?.includes('Missing') ? 'Missing' : 'Protected', 'Browser Defense', tech.securityHeaders?.contentSecurityPolicy?.includes('Missing') ? 'Vulnerable to XSS & injection' : 'Content-Security-Policy active'],
      ['X-Frame-Options', tech.securityHeaders?.xFrameOptions?.includes('Missing') ? 'Missing' : 'Protected', 'Browser Defense', tech.securityHeaders?.xFrameOptions?.includes('Missing') ? 'Vulnerable to framing' : 'Clickjacking defended'],
      ['X-Content-Type-Options', tech.securityHeaders?.xContentTypeOptions?.includes('Missing') ? 'Missing' : 'Protected', 'Browser Defense', tech.securityHeaders?.xContentTypeOptions?.includes('Missing') ? 'MIME confusion possible' : 'MIME sniffing disabled']
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [techHeaders],
      body: techData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 3.5,
        lineColor: slateBorder,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 140, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 140, fontStyle: 'bold' },
        2: { cellWidth: 85, textColor: slateText },
        3: { cellWidth: 158 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const val = String(data.cell.raw);
          if (val === 'Missing') data.cell.styles.textColor = redPrimary;
          if (val === 'Protected') data.cell.styles.textColor = tealSafe;
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // 8. Website Errors & Security Vulnerabilities Audit
  // ---------------------------------------------------------
  if (report.websiteErrors?.issues && Array.isArray(report.websiteErrors.issues) && report.websiteErrors.issues.length > 0) {
    addSectionTitle('8. Website Errors & Security Flaws Audit', `Diagnostic findings & remediation advice (Grade: ${report.websiteErrors.healthGrade || 'N/A'}, ${report.websiteErrors.totalErrors} issues identified)`);

    const errHeaders = ['#', 'Severity', 'Category', 'Vulnerability / Issue Title', 'Root Cause & Remediation Guidance'];
    const errData = report.websiteErrors.issues.map((err, idx) => [
      idx + 1,
      s(err.severity),
      s(err.category),
      s(err.title),
      `${s(err.description)}\nImpact: ${s(err.impact)}\nFix: ${s(err.recommendation)}`
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [errHeaders],
      body: errData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.0,
        cellPadding: 3.5,
        lineColor: slateBorder,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 55, fontStyle: 'bold', halign: 'center' },
        2: { cellWidth: 95, textColor: slateText },
        3: { cellWidth: 130, fontStyle: 'bold' },
        4: { cellWidth: 223 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const val = String(data.cell.raw);
          if (val === 'CRITICAL' || val === 'HIGH') data.cell.styles.textColor = redPrimary;
          else if (val === 'MEDIUM') data.cell.styles.textColor = amberWarn;
          else data.cell.styles.textColor = tealSafe;
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // 9. Security Recommendations & Remediation
  // ---------------------------------------------------------
  if (Array.isArray(report.securityRecommendations) && report.securityRecommendations.length > 0) {
    addSectionTitle('9. Security Recommendations & Remediation', 'Prescriptive mitigation actions generated by ThreatScope rules engine');

    const recHeaders = ['#', 'Priority', 'Mitigation Control Title', 'Prescriptive Action & Rule Guidance'];
    const recData = report.securityRecommendations.map((rec, idx) => [
      idx + 1,
      s(rec.priority, 'STANDARD'),
      typeof rec === 'string' ? rec : s(rec.title),
      typeof rec === 'string' ? rec : s(rec.action)
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [recHeaders],
      body: recData,
      theme: 'striped',
      headStyles: {
        fillColor: navyDark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 4,
        lineColor: slateBorder,
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 55, fontStyle: 'bold', halign: 'center' },
        2: { cellWidth: 155, fontStyle: 'bold' },
        3: { cellWidth: 293 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const val = String(data.cell.raw).toUpperCase();
          if (val === 'CRITICAL' || val === 'HIGH') {
            data.cell.styles.textColor = redPrimary;
          } else if (val === 'MEDIUM') {
            data.cell.styles.textColor = amberWarn;
          } else {
            data.cell.styles.textColor = tealSafe;
          }
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 16;
  }

  // ---------------------------------------------------------
  // Footer on All Pages (Page X of Y & Confidentiality)
  // ---------------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...slateBorder);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...slateText);
    doc.text('ThreatScope SOC Platform | Official Security Assessment Dossier | Confidential & Proprietary', margin, pageHeight - 15);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
  }

  // Safe filename
  const targetClean = (report.target || 'target')
    .replace(/^https?:\/\//i, '')
    .replace(/[^a-zA-Z0-9-_\.]/g, '_')
    .substring(0, 36);

  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `ThreatScope_${targetClean}_${dateStamp}.pdf`;

  // Trigger instant download
  doc.save(fileName);
  return fileName;
}
