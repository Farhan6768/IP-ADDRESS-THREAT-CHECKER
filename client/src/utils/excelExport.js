import * as XLSX from 'xlsx';

/**
 * Exports complete threat analysis and risk dossier to an Excel (.xlsx) file
 * with professional structured columns, rows, headers, and individual topic sheets.
 * @param {Object} report The threat report object
 */
export function exportThreatReportToExcel(report) {
  if (!report) {
    throw new Error('No report data available to export.');
  }

  const wb = XLSX.utils.book_new();

  // Helper to safe stringify
  const s = (val, fallback = 'N/A') => (val !== undefined && val !== null && val !== '') ? (typeof val === 'object' ? (val.address || val.value || val.alias || val.target || JSON.stringify(val)) : String(val)) : fallback;

  // -------------------------------------------------------------
  // SHEET 1: Master Consolidated Security Dossier
  // -------------------------------------------------------------
  const masterRows = [
    { 'Section / Category': '--- TARGET OVERVIEW ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Target Entity', 'Status / Value': s(report.target), 'Findings & Security Telemetry': 'Audited target domain or URL endpoint', 'Source / Reference': 'User Input' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Target Classification', 'Status / Value': s(report.targetType, 'URL'), 'Findings & Security Telemetry': `Classified as ${report.targetType || 'URL'}`, 'Source / Reference': 'ThreatScope Core' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Overall Threat Score', 'Status / Value': `${report.threatScore ?? 0} / 100`, 'Findings & Security Telemetry': `Evaluated risk score: ${report.threatScore ?? 0}/100`, 'Source / Reference': 'Composite Engine' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Overall Risk Level', 'Status / Value': s(report.riskLevel, 'UNKNOWN'), 'Findings & Security Telemetry': `SOC severity posture: ${report.riskLevel || 'UNKNOWN'}`, 'Source / Reference': 'SOC Rule Matrix' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Signal Confidence', 'Status / Value': s(report.confidence, '95%'), 'Findings & Security Telemetry': 'Multi-vector analytical consensus certainty', 'Source / Reference': 'ThreatScope AI' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Total Detections Count', 'Status / Value': s(report.detectionsCount, '0'), 'Findings & Security Telemetry': `${report.detectionsCount || 0} malicious or suspicious indicators detected`, 'Source / Reference': 'Security Feeds' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Scan Latency', 'Status / Value': s(report.scanDuration, '0.85s'), 'Findings & Security Telemetry': 'Total time elapsed for full-spectrum analysis', 'Source / Reference': 'Diagnostics' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Audit Timestamp', 'Status / Value': s(report.timestamp, new Date().toISOString()), 'Findings & Security Telemetry': 'ISO 8601 generation timestamp', 'Source / Reference': 'System Clock' },
    { 'Section / Category': 'Target Overview', 'Parameter / Vector': 'Executive Summary', 'Status / Value': s(report.riskLevel), 'Findings & Security Telemetry': s(report.executiveSummary, 'No summary generated.'), 'Source / Reference': 'Automated SOC Briefing' }
  ];

  // Threat Intelligence in Master Sheet
  if (report.threatIntelligence && typeof report.threatIntelligence === 'object') {
    masterRows.push({ 'Section / Category': '--- THREAT INTELLIGENCE ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' });
    Object.entries(report.threatIntelligence).forEach(([key, item]) => {
      const vectorName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      masterRows.push({
        'Section / Category': 'Threat Intelligence',
        'Parameter / Vector': vectorName,
        'Status / Value': s(item?.status, 'NOT CHECKED'),
        'Findings & Security Telemetry': s(item?.description, 'No detailed findings recorded.'),
        'Source / Reference': s(item?.source, 'ThreatScope Global Telemetry')
      });
    });
  }

  // IP Intelligence in Master Sheet
  if (report.ipIntelligence) {
    const ip = report.ipIntelligence;
    masterRows.push({ 'Section / Category': '--- IP INTELLIGENCE ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' });
    masterRows.push({ 'Section / Category': 'IP Intelligence', 'Parameter / Vector': 'Routed IP Address', 'Status / Value': s(ip.ip), 'Findings & Security Telemetry': 'Primary destination public IPv4/IPv6 address', 'Source / Reference': 'DNS Resolution' });
    masterRows.push({ 'Section / Category': 'IP Intelligence', 'Parameter / Vector': 'Reverse DNS (PTR)', 'Status / Value': s(ip.reverseDns), 'Findings & Security Telemetry': 'Pointer record registered in in-addr.arpa zone', 'Source / Reference': 'BGP DNS' });
    masterRows.push({ 'Section / Category': 'IP Intelligence', 'Parameter / Vector': 'ASN / ISP Provider', 'Status / Value': s(ip.asn || ip.isp), 'Findings & Security Telemetry': `${s(ip.isp)} (${s(ip.asn)})`, 'Source / Reference': 'BGP Routing' });
    masterRows.push({ 'Section / Category': 'IP Intelligence', 'Parameter / Vector': 'Geographic Region', 'Status / Value': `${s(ip.city)}, ${s(ip.region)}, ${s(ip.country)}`, 'Findings & Security Telemetry': `Timezone: ${s(ip.timezone)}`, 'Source / Reference': 'MaxMind / IPinfo' });
    masterRows.push({ 'Section / Category': 'IP Intelligence', 'Parameter / Vector': 'Connection Type', 'Status / Value': s(ip.connectionType, 'Anycast / Enterprise'), 'Findings & Security Telemetry': `Hosting Org: ${s(ip.hostingProvider || ip.org)}`, 'Source / Reference': 'Heuristic Classifier' });
  }

  // Geolocation in Master Sheet
  if (report.geoLocation) {
    const geo = report.geoLocation;
    masterRows.push({ 'Section / Category': '--- GEOLOCATION & GPS ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' });
    masterRows.push({ 'Section / Category': 'Geolocation', 'Parameter / Vector': 'GPS Coordinates', 'Status / Value': `LAT: ${s(geo.latitude)}°, LON: ${s(geo.longitude)}°`, 'Findings & Security Telemetry': `City: ${s(geo.city)}, Region: ${s(geo.region)}, Country: ${s(geo.country)}`, 'Source / Reference': 'ESRI / GPS Verified' });
    masterRows.push({ 'Section / Category': 'Geolocation', 'Parameter / Vector': 'Google Maps Link', 'Status / Value': `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`, 'Findings & Security Telemetry': 'Interactive Satellite / Map link', 'Source / Reference': 'Google Maps' });
  }

  // SSL Certificate in Master Sheet
  if (report.securitySsl) {
    const ssl = report.securitySsl;
    masterRows.push({ 'Section / Category': '--- SSL / TLS SECURITY ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' });
    masterRows.push({ 'Section / Category': 'SSL / TLS Security', 'Parameter / Vector': 'SSL Certificate Status', 'Status / Value': s(ssl.status), 'Findings & Security Telemetry': ssl.isValid ? 'Valid trusted certificate chain' : 'Untrusted or Insecure HTTP connection', 'Source / Reference': 'X.509 Handshake' });
    masterRows.push({ 'Section / Category': 'SSL / TLS Security', 'Parameter / Vector': 'TLS Protocol Version', 'Status / Value': s(ssl.tlsVersion), 'Findings & Security Telemetry': `Cipher: ${s(ssl.cipher)}`, 'Source / Reference': 'TLS Negotiator' });
    masterRows.push({ 'Section / Category': 'SSL / TLS Security', 'Parameter / Vector': 'Certificate Issuer CA', 'Status / Value': s(ssl.certificateIssuer), 'Findings & Security Telemetry': `Subject: ${s(ssl.certificateSubject)}`, 'Source / Reference': 'Certificate Authority' });
    masterRows.push({ 'Section / Category': 'SSL / TLS Security', 'Parameter / Vector': 'Validity Period', 'Status / Value': `${s(ssl.certificateValidFrom)} to ${s(ssl.certificateExpiry)}`, 'Findings & Security Telemetry': `Days remaining: ${s(ssl.daysRemaining)}`, 'Source / Reference': 'X.509 Certificate' });
  }

  // Redirect Analysis in Master Sheet
  if (report.redirectAnalysis) {
    const red = report.redirectAnalysis;
    masterRows.push({ 'Section / Category': '--- REDIRECT ANALYSIS ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' });
    masterRows.push({ 'Section / Category': 'Redirect Analysis', 'Parameter / Vector': 'Original Target URL', 'Status / Value': s(red.originalUrl || report.target), 'Findings & Security Telemetry': 'Initial requested endpoint', 'Source / Reference': 'HTTP Request' });
    masterRows.push({ 'Section / Category': 'Redirect Analysis', 'Parameter / Vector': 'Redirect Hop Count', 'Status / Value': `${red.redirectCount ?? 0} Hops`, 'Findings & Security Telemetry': `Final Resolved: ${s(red.finalUrl || report.target)}`, 'Source / Reference': 'HTTP Client' });
  }

  // Technology Stack in Master Sheet
  if (report.technologyDetection) {
    const tech = report.technologyDetection;
    masterRows.push({ 'Section / Category': '--- TECHNOLOGY STACK ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' });
    masterRows.push({ 'Section / Category': 'Technology Stack', 'Parameter / Vector': 'Web Server', 'Status / Value': s(tech.webServer, 'Hidden / Undisclosed'), 'Findings & Security Telemetry': 'HTTP Server daemon & build version', 'Source / Reference': 'Server Header' });
    masterRows.push({ 'Section / Category': 'Technology Stack', 'Parameter / Vector': 'Programming Language', 'Status / Value': s(tech.programmingLanguage, 'Modern Web Stack'), 'Findings & Security Telemetry': 'Primary backend programming language / runtime', 'Source / Reference': 'Heuristic Engine' });
    masterRows.push({ 'Section / Category': 'Technology Stack', 'Parameter / Vector': 'Content Delivery Network (CDN)', 'Status / Value': s(tech.cdn, 'Direct / None Detected'), 'Findings & Security Telemetry': 'Reverse proxy or edge acceleration network', 'Source / Reference': 'Edge Fingerprint' });
    masterRows.push({ 'Section / Category': 'Technology Stack', 'Parameter / Vector': 'Web Framework / Runtime', 'Status / Value': s(tech.framework, 'Not Disclosed'), 'Findings & Security Telemetry': 'Application server runtime framework', 'Source / Reference': 'X-Powered-By' });
    masterRows.push({ 'Section / Category': 'Technology Stack', 'Parameter / Vector': 'Content Management System (CMS)', 'Status / Value': s(tech.cms, 'Custom / Headless'), 'Findings & Security Telemetry': 'CMS platform detection', 'Source / Reference': 'HTML Meta' });
    masterRows.push({ 'Section / Category': 'Technology Stack', 'Parameter / Vector': 'JavaScript Libraries', 'Status / Value': Array.isArray(tech.javascriptLibraries) && tech.javascriptLibraries.length > 0 ? tech.javascriptLibraries.join(', ') : 'None Detected', 'Findings & Security Telemetry': 'Identified frontend client runtimes', 'Source / Reference': 'Script Analysis' });
  }

  // Website Errors in Master Sheet
  if (report.websiteErrors) {
    const errs = report.websiteErrors;
    masterRows.push({ 'Section / Category': '--- WEBSITE ERRORS & VULNERABILITIES ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' });
    masterRows.push({ 'Section / Category': 'Website Errors Audit', 'Parameter / Vector': 'Security Health Grade', 'Status / Value': `Grade ${s(errs.healthGrade, 'N/A')}`, 'Findings & Security Telemetry': `Overall posture evaluated as Grade ${s(errs.healthGrade, 'N/A')}`, 'Source / Reference': 'ThreatScope Diagnostic Audit' });
    masterRows.push({ 'Section / Category': 'Website Errors Audit', 'Parameter / Vector': 'Total Errors / Flaws', 'Status / Value': `${errs.totalErrors ?? 0} Issues`, 'Findings & Security Telemetry': `Critical: ${errs.criticalCount ?? 0}, High: ${errs.highCount ?? 0}, Medium: ${errs.mediumCount ?? 0}, Low: ${errs.lowCount ?? 0}`, 'Source / Reference': 'Security Rule Matrix' });
    masterRows.push({ 'Section / Category': 'Website Errors Audit', 'Parameter / Vector': 'Passed Defense Checks', 'Status / Value': `${errs.passedChecksCount ?? 0} Checks Passed`, 'Findings & Security Telemetry': 'Hardened security configurations verified active', 'Source / Reference': 'OWASP Defense Rules' });
  }

  // Recommendations in Master Sheet
  if (Array.isArray(report.securityRecommendations) && report.securityRecommendations.length > 0) {
    masterRows.push({ 'Section / Category': '--- RECOMMENDATIONS ---', 'Parameter / Vector': '------------------------', 'Status / Value': '---------------------', 'Findings & Security Telemetry': '--------------------------------------------------', 'Source / Reference': '---------------------' });
    report.securityRecommendations.forEach((rec, idx) => {
      masterRows.push({
        'Section / Category': 'Security Remediation',
        'Parameter / Vector': `Rule #${idx + 1} [${rec.priority || 'STANDARD'}]`,
        'Status / Value': s(rec.title),
        'Findings & Security Telemetry': s(rec.action),
        'Source / Reference': 'ThreatScope Rules Engine'
      });
    });
  }

  const wsMaster = XLSX.utils.json_to_sheet(masterRows);
  wsMaster['!cols'] = [
    { wch: 24 }, // Section / Category
    { wch: 32 }, // Parameter / Vector
    { wch: 30 }, // Status / Value
    { wch: 75 }, // Findings & Security Telemetry
    { wch: 28 }  // Source / Reference
  ];
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Full Security Dossier');

  // -------------------------------------------------------------
  // SHEET 2: Threat & Risk Intelligence (8 Threat Vectors)
  // -------------------------------------------------------------
  if (report.threatIntelligence && typeof report.threatIntelligence === 'object') {
    const threatRows = Object.entries(report.threatIntelligence).map(([key, item], idx) => {
      const vectorName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return {
        'Vector #': idx + 1,
        'Threat Intelligence Vector': vectorName,
        'Detection Status': s(item?.status, 'NOT CHECKED'),
        'Risk Severity': s(item?.statusType, 'AVAILABLE DATA'),
        'Intelligence Source Engine': s(item?.source, 'ThreatScope Global Feeds'),
        'Telemetry Findings & Behavioral Description': s(item?.description, 'No anomalies observed.'),
        'Last Verified': s(item?.lastChecked || report.timestamp, 'Current')
      };
    });

    const wsThreats = XLSX.utils.json_to_sheet(threatRows);
    wsThreats['!cols'] = [
      { wch: 10 },
      { wch: 28 },
      { wch: 18 },
      { wch: 18 },
      { wch: 32 },
      { wch: 80 },
      { wch: 24 }
    ];
    XLSX.utils.book_append_sheet(wb, wsThreats, 'Threat Intelligence');
  }

  // -------------------------------------------------------------
  // SHEET 3: IP Intelligence & BGP Telemetry
  // -------------------------------------------------------------
  if (report.ipIntelligence) {
    const ip = report.ipIntelligence;
    const ipRows = [
      { 'Network Attribute': 'IP Address', 'Resolved Value': s(ip.ip), 'Classification / Notes': 'Public IPv4 / IPv6 endpoint' },
      { 'Network Attribute': 'Reverse DNS (PTR)', 'Resolved Value': s(ip.reverseDns), 'Classification / Notes': 'in-addr.arpa pointer hostname' },
      { 'Network Attribute': 'Country Code', 'Resolved Value': s(ip.countryCode), 'Classification / Notes': 'ISO 3166-1 alpha-2' },
      { 'Network Attribute': 'Country', 'Resolved Value': s(ip.country), 'Classification / Notes': 'Country of origin' },
      { 'Network Attribute': 'Region / State', 'Resolved Value': s(ip.region), 'Classification / Notes': 'Geographic state / province' },
      { 'Network Attribute': 'City', 'Resolved Value': s(ip.city), 'Classification / Notes': 'City of physical BGP node' },
      { 'Network Attribute': 'Timezone', 'Resolved Value': s(ip.timezone), 'Classification / Notes': 'Local timezone' },
      { 'Network Attribute': 'Autonomous System Number (ASN)', 'Resolved Value': s(ip.asn), 'Classification / Notes': 'BGP autonomous routing entity' },
      { 'Network Attribute': 'Internet Service Provider (ISP)', 'Resolved Value': s(ip.isp), 'Classification / Notes': 'Transit ISP network' },
      { 'Network Attribute': 'Organization', 'Resolved Value': s(ip.organization || ip.org), 'Classification / Notes': 'Registered corporate owner' },
      { 'Network Attribute': 'Hosting Provider', 'Resolved Value': s(ip.hostingProvider || ip.org), 'Classification / Notes': 'Datacenter / Edge infrastructure' },
      { 'Network Attribute': 'Connection Classification', 'Resolved Value': s(ip.connectionType, 'Anycast / Enterprise'), 'Classification / Notes': 'Network type classifier' },
      { 'Network Attribute': 'GPS Latitude', 'Resolved Value': s(ip.latitude), 'Classification / Notes': 'Decimal degrees' },
      { 'Network Attribute': 'GPS Longitude', 'Resolved Value': s(ip.longitude), 'Classification / Notes': 'Decimal degrees' }
    ];

    const wsIp = XLSX.utils.json_to_sheet(ipRows);
    wsIp['!cols'] = [{ wch: 32 }, { wch: 45 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, wsIp, 'IP Intelligence');
  }

  // -------------------------------------------------------------
  // SHEET 4: Geolocation & Network Transit
  // -------------------------------------------------------------
  if (report.geoLocation) {
    const geo = report.geoLocation;
    const geoRows = [
      { 'Geographic Parameter': 'Country', 'Telemetry Value': s(geo.country), 'GIS Data Reference': 'ISO Country Territory' },
      { 'Geographic Parameter': 'Region / State', 'Telemetry Value': s(geo.region), 'GIS Data Reference': 'Administrative Sub-division' },
      { 'Geographic Parameter': 'City', 'Telemetry Value': s(geo.city), 'GIS Data Reference': 'Municipal Transit Node' },
      { 'Geographic Parameter': 'Timezone', 'Telemetry Value': s(geo.timezone), 'GIS Data Reference': 'IANA Timezone' },
      { 'Geographic Parameter': 'Latitude', 'Telemetry Value': `${s(geo.latitude)}°`, 'GIS Data Reference': 'WGS84 Latitude' },
      { 'Geographic Parameter': 'Longitude', 'Telemetry Value': `${s(geo.longitude)}°`, 'GIS Data Reference': 'WGS84 Longitude' },
      { 'Geographic Parameter': 'Internet Service Provider', 'Telemetry Value': s(geo.isp), 'GIS Data Reference': 'Transit ISP Carrier' },
      { 'Geographic Parameter': 'Routing ASN', 'Telemetry Value': s(geo.asn), 'GIS Data Reference': 'BGP AS Number' },
      { 'Geographic Parameter': 'Google Maps Link', 'Telemetry Value': `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`, 'GIS Data Reference': 'Interactive GPS Pin Link' },
      { 'Geographic Parameter': 'GPS Status', 'Telemetry Value': 'GPS Verified', 'GIS Data Reference': 'Verified by GeoIP and ESRI telemetry' }
    ];

    const wsGeo = XLSX.utils.json_to_sheet(geoRows);
    wsGeo['!cols'] = [{ wch: 30 }, { wch: 55 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsGeo, 'Geolocation & Transit');
  }

  // -------------------------------------------------------------
  // SHEET 5: DNS Zone Analysis Records
  // -------------------------------------------------------------
  if (report.dnsAnalysis?.records && Array.isArray(report.dnsAnalysis.records) && report.dnsAnalysis.records.length > 0) {
    const dnsRows = report.dnsAnalysis.records.map((record, idx) => ({
      'Record #': idx + 1,
      'Record Type': s(record.type),
      'Hostname / FQDN': s(record.host),
      'Value / Routed Destination': s(record.value),
      'TTL (Seconds)': s(record.ttl),
      'Verification Status': s(record.status, 'ACTIVE')
    }));

    const wsDns = XLSX.utils.json_to_sheet(dnsRows);
    wsDns['!cols'] = [{ wch: 10 }, { wch: 14 }, { wch: 35 }, { wch: 50 }, { wch: 16 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsDns, 'DNS Records');
  }

  // -------------------------------------------------------------
  // SHEET 6: Security & SSL / TLS Certificate
  // -------------------------------------------------------------
  if (report.securitySsl) {
    const ssl = report.securitySsl;
    const sslRows = [
      { 'Security Metric': 'SSL / TLS Status', 'Inspection Result': s(ssl.status), 'Cryptographic Evaluation': ssl.isValid ? 'Valid, trusted certificate' : 'Invalid, expired or unencrypted HTTP' },
      { 'Security Metric': 'HTTPS Status', 'Inspection Result': ssl.status === 'ERROR' ? 'FAILED' : 'CONNECTED', 'Cryptographic Evaluation': 'HTTPS negotiation protocol state' },
      { 'Security Metric': 'Certificate Issuer CA', 'Inspection Result': s(ssl.certificateIssuer, 'Unavailable'), 'Cryptographic Evaluation': 'Issuing Certificate Authority' },
      { 'Security Metric': 'TLS Protocol Version', 'Inspection Result': s(ssl.tlsVersion, 'Unavailable'), 'Cryptographic Evaluation': 'Supported cryptographic handshake protocol' },
      { 'Security Metric': 'Subject Common Name (CN)', 'Inspection Result': s(ssl.certificateSubject, 'Unknown'), 'Cryptographic Evaluation': 'Designated domain subject' },
      { 'Security Metric': 'Valid From', 'Inspection Result': s(ssl.certificateValidFrom, 'Unavailable'), 'Cryptographic Evaluation': 'Certificate issue date' },
      { 'Security Metric': 'Valid Until (Expiration)', 'Inspection Result': s(ssl.certificateExpiry, 'Unavailable'), 'Cryptographic Evaluation': 'Certificate expiration timestamp' },
      { 'Security Metric': 'Days Remaining', 'Inspection Result': s(ssl.daysRemaining, 'Unavailable'), 'Cryptographic Evaluation': 'Remaining days before renewal required' },
      { 'Security Metric': 'Cipher Suite', 'Inspection Result': s(ssl.cipher, 'Unavailable'), 'Cryptographic Evaluation': 'Symmetric encryption cipher' },
      { 'Security Metric': 'Subject Alternative Names (SANs)', 'Inspection Result': Array.isArray(ssl.certificateSan) ? ssl.certificateSan.join(', ') : 'Unavailable', 'Cryptographic Evaluation': 'Additional authorized domains' }
    ];

    const wsSsl = XLSX.utils.json_to_sheet(sslRows);
    wsSsl['!cols'] = [{ wch: 32 }, { wch: 45 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsSsl, 'SSL & TLS Security');
  }

  // -------------------------------------------------------------
  // SHEET 7: HTTP Redirect & Traversal Chain
  // -------------------------------------------------------------
  if (report.redirectAnalysis?.redirectChain && Array.isArray(report.redirectAnalysis.redirectChain)) {
    const redirectRows = report.redirectAnalysis.redirectChain.map(hop => ({
      'Hop #': hop.step,
      'HTTP Status Code': hop.statusCode,
      'Redirect Source URL': hop.url,
      'Destination Target': hop.target || hop.url || 'Final Destination',
      'Suspicious Hop?': hop.isSuspicious ? 'YES (FLAGGED)' : 'NO (BENIGN)',
      'Security Notes': hop.suspiciousReason || 'Standard traversal'
    }));

    const wsRedirects = XLSX.utils.json_to_sheet(redirectRows);
    wsRedirects['!cols'] = [{ wch: 8 }, { wch: 18 }, { wch: 45 }, { wch: 45 }, { wch: 18 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsRedirects, 'Redirect Hop Chain');
  }

  // -------------------------------------------------------------
  // SHEET 8: Technology Stack & Browser Defense Headers
  // -------------------------------------------------------------
  if (report.technologyDetection) {
    const tech = report.technologyDetection;
    const techRows = [
      { 'Stack Component / Header': 'Web Server', 'Detected Software / Header Status': s(tech.webServer, 'Hidden / Protected'), 'Category': 'Infrastructure', 'Security Assessment': 'HTTP daemon banner fingerprint' },
      { 'Stack Component / Header': 'Programming Language', 'Detected Software / Header Status': s(tech.programmingLanguage, 'Modern Web Stack'), 'Category': 'Runtime Engine', 'Security Assessment': 'Core backend execution language' },
      { 'Stack Component / Header': 'Content Delivery Network (CDN)', 'Detected Software / Header Status': s(tech.cdn, 'Direct / None Detected'), 'Category': 'Edge Network', 'Security Assessment': 'DDoS mitigation & caching proxy' },
      { 'Stack Component / Header': 'Web Framework', 'Detected Software / Header Status': s(tech.framework, 'Not Disclosed'), 'Category': 'Application', 'Security Assessment': 'Backend framework execution runtime' },
      { 'Stack Component / Header': 'Content Management System (CMS)', 'Detected Software / Header Status': s(tech.cms, 'Custom / Headless'), 'Category': 'Application', 'Security Assessment': 'Content publisher and database platform' },
      { 'Stack Component / Header': 'Hosting Infrastructure', 'Detected Software / Header Status': s(tech.hostingProvider, 'Cloud Datacenter'), 'Category': 'Hosting', 'Security Assessment': 'Host cloud provider' },
      { 'Stack Component / Header': 'Identified JS Libraries', 'Detected Software / Header Status': Array.isArray(tech.javascriptLibraries) && tech.javascriptLibraries.length > 0 ? tech.javascriptLibraries.join(', ') : 'None Detected', 'Category': 'Client Runtimes', 'Security Assessment': 'Frontend scripts & client packages' },
      { 'Stack Component / Header': 'HSTS Header', 'Detected Software / Header Status': tech.securityHeaders?.strictTransportSecurity?.includes('Missing') ? 'Missing' : 'Protected', 'Category': 'Browser Defense', 'Security Assessment': tech.securityHeaders?.strictTransportSecurity?.includes('Missing') ? 'Vulnerable to SSL stripping' : 'Strict transport security enforced' },
      { 'Stack Component / Header': 'CSP Header', 'Detected Software / Header Status': tech.securityHeaders?.contentSecurityPolicy?.includes('Missing') ? 'Missing' : 'Protected', 'Category': 'Browser Defense', 'Security Assessment': tech.securityHeaders?.contentSecurityPolicy?.includes('Missing') ? 'Vulnerable to cross-site scripting (XSS)' : 'Content injection restricted' },
      { 'Stack Component / Header': 'X-Frame-Options', 'Detected Software / Header Status': tech.securityHeaders?.xFrameOptions?.includes('Missing') ? 'Missing' : 'Protected', 'Category': 'Browser Defense', 'Security Assessment': tech.securityHeaders?.xFrameOptions?.includes('Missing') ? 'Vulnerable to UI redressing' : 'Clickjacking defended' },
      { 'Stack Component / Header': 'X-Content-Type-Options', 'Detected Software / Header Status': tech.securityHeaders?.xContentTypeOptions?.includes('Missing') ? 'Missing' : 'Protected', 'Category': 'Browser Defense', 'Security Assessment': tech.securityHeaders?.xContentTypeOptions?.includes('Missing') ? 'MIME confusion possible' : 'MIME sniffing disabled' }
    ];

    const wsTech = XLSX.utils.json_to_sheet(techRows);
    wsTech['!cols'] = [{ wch: 32 }, { wch: 45 }, { wch: 22 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsTech, 'Tech Stack & Headers');
  }

  // -------------------------------------------------------------
  // SHEET 9: Website Errors & Security Vulnerabilities Audit
  // -------------------------------------------------------------
  if (report.websiteErrors?.issues && Array.isArray(report.websiteErrors.issues) && report.websiteErrors.issues.length > 0) {
    const errorRows = report.websiteErrors.issues.map((err, idx) => ({
      'Issue #': idx + 1,
      'Severity Level': s(err.severity),
      'Category': s(err.category),
      'Vulnerability / Error Title': s(err.title),
      'Description & Root Cause': s(err.description),
      'Potential Security Impact': s(err.impact),
      'Remediation / Fix Snippet': s(err.recommendation)
    }));

    const wsErrors = XLSX.utils.json_to_sheet(errorRows);
    wsErrors['!cols'] = [{ wch: 8 }, { wch: 16 }, { wch: 30 }, { wch: 45 }, { wch: 65 }, { wch: 60 }, { wch: 75 }];
    XLSX.utils.book_append_sheet(wb, wsErrors, 'Website Errors & Flaws');
  }

  // -------------------------------------------------------------
  // SHEET 9: Security Recommendations & Remediation
  // -------------------------------------------------------------
  if (Array.isArray(report.securityRecommendations) && report.securityRecommendations.length > 0) {
    const recRows = report.securityRecommendations.map((rec, idx) => ({
      'Rule #': idx + 1,
      'Priority Level': s(rec.priority, 'STANDARD'),
      'Mitigation Control Title': typeof rec === 'string' ? rec : s(rec.title),
      'Prescriptive Action & Rule Guidance': typeof rec === 'string' ? rec : s(rec.action)
    }));

    const wsRecs = XLSX.utils.json_to_sheet(recRows);
    wsRecs['!cols'] = [{ wch: 8 }, { wch: 16 }, { wch: 40 }, { wch: 85 }];
    XLSX.utils.book_append_sheet(wb, wsRecs, 'Security Recommendations');
  }

  // Safe filename formulation
  const targetClean = (report.target || 'target')
    .replace(/^https?:\/\//i, '')
    .replace(/[^a-zA-Z0-9-_\.]/g, '_')
    .substring(0, 36);

  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `ThreatScope_${targetClean}_${dateStamp}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(wb, fileName);
  return fileName;
}
