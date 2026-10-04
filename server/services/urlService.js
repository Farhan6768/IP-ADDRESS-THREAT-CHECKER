import axios from 'axios';
import { validateSafeTarget } from '../middleware/ssrfProtection.js';

/**
 * Analyzes URL redirect chains with SSRF protection and inspects technology stack
 */
export async function analyzeUrl(targetUrl) {
  let currentUrl = targetUrl;
  if (!/^https?:\/\//i.test(currentUrl)) {
    currentUrl = `https://${currentUrl}`;
  }

  const originalUrl = currentUrl;
  const redirectChain = [];
  let finalUrl = currentUrl;
  let headers = {};
  let bodySample = '';
  let statusCode = 200;

  // Maximum hops to follow
  const maxRedirects = 6;
  let hops = 0;

  try {
    let continueRedirects = true;

    while (continueRedirects && hops < maxRedirects) {
      const parsed = new URL(currentUrl);
      
      // SSRF check on each hop
      const ssrfCheck = await validateSafeTarget(parsed.hostname);
      if (!ssrfCheck.safe) {
        redirectChain.push({
          step: hops + 1,
          url: currentUrl,
          statusCode: 403,
          statusText: 'BLOCKED_BY_SSRF_POLICY',
          isSuspicious: true,
          reason: ssrfCheck.reason
        });
        break;
      }

      // Execute request with manual redirect following
      let res;
      try {
        res = await axios.get(currentUrl, {
          maxRedirects: 0,
          timeout: 4500,
          validateStatus: (status) => status >= 200 && status < 400,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ThreatScope/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
      } catch (reqErr) {
        if (reqErr.response && [301, 302, 303, 307, 308].includes(reqErr.response.status)) {
          res = reqErr.response;
        } else {
          // If HTTPS fails, try HTTP on first hop
          if (hops === 0 && currentUrl.startsWith('https://')) {
            try {
              currentUrl = currentUrl.replace('https://', 'http://');
              continue;
            } catch {}
          }
          break;
        }
      }

      const isRedirect = [301, 302, 303, 307, 308].includes(res.status);
      const isSuspiciousRedirect = checkSuspiciousRedirect(currentUrl, res.headers.location);

      redirectChain.push({
        step: hops + 1,
        url: currentUrl,
        statusCode: res.status,
        statusText: res.statusText || `${res.status} Redirect`,
        isSuspicious: isSuspiciousRedirect.suspicious,
        suspiciousReason: isSuspiciousRedirect.reason,
        target: res.headers.location || null
      });

      if (isRedirect && res.headers.location) {
        let nextUrl = res.headers.location;
        if (nextUrl.startsWith('/')) {
          const base = new URL(currentUrl);
          nextUrl = `${base.protocol}//${base.host}${nextUrl}`;
        }
        currentUrl = nextUrl;
        hops++;
      } else {
        finalUrl = currentUrl;
        headers = res.headers || {};
        bodySample = typeof res.data === 'string' ? res.data.substring(0, 15000) : '';
        statusCode = res.status;
        continueRedirects = false;
      }
    }
  } catch (err) {
    // If request fails
  }

  // Detect technologies based on headers & bodySample
  const techStack = detectTechnologies(headers, bodySample, finalUrl);

  return {
    originalUrl,
    finalUrl,
    redirectCount: Math.max(0, redirectChain.length - 1),
    statusCode,
    redirectChain: redirectChain.length > 0 ? redirectChain : [
      { step: 1, url: originalUrl, statusCode: 200, statusText: 'Direct', isSuspicious: false }
    ],
    technologies: techStack,
    securityHeaders: extractSecurityHeaders(headers),
    rawHeaders: headers,
    bodySample
  };
}

/**
 * Checks for deceptive/suspicious redirection behaviors
 */
function checkSuspiciousRedirect(fromUrl, toUrl) {
  if (!toUrl) return { suspicious: false };
  try {
    const fromHost = new URL(fromUrl).hostname.toLowerCase();
    const toHost = new URL(toUrl.startsWith('http') ? toUrl : `https://${fromHost}${toUrl}`).hostname.toLowerCase();

    // Cross-domain redirect to unfamiliar TLD
    const suspiciousTlds = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.buzz', '.monster'];
    const hasSuspiciousTld = suspiciousTlds.some(tld => toHost.endsWith(tld));

    if (fromHost !== toHost && hasSuspiciousTld) {
      return {
        suspicious: true,
        reason: `Cross-domain redirect from ${fromHost} to high-risk TLD (${toHost})`
      };
    }

    // IP address redirect
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(toHost)) {
      return {
        suspicious: true,
        reason: `Redirect leads directly to a raw IP address (${toHost}) instead of a verified domain name.`
      };
    }

    return { suspicious: false };
  } catch {
    return { suspicious: false };
  }
}

/**
 * Fingerprints web server, programming language, CDN, framework, CMS, analytics, etc.
 */
function detectTechnologies(headers = {}, html = '', url = '') {
  const h = {};
  Object.keys(headers).forEach(k => {
    h[k.toLowerCase()] = String(headers[k]).toLowerCase();
  });
  const htmlLower = (html || '').toLowerCase();
  const cookiesStr = headers['set-cookie'] ? (Array.isArray(headers['set-cookie']) ? headers['set-cookie'].join(' ') : String(headers['set-cookie'])).toLowerCase() : '';

  const tech = {
    webServer: 'Standard HTTP Server',
    programmingLanguage: 'Modern ECMAScript / WebAssembly',
    cdn: 'Direct / None Detected',
    framework: 'Modern Web Stack',
    cms: 'Custom / Headless',
    javascriptLibraries: [],
    analytics: 'Not Publicly Disclosed',
    hostingProvider: 'Cloud Datacenter'
  };

  // 1. Web Server
  if (headers['server']) {
    tech.webServer = headers['server'];
  } else if (htmlLower.includes('apache')) {
    tech.webServer = 'Apache HTTPD';
  } else if (htmlLower.includes('nginx')) {
    tech.webServer = 'Nginx';
  } else if (htmlLower.includes('litespeed') || h['server']?.includes('litespeed')) {
    tech.webServer = 'LiteSpeed Web Server';
  } else if (h['server']?.includes('iis') || h['server']?.includes('microsoft')) {
    tech.webServer = 'Microsoft-IIS';
  }

  // 2. Programming Language
  if (h['x-powered-by']?.includes('php') || h['server']?.includes('php') || cookiesStr.includes('phpsessid') || htmlLower.includes('.php') || url.includes('.php')) {
    const phpMatch = (headers['server'] || headers['x-powered-by'] || '').match(/php\/([0-9.]+)/i);
    tech.programmingLanguage = phpMatch ? `PHP ${phpMatch[1]}` : 'PHP';
  } else if (h['x-powered-by']?.includes('asp.net') || cookiesStr.includes('asp.net') || cookiesStr.includes('.aspnetcore')) {
    tech.programmingLanguage = 'C# / ASP.NET';
  } else if (h['x-powered-by']?.includes('express') || htmlLower.includes('__next') || h['x-vercel-id'] || h['x-nf-request-id']) {
    tech.programmingLanguage = 'Node.js / TypeScript';
  } else if (h['server']?.includes('python') || h['server']?.includes('gunicorn') || h['server']?.includes('uwsgi') || cookiesStr.includes('csrftoken')) {
    tech.programmingLanguage = 'Python';
  } else if (h['server']?.includes('passenger') || cookiesStr.includes('_session_id')) {
    tech.programmingLanguage = 'Ruby';
  } else if (h['server']?.includes('tomcat') || h['server']?.includes('jetty') || cookiesStr.includes('jsessionid')) {
    tech.programmingLanguage = 'Java (JVM)';
  } else if (h['server']?.includes('caddy') || h['server']?.includes('traefik')) {
    tech.programmingLanguage = 'Go (Golang)';
  }

  // 3. CDN & Edge Acceleration
  if (h['cf-ray'] || h['server'] === 'cloudflare') {
    tech.cdn = 'Cloudflare Global Edge';
  } else if (h['x-amz-cf-id'] || h['via']?.includes('cloudfront')) {
    tech.cdn = 'Amazon CloudFront';
  } else if (h['x-akamai-transformed'] || h['x-akamai-request-id']) {
    tech.cdn = 'Akamai Technologies';
  } else if (h['fastly-debug-digest'] || h['x-served-by']?.includes('cache-')) {
    tech.cdn = 'Fastly CDN';
  } else if (h['x-goog-'] || h['via']?.includes('google')) {
    tech.cdn = 'Google Cloud CDN';
  }

  // 4. CMS & Educational / E-Commerce Platforms
  if (htmlLower.includes('moodle') || url.includes('/moodle') || cookiesStr.includes('moodlesession')) {
    tech.cms = 'Moodle LMS';
    if (!tech.programmingLanguage.includes('PHP')) tech.programmingLanguage = 'PHP';
  } else if (htmlLower.includes('/wp-content/') || htmlLower.includes('wp-json') || htmlLower.includes('wordpress')) {
    tech.cms = 'WordPress';
    if (!tech.programmingLanguage.includes('PHP')) tech.programmingLanguage = 'PHP';
  } else if (htmlLower.includes('shopify.com') || htmlLower.includes('cdn.shopify.com')) {
    tech.cms = 'Shopify';
  } else if (htmlLower.includes('woocommerce')) {
    tech.cms = 'WooCommerce (WordPress)';
  } else if (htmlLower.includes('drupal')) {
    tech.cms = 'Drupal';
  } else if (htmlLower.includes('joomla')) {
    tech.cms = 'Joomla';
  } else if (htmlLower.includes('ghost')) {
    tech.cms = 'Ghost CMS';
  } else if (htmlLower.includes('wix.com')) {
    tech.cms = 'Wix';
  } else if (htmlLower.includes('squarespace')) {
    tech.cms = 'Squarespace';
  } else if (htmlLower.includes('webflow')) {
    tech.cms = 'Webflow';
  }

  // 5. Frameworks & Client Runtimes
  const libs = new Set();

  if (htmlLower.includes('__next') || h['x-powered-by']?.includes('next.js')) {
    tech.framework = 'Next.js (React)';
    libs.add('React');
    libs.add('Next.js');
  } else if (htmlLower.includes('react') || htmlLower.includes('_react') || htmlLower.includes('data-reactroot')) {
    tech.framework = 'React.js';
    libs.add('React');
  } else if (htmlLower.includes('vue') || htmlLower.includes('data-v-')) {
    tech.framework = 'Vue.js';
    libs.add('Vue');
  } else if (htmlLower.includes('angular') || htmlLower.includes('ng-version')) {
    tech.framework = 'Angular';
    libs.add('Angular');
  } else if (htmlLower.includes('svelte')) {
    tech.framework = 'Svelte';
    libs.add('Svelte');
  } else if (htmlLower.includes('nuxt')) {
    tech.framework = 'Nuxt.js (Vue)';
    libs.add('Vue');
    libs.add('Nuxt.js');
  } else if (h['x-powered-by']) {
    tech.framework = headers['x-powered-by'];
  } else if (htmlLower.includes('laravel') || cookiesStr.includes('laravel_session')) {
    tech.framework = 'Laravel (PHP)';
  } else if (cookiesStr.includes('csrftoken') && tech.programmingLanguage.includes('Python')) {
    tech.framework = 'Django (Python)';
  }

  if (htmlLower.includes('jquery')) libs.add('jQuery');
  if (htmlLower.includes('bootstrap')) libs.add('Bootstrap');
  if (htmlLower.includes('tailwind')) libs.add('Tailwind CSS');
  if (htmlLower.includes('lodash')) libs.add('Lodash');
  if (htmlLower.includes('font-awesome') || htmlLower.includes('fontawesome')) libs.add('FontAwesome');
  if (htmlLower.includes('alpine') || htmlLower.includes('x-data')) libs.add('Alpine.js');

  tech.javascriptLibraries = libs.size > 0 ? Array.from(libs) : ['Modern Vanilla / ES Modules'];

  // 6. Analytics & Telemetry
  if (htmlLower.includes('google-analytics.com') || htmlLower.includes('gtag') || htmlLower.includes('ga(') || htmlLower.includes('googletagmanager.com')) {
    tech.analytics = 'Google Analytics / GTM';
  } else if (htmlLower.includes('plausible.io')) {
    tech.analytics = 'Plausible Analytics';
  } else if (htmlLower.includes('hotjar')) {
    tech.analytics = 'Hotjar Behavioral Telemetry';
  } else if (htmlLower.includes('mixpanel')) {
    tech.analytics = 'Mixpanel';
  } else if (htmlLower.includes('fbevents.js') || htmlLower.includes('connect.facebook.net')) {
    tech.analytics = 'Meta Pixel / Facebook';
  }

  // 7. Hosting & Cloud Infrastructure
  if (tech.cdn.includes('Cloudflare')) {
    tech.hostingProvider = 'Cloudflare Edge Infrastructure';
  } else if (h['x-vercel-id']) {
    tech.hostingProvider = 'Vercel Serverless Edge';
  } else if (h['x-nf-request-id']) {
    tech.hostingProvider = 'Netlify Edge';
  } else if (h['x-github-request-id']) {
    tech.hostingProvider = 'GitHub Pages';
  } else if (h['server']?.includes('amazons3') || h['x-amz-request-id']) {
    tech.hostingProvider = 'AWS S3 / CloudFront';
  } else if (h['server']?.includes('win64') || h['server']?.includes('apache')) {
    tech.hostingProvider = 'Enterprise Dedicated Datacenter';
  }

  return tech;
}

/**
 * Audits comprehensive website errors, vulnerabilities, and security misconfigurations
 */
export function auditWebsiteErrors({
  targetUrl,
  statusCode,
  headers = {},
  html = '',
  redirectChain = [],
  sslData = null
}) {
  const issues = [];
  const h = {};
  Object.keys(headers || {}).forEach(k => {
    h[k.toLowerCase()] = String(headers[k]).trim();
  });
  const isHttps = /^https:\/\//i.test(targetUrl);

  // 1. Availability & HTTP Status Code Errors
  if (statusCode >= 500) {
    issues.push({
      id: 'ERR_HTTP_5XX',
      category: 'HTTP & Server Availability',
      severity: 'CRITICAL',
      title: `Server Error (HTTP ${statusCode})`,
      description: `The web server responded with error code ${statusCode} indicating an internal crash or gateway failure.`,
      impact: 'Website is experiencing downtime or failing to execute application processes.',
      recommendation: 'Inspect web application logs, database connection pools, and upstream reverse proxy health.'
    });
  } else if (statusCode === 404) {
    issues.push({
      id: 'ERR_HTTP_404',
      category: 'HTTP & Server Availability',
      severity: 'HIGH',
      title: 'Endpoint Not Found (HTTP 404)',
      description: 'The requested web URL route does not exist on the target web server.',
      impact: 'Visitors encounter dead pages, leading to user abandonment and SEO de-indexing.',
      recommendation: 'Verify URL routing or establish an HTTP 301 permanent redirect to a valid canonical page.'
    });
  } else if (statusCode === 403) {
    issues.push({
      id: 'ERR_HTTP_403',
      category: 'HTTP & Server Availability',
      severity: 'MEDIUM',
      title: 'Access Forbidden (HTTP 403)',
      description: 'The web server rejected request permissions (WAF block, directory indexing forbidden, or IP restriction).',
      impact: 'Unauthenticated or unauthorized visitors cannot view resource content.',
      recommendation: 'Check web server access control rules, .htaccess, or Cloudflare/WAF firewall block policies.'
    });
  }

  // 2. SSL/TLS Cryptographic Security Flaws
  if (!isHttps) {
    issues.push({
      id: 'ERR_SSL_INSECURE_HTTP',
      category: 'SSL / TLS Cryptographic Security',
      severity: 'CRITICAL',
      title: 'Insecure Cleartext Transmission (No HTTPS)',
      description: 'Website operates over plain unencrypted HTTP port 80 without SSL/TLS cryptographic encryption.',
      impact: 'Passwords, session cookies, and sensitive payloads can be sniffed or modified via Man-in-the-Middle (MITM) attacks.',
      recommendation: 'Install a trusted SSL certificate (e.g. Let\'s Encrypt) and enforce 301 redirect from HTTP to HTTPS.'
    });
  } else if (sslData) {
    if (sslData.status === 'EXPIRED') {
      issues.push({
        id: 'ERR_SSL_EXPIRED',
        category: 'SSL / TLS Cryptographic Security',
        severity: 'CRITICAL',
        title: 'Expired SSL/TLS Certificate',
        description: `The certificate expired on ${sslData.certificateExpiry || 'an earlier date'}. Modern browsers block visitor traffic.`,
        impact: 'Full-screen browser security warning interstitials ("Your connection is not private") block user access.',
        recommendation: 'Renew the SSL certificate immediately through your domain registrar or ACME certificate authority.'
      });
    } else if (sslData.status === 'SELF_SIGNED_OR_UNTRUSTED' || sslData.status?.includes('INVALID')) {
      issues.push({
        id: 'ERR_SSL_UNTRUSTED',
        category: 'SSL / TLS Cryptographic Security',
        severity: 'HIGH',
        title: 'Untrusted or Self-Signed Certificate',
        description: 'The certificate was not signed by a recognized Certificate Authority (CA) in global root trust stores.',
        impact: 'Enterprise firewalls and browsers reject connections due to untrusted certificate authenticity.',
        recommendation: 'Replace with an authorized certificate issued by a public CA (e.g., Let\'s Encrypt, DigiCert).'
      });
    } else if (sslData.daysRemaining !== null && sslData.daysRemaining !== undefined && sslData.daysRemaining < 15 && sslData.daysRemaining >= 0) {
      issues.push({
        id: 'WARN_SSL_EXPIRING_SOON',
        category: 'SSL / TLS Cryptographic Security',
        severity: 'MEDIUM',
        title: `SSL Certificate Expiring Soon (${sslData.daysRemaining} Days Left)`,
        description: `Certificate will expire on ${sslData.certificateExpiry}. Renewal appears pending.`,
        impact: 'Service disruption will occur if certificate reaches expiration timestamp before renewal.',
        recommendation: 'Trigger automated Certbot check or manual renewal via certificate management console.'
      });
    }
  }

  // 3. Browser Defense Security Headers (OWASP Top 10)
  if (!h['strict-transport-security']) {
    issues.push({
      id: 'ERR_SEC_HSTS_MISSING',
      category: 'Browser Defense Headers',
      severity: 'MEDIUM',
      title: 'Missing HTTP Strict Transport Security (HSTS)',
      description: 'The "Strict-Transport-Security" header is absent, permitting unencrypted HTTP downgrade attacks.',
      impact: 'Attackers can execute SSL stripping attacks on public Wi-Fi networks to intercept communications.',
      recommendation: 'Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'
    });
  }

  if (!h['content-security-policy']) {
    issues.push({
      id: 'ERR_SEC_CSP_MISSING',
      category: 'Browser Defense Headers',
      severity: 'MEDIUM',
      title: 'Missing Content Security Policy (CSP)',
      description: 'The "Content-Security-Policy" header is not configured, leaving script execution unrestricted.',
      impact: 'Substantially elevates vulnerability to Cross-Site Scripting (XSS) and rogue script injection.',
      recommendation: 'Configure a Content-Security-Policy header restricting script-src, object-src, and default-src directives.'
    });
  }

  if (!h['x-frame-options'] && (!h['content-security-policy'] || !h['content-security-policy'].includes('frame-ancestors'))) {
    issues.push({
      id: 'ERR_SEC_XFRAME_MISSING',
      category: 'Browser Defense Headers',
      severity: 'MEDIUM',
      title: 'Missing Anti-Clickjacking Header (X-Frame-Options)',
      description: 'The "X-Frame-Options" header is absent and no CSP frame-ancestors directive was detected.',
      impact: 'Hostile sites can embed this web page inside a transparent <iframe> to hijack user clicks (Clickjacking).',
      recommendation: 'Add header: X-Frame-Options: SAMEORIGIN or DENY.'
    });
  }

  if (!h['x-content-type-options']) {
    issues.push({
      id: 'ERR_SEC_XCTO_MISSING',
      category: 'Browser Defense Headers',
      severity: 'LOW',
      title: 'Missing MIME Sniffing Protection (X-Content-Type-Options)',
      description: 'The "X-Content-Type-Options: nosniff" header is missing.',
      impact: 'Browsers may interpret non-executable assets as executable script content if MIME type is ambiguous.',
      recommendation: 'Add header: X-Content-Type-Options: nosniff'
    });
  }

  if (!h['referrer-policy']) {
    issues.push({
      id: 'WARN_SEC_REFERRER_DEFAULT',
      category: 'Browser Defense Headers',
      severity: 'LOW',
      title: 'Missing Referrer-Policy Header',
      description: 'No explicit Referrer-Policy is configured on outgoing navigation.',
      impact: 'Sensitive URL parameters and tokens may leak to third-party domains via the Referer request header.',
      recommendation: 'Add header: Referrer-Policy: strict-origin-when-cross-origin'
    });
  }

  // 4. Information Disclosure & Technology Version Leaks
  const serverHeader = headers['server'];
  if (serverHeader && (/\d+\.\d+/.test(serverHeader) || serverHeader.length > 25)) {
    issues.push({
      id: 'WARN_SERVER_VERSION_LEAK',
      category: 'Information Disclosure',
      severity: 'MEDIUM',
      title: 'Server Build Version Disclosure',
      description: `Web server exposes internal software stack details: "${serverHeader}".`,
      impact: 'Adversaries can correlate precise version numbers with published CVE exploits and weaponized payloads.',
      recommendation: 'Disable verbose banner signatures (e.g., ServerTokens Prod in Apache, server_tokens off in Nginx).'
    });
  }

  const poweredBy = headers['x-powered-by'];
  if (poweredBy) {
    issues.push({
      id: 'WARN_POWERED_BY_LEAK',
      category: 'Information Disclosure',
      severity: 'LOW',
      title: 'Application Runtime Disclosure (X-Powered-By)',
      description: `Backend runtime framework leaked in response header: "${poweredBy}".`,
      impact: 'Informs automated attack scanners about the exact backend execution environment.',
      recommendation: 'Disable the X-Powered-By header (e.g. app.disable("x-powered-by") in Express, expose_php = Off in php.ini).'
    });
  }

  // 5. Redirection Flaws
  if (redirectChain.length > 3) {
    issues.push({
      id: 'WARN_REDIRECT_EXCESSIVE',
      category: 'Redirect & Transport',
      severity: 'LOW',
      title: `Excessive Redirection Chain (${redirectChain.length - 1} Hops)`,
      description: `Request traversed ${redirectChain.length - 1} intermediary hops before resolving to destination.`,
      impact: 'Increases initial page load time and degrades client connection stability.',
      recommendation: 'Point hyperlinks and canonical directives directly to the final landing URL.'
    });
  }

  const suspiciousHop = redirectChain.find(h => h.isSuspicious);
  if (suspiciousHop) {
    issues.push({
      id: 'ERR_REDIRECT_SUSPICIOUS',
      category: 'Redirect & Transport',
      severity: 'HIGH',
      title: 'Suspicious Cross-Domain Redirection',
      description: `Redirect route traverses high-risk or external host: ${suspiciousHop.suspiciousReason || suspiciousHop.url}.`,
      impact: 'Risk of credential phishing, open redirect abuse, or traffic hijacking.',
      recommendation: 'Sanitize redirect parameters and implement a whitelist of permitted target domains.'
    });
  }

  // Passed / Defended Checks (positive indicators)
  const passedChecks = [];
  if (isHttps && sslData?.isValid) {
    passedChecks.push({
      title: 'HTTPS Encryption Enforced',
      description: `Trusted SSL/TLS certificate (${sslData.tlsVersion || 'TLSv1.3'}) issued by ${sslData.certificateIssuer || 'Authorized CA'}.`
    });
  }
  if (h['strict-transport-security']) {
    passedChecks.push({
      title: 'HSTS Transport Security Active',
      description: 'Strict HTTPS downgrade protection enforced.'
    });
  }
  if (h['content-security-policy']) {
    passedChecks.push({
      title: 'Content Security Policy (CSP) Active',
      description: 'Restricts unauthorized script execution and code injection.'
    });
  }
  if (h['x-frame-options']) {
    passedChecks.push({
      title: 'Anti-Clickjacking Protection Active',
      description: `Frame rendering restricted with "${h['x-frame-options']}".`
    });
  }
  if (h['x-content-type-options']) {
    passedChecks.push({
      title: 'MIME Sniffing Defense Active',
      description: 'Prevents browser execution of spoofed MIME types.'
    });
  }

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;
  const mediumCount = issues.filter(i => i.severity === 'MEDIUM').length;
  const lowCount = issues.filter(i => i.severity === 'LOW').length;

  return {
    totalErrors: issues.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    passedChecksCount: passedChecks.length,
    issues,
    passedChecks,
    healthGrade: criticalCount > 0 ? 'F' : (highCount > 0 ? 'D' : (mediumCount > 2 ? 'C' : (mediumCount > 0 ? 'B' : 'A'))),
    status: issues.length === 0 ? 'CLEAN_SECURE' : (criticalCount > 0 || highCount > 0 ? 'ERRORS_DETECTED' : 'WARNINGS_DETECTED')
  };
}

/**
 * Extracts standard web security headers
 */
function extractSecurityHeaders(headers = {}) {
  const h = {};
  Object.keys(headers).forEach(k => {
    h[k.toLowerCase()] = headers[k];
  });

  return {
    strictTransportSecurity: h['strict-transport-security'] || 'Missing (HSTS)',
    contentSecurityPolicy: h['content-security-policy'] ? 'Present' : 'Missing (CSP)',
    xFrameOptions: h['x-frame-options'] || 'Missing (Clickjacking protection)',
    xContentTypeOptions: h['x-content-type-options'] || 'Missing (MIME sniffing protection)',
    referrerPolicy: h['referrer-policy'] || 'Default',
    permissionsPolicy: h['permissions-policy'] ? 'Configured' : 'Missing'
  };
}
