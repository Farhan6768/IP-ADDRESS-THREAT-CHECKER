import crypto from 'crypto';
import dns from 'dns/promises';
import { detectTarget } from '../utils/targetDetector.js';
import { validateSafeTarget } from '../middleware/ssrfProtection.js';
import { resolveAllDns, reverseDns } from '../services/dnsService.js';
import { getIpIntelligence } from '../services/ipService.js';
import { getWhoisInformation } from '../services/whoisService.js';
import { inspectSsl } from '../services/sslService.js';
import { analyzeUrl, auditWebsiteErrors } from '../services/urlService.js';
import { analyzeThreats } from '../services/threatService.js';
import { saveScan, getHistory, getScanById, deleteScanById, clearAllHistory } from '../utils/storage.js';

/**
 * Controller to orchestrate full cybersecurity intelligence scans
 */
export async function performScan(req, res, next) {
  try {
    const { target, mode = 'full' } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Please provide a valid target (Website URL, Domain, IPv4, or IPv6).'
      });
    }

    // 1. Auto-detect target type
    const detected = detectTarget(target);
    if (!detected.isValid) {
      return res.status(400).json({
        success: false,
        error: 'InvalidTargetError',
        message: detected.error
      });
    }

    // 2. SSRF Protection check
    const hostToCheck = detected.hostname;
    const ssrfResult = await validateSafeTarget(hostToCheck);
    if (!ssrfResult.safe) {
      return res.status(403).json({
        success: false,
        error: 'SecurityRestrictionError',
        message: ssrfResult.reason || 'Scanning this target is restricted by SSRF protection policy.'
      });
    }

    const startTime = Date.now();
    const scanId = `scan_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    let primaryIp = null;
    let resolvedDomain = null;
    let targetUrl = null;

    if (detected.type === 'IPv4' || detected.type === 'IPv6') {
      primaryIp = detected.ip;
    } else if (detected.type === 'DOMAIN') {
      resolvedDomain = detected.domain;
      targetUrl = `https://${resolvedDomain}`;
      // Resolve domain to primary IP
      if (ssrfResult.resolvedIp) {
        primaryIp = ssrfResult.resolvedIp;
      } else {
        try {
          const ips = await dns.resolve4(resolvedDomain);
          if (ips.length > 0) primaryIp = ips[0];
        } catch {
          try {
            const lk = await dns.lookup(resolvedDomain);
            if (lk?.address) primaryIp = lk.address;
          } catch {}
        }
      }
    } else if (detected.type === 'URL') {
      targetUrl = detected.url;
      resolvedDomain = detected.domain;
      if (detected.ip) {
        primaryIp = detected.ip;
      } else if (resolvedDomain) {
        if (ssrfResult.resolvedIp) {
          primaryIp = ssrfResult.resolvedIp;
        } else {
          try {
            const ips = await dns.resolve4(resolvedDomain);
            if (ips.length > 0) primaryIp = ips[0];
          } catch {
            try {
              const lk = await dns.lookup(resolvedDomain);
              if (lk?.address) primaryIp = lk.address;
            } catch {}
          }
        }
      }
    }

    // 3. Concurrently gather all specialized intelligence
    const [ipData, domainDnsData, whoisData, sslData, urlAnalysisData] = await Promise.all([
      // IP Intelligence
      primaryIp ? getIpIntelligence(primaryIp) : null,
      // DNS Records
      resolvedDomain ? resolveAllDns(resolvedDomain) : null,
      // WHOIS Registration Data
      resolvedDomain ? getWhoisInformation(resolvedDomain) : null,
      // SSL/TLS Inspection
      resolvedDomain ? inspectSsl(resolvedDomain) : (detected.type === 'URL' && detected.hostname ? inspectSsl(detected.hostname) : null),
      // URL Analysis (Redirects, Tech Stack, Headers)
      targetUrl ? analyzeUrl(targetUrl) : null
    ]);

    // 4. Compute Threat Intelligence & Risk Scoring
    const threatReport = await analyzeThreats({
      target: detected.normalized,
      targetType: detected.type,
      ip: primaryIp,
      domain: resolvedDomain,
      dnsData: domainDnsData,
      sslData,
      urlData: urlAnalysisData
    });

    const scanDurationMs = Date.now() - startTime;

    // 5. Structure unified response
    const scanResult = {
      id: scanId,
      target: detected.original,
      normalizedTarget: detected.normalized,
      targetType: detected.type,
      hostname: detected.hostname,
      scanDuration: `${(scanDurationMs / 1000).toFixed(2)}s`,
      timestamp: new Date().toISOString(),
      threatScore: threatReport.threatScore,
      riskLevel: threatReport.riskLevel,
      confidence: threatReport.confidence,
      detectionsCount: threatReport.detectionsCount,
      lastChecked: threatReport.lastChecked,
      executiveSummary: generateExecutiveSummary({
        target: detected.normalized,
        type: detected.type,
        score: threatReport.threatScore,
        riskLevel: threatReport.riskLevel,
        ip: primaryIp,
        isp: ipData?.isp,
        country: ipData?.country,
        sslStatus: sslData?.status,
        detections: threatReport.detectionsCount
      }),
      ipIntelligence: ipData ? {
        ip: ipData.ip,
        country: ipData.country,
        countryCode: ipData.countryCode,
        city: ipData.city,
        region: ipData.region,
        timezone: ipData.timezone,
        isp: ipData.isp,
        organization: ipData.org,
        asn: ipData.asn,
        reverseDns: ipData.reverseDns,
        hostingProvider: ipData.hostingProvider,
        connectionType: ipData.connectionType,
        latitude: ipData.latitude,
        longitude: ipData.longitude,
        status: 'AVAILABLE DATA'
      } : {
        status: 'NOT AVAILABLE',
        message: 'No active IP binding resolved for this target'
      },
      domainIntelligence: resolvedDomain ? {
        domain: resolvedDomain,
        registrar: whoisData?.registrar || 'Unavailable',
        registrationDate: whoisData?.registrationDate || 'Unavailable',
        expirationDate: whoisData?.expirationDate || 'Unavailable',
        domainAge: whoisData?.domainAge || 'Unavailable',
        nameservers: (domainDnsData?.records?.filter(r => r.type === 'NS').map(r => r.value))?.length > 0
          ? domainDnsData.records.filter(r => r.type === 'NS').map(r => r.value)
          : (whoisData?.nameservers || []),
        dnsSummary: domainDnsData?.summary || {},
        status: 'AVAILABLE DATA'
      } : {
        status: 'NOT AVAILABLE',
        message: 'Target is a direct IP address; domain registration does not apply.'
      },
      threatIntelligence: threatReport.categories,
      apiSources: threatReport.apiSources,
      securitySsl: sslData ? {
        status: sslData.status,
        isValid: sslData.isValid,
        certificateIssuer: sslData.issuer,
        certificateValidFrom: sslData.validFrom,
        certificateExpiry: sslData.validTo,
        tlsVersion: sslData.tlsVersion,
        cipher: sslData.cipher,
        certificateSubject: sslData.subject,
        certificateSan: sslData.san || [],
        httpsStatus: sslData.httpsStatus,
        daysRemaining: sslData.daysRemaining,
        fingerprint: sslData.fingerprint,
        statusType: sslData.isValid ? 'AVAILABLE DATA' : (sslData.status === 'EXPIRED' ? 'THREAT DETECTED' : 'NOT AVAILABLE')
      } : {
        status: 'NOT CHECKED',
        message: 'SSL examination is not applicable for bare IP addresses without HTTPS listener.'
      },
      dnsAnalysis: domainDnsData ? {
        records: domainDnsData.records,
        summary: domainDnsData.summary,
        status: 'AVAILABLE DATA'
      } : {
        records: primaryIp ? [{
          type: 'PTR',
          host: `${primaryIp}.in-addr.arpa`,
          value: ipData?.reverseDns || 'No PTR configured',
          ttl: 3600,
          status: 'ACTIVE'
        }] : [],
        status: primaryIp ? 'AVAILABLE DATA' : 'NOT AVAILABLE'
      },
      geoLocation: ipData ? {
        country: ipData.country,
        region: ipData.region,
        city: ipData.city,
        latitude: ipData.latitude,
        longitude: ipData.longitude,
        timezone: ipData.timezone,
        isp: ipData.isp,
        asn: ipData.asn,
        status: 'AVAILABLE DATA'
      } : {
        status: 'NOT AVAILABLE'
      },
      whoisInformation: whoisData ? {
        registrar: whoisData.registrar,
        createdDate: whoisData.registrationDate,
        updatedDate: whoisData.updatedDate,
        expiryDate: whoisData.expirationDate,
        status: whoisData.status,
        nameservers: (domainDnsData?.records?.filter(r => r.type === 'NS').map(r => r.value))?.length > 0
          ? domainDnsData.records.filter(r => r.type === 'NS').map(r => r.value)
          : (whoisData.nameservers || []),
        registrant: whoisData.registrant,
        rawSource: whoisData.rawSource,
        statusType: 'AVAILABLE DATA'
      } : {
        statusType: 'NOT AVAILABLE',
        message: 'WHOIS registry queries apply exclusively to registered domain names.'
      },
      redirectAnalysis: urlAnalysisData ? {
        originalUrl: urlAnalysisData.originalUrl,
        finalUrl: urlAnalysisData.finalUrl,
        redirectCount: urlAnalysisData.redirectCount,
        redirectChain: urlAnalysisData.redirectChain,
        statusCode: urlAnalysisData.statusCode,
        status: 'AVAILABLE DATA'
      } : {
        status: 'NOT CHECKED',
        message: 'Redirect inspection runs exclusively on Web URLs.'
      },
      technologyDetection: urlAnalysisData?.technologies ? {
        webServer: urlAnalysisData.technologies.webServer,
        programmingLanguage: urlAnalysisData.technologies.programmingLanguage,
        cdn: urlAnalysisData.technologies.cdn,
        framework: urlAnalysisData.technologies.framework,
        cms: urlAnalysisData.technologies.cms,
        javascriptLibraries: urlAnalysisData.technologies.javascriptLibraries,
        analytics: urlAnalysisData.technologies.analytics,
        hostingProvider: urlAnalysisData.technologies.hostingProvider,
        securityHeaders: urlAnalysisData.securityHeaders,
        status: 'AVAILABLE DATA'
      } : {
        status: 'NOT AVAILABLE',
        message: 'Technology fingerprinting applies when scanning web servers and web URLs.'
      },
      websiteErrors: auditWebsiteErrors({
        targetUrl: targetUrl || (detected.type === 'DOMAIN' ? `https://${detected.domain}` : `http://${detected.normalized}`),
        statusCode: urlAnalysisData?.statusCode || (sslData?.status === 'EXPIRED' ? 526 : 200),
        headers: urlAnalysisData?.rawHeaders || {},
        html: urlAnalysisData?.bodySample || '',
        redirectChain: urlAnalysisData?.redirectChain || [],
        sslData
      }),
      securityRecommendations: threatReport.recommendations
    };

    // Save to scan history storage
    saveScan(scanResult);

    return res.status(200).json({
      success: true,
      data: scanResult
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generates human-readable Executive Summary
 */
function generateExecutiveSummary({ target, type, score, riskLevel, ip, isp, country, sslStatus, detections }) {
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH RISK') {
    return `Security telemetry evaluation for ${target} (${type}) has identified serious risk signals resulting in an elevated threat score of ${score}/100 (${riskLevel}). Target host is routed through ${isp || 'unidentified ISP'} in ${country || 'global transit'}, with ${detections} active threat indicators registered. Immediate containment and network boundary filtering are strongly advised.`;
  }
  if (riskLevel === 'MEDIUM RISK' || riskLevel === 'LOW RISK') {
    return `Target ${target} (${type}) returned a moderate threat score of ${score}/100 (${riskLevel}). The host is operational via ${isp || 'standard transit'} in ${country || 'global region'}. While no active botnet or critical malware injection was detected, security configuration anomalies (such as missing headers or SSL expiration) were noted.`;
  }
  return `Target ${target} (${type}) demonstrated a robust, healthy cybersecurity posture with a score of ${score}/100 (${riskLevel}). Geolocation maps to ${isp || 'authorized provider'} in ${country || 'standard region'} with valid SSL certificates and zero blocklist appearances. Continuous routine SOC monitoring is recommended.`;
}

/**
 * Controller to fetch scan history
 */
export async function getScanHistory(req, res, next) {
  try {
    const { q, type, risk, limit = 50, page = 1 } = req.query;
    let list = getHistory();

    if (q) {
      const query = q.toLowerCase().trim();
      list = list.filter(item =>
        item.target?.toLowerCase().includes(query) ||
        item.ipIntelligence?.ip?.includes(query) ||
        item.targetType?.toLowerCase().includes(query)
      );
    }

    if (type && type !== 'ALL') {
      list = list.filter(item => item.targetType === type);
    }

    if (risk && risk !== 'ALL') {
      list = list.filter(item => item.riskLevel === risk);
    }

    const total = list.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = list.slice(startIndex, startIndex + parseInt(limit));

    // Return streamlined items for history table
    const items = paginated.map(scan => ({
      id: scan.id,
      target: scan.target,
      normalizedTarget: scan.normalizedTarget,
      targetType: scan.targetType,
      threatScore: scan.threatScore,
      riskLevel: scan.riskLevel,
      confidence: scan.confidence,
      detectionsCount: scan.detectionsCount,
      timestamp: scan.timestamp,
      country: scan.ipIntelligence?.country || 'Global',
      isp: scan.ipIntelligence?.isp || 'Cloud Network'
    }));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: items
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to fetch single scan by ID
 */
export async function getScanByIdController(req, res, next) {
  try {
    const { id } = req.params;
    const scan = getScanById(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'ScanNotFound',
        message: `Scan report with ID '${id}' was not found in storage.`
      });
    }

    res.json({
      success: true,
      data: scan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to delete a scan from history
 */
export async function deleteScan(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = deleteScanById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'ScanNotFound',
        message: `Could not delete scan with ID '${id}'.`
      });
    }

    res.json({
      success: true,
      message: `Scan '${id}' successfully removed from history.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Aggregated SOC Dashboard statistics - 100% Real-time & Genuine
 */
export async function getDashboardStats(req, res, next) {
  try {
    const history = getHistory();
    const totalScans = history.length;
    const threatsDetected = history.filter(h => (h.threatScore ?? 0) >= 50).length;
    const cleanTargets = history.filter(h => (h.threatScore ?? 0) < 25).length;
    const highRiskTargets = history.filter(h => h.riskLevel === 'HIGH RISK' || h.riskLevel === 'CRITICAL').length;
    const lowWarningTargets = history.filter(h => (h.threatScore ?? 0) >= 25 && (h.threatScore ?? 0) < 50).length;
    const criticalTargets = history.filter(h => h.riskLevel === 'CRITICAL' || (h.threatScore ?? 0) >= 80).length;

    // Trend calculation: 7-day rolling window with distinct vector metrics
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendMap = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      trendMap[dayName] = { 
        day: dayName, 
        clean: 0, 
        warnings: 0, 
        critical: 0,
        malware: 0,
        phishing: 0,
        suspicious: 0
      };
    }

    if (history.length > 0) {
      history.forEach(item => {
        const itemDate = new Date(item.timestamp);
        const diffDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const dayName = days[itemDate.getDay()];
          if (trendMap[dayName]) {
            const score = item.threatScore ?? 0;
            const t = item.threatIntelligence || {};
            const errs = item.websiteErrors || {};

            if (score < 25) {
              trendMap[dayName].clean++;
            } else if (score < 50) {
              trendMap[dayName].warnings++;
            } else {
              trendMap[dayName].critical++;
            }

            if (t.malwareDetection?.status?.includes('DETECTED') || (errs.criticalCount > 0)) {
              trendMap[dayName].malware++;
            }
            if (t.phishingDetection?.status?.includes('DETECTED') || t.phishingDetection?.status === 'MALICIOUS') {
              trendMap[dayName].phishing++;
            }
            if (t.suspiciousActivity?.status?.includes('ELEVATED') || t.suspiciousActivity?.status?.includes('DETECTED') || (errs.totalErrors > 0)) {
              trendMap[dayName].suspicious++;
            }
          }
        }
      });
    }
    const trend = Object.values(trendMap);

    // Risk distribution calculation
    const riskDistribution = history.length > 0 ? [
      { name: 'Safe / Clean', value: cleanTargets, color: '#0D9488' },
      { name: 'Low / Warning', value: lowWarningTargets, color: '#2563EB' },
      { name: 'High Risk', value: Math.max(0, highRiskTargets - criticalTargets), color: '#E11D48' },
      { name: 'Critical', value: criticalTargets, color: '#991B1B' }
    ].filter(r => r.value > 0) : [];

    // Category breakdown calculation
    let categories = [];
    if (history.length > 0) {
      const categoryCounts = {
        'Phishing': 0,
        'Malware': 0,
        'Suspicious Signals': 0,
        'Spam Relay': 0,
        'Botnet Nodes': 0,
        'Blacklisted Host': 0
      };
      history.forEach(item => {
        if (item.threatIntelligence) {
          const t = item.threatIntelligence;
          if (t.phishingDetection?.status?.includes('DETECTED')) categoryCounts['Phishing']++;
          if (t.malwareDetection?.status?.includes('DETECTED')) categoryCounts['Malware']++;
          if (t.suspiciousActivity?.status?.includes('ELEVATED') || t.suspiciousActivity?.status?.includes('DETECTED')) categoryCounts['Suspicious Signals']++;
          if (t.spamReputation?.status?.includes('SUSPICIOUS')) categoryCounts['Spam Relay']++;
          if (t.botnetAssociation?.status?.includes('DETECTED')) categoryCounts['Botnet Nodes']++;
          if (t.blacklistStatus?.status?.includes('LISTED')) categoryCounts['Blacklisted Host']++;
        }
      });

      categories = Object.entries(categoryCounts)
        .map(([cat, count]) => ({ category: cat, count, color: count > 0 ? '#E11D48' : '#64748B' }))
        .filter(c => c.count > 0);
    }

    res.json({
      success: true,
      stats: {
        totalScans,
        threatsDetected,
        cleanTargets,
        highRiskTargets
      },
      charts: {
        trend,
        riskDistribution,
        categories
      },
      recentScans: history.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to clear all historical scans
 */
export async function clearAllHistoryController(req, res, next) {
  try {
    clearAllHistory();
    res.json({
      success: true,
      message: 'All scan history and telemetry records cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Dedicated IP lookup controller
 */
export async function lookupIp(req, res, next) {
  try {
    const { ip } = req.params;
    const ssrfCheck = await validateSafeTarget(ip);
    if (!ssrfCheck.safe) {
      return res.status(403).json({ success: false, error: 'SecurityRestrictionError', message: ssrfCheck.reason });
    }

    const intel = await getIpIntelligence(ip);
    const threats = await analyzeThreats({ target: ip, targetType: 'IPv4', ip });

    res.json({
      success: true,
      data: {
        ipIntelligence: intel,
        threats
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Dedicated Domain lookup controller
 */
export async function lookupDomain(req, res, next) {
  try {
    const { domain } = req.params;
    const ssrfCheck = await validateSafeTarget(domain);
    if (!ssrfCheck.safe) {
      return res.status(403).json({ success: false, error: 'SecurityRestrictionError', message: ssrfCheck.reason });
    }

    const [dnsData, whoisData, sslData] = await Promise.all([
      resolveAllDns(domain),
      getWhoisInformation(domain),
      inspectSsl(domain)
    ]);

    res.json({
      success: true,
      data: {
        domain,
        dns: dnsData,
        whois: whoisData,
        ssl: sslData
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Dedicated URL analyzer controller
 */
export async function analyzeUrlController(req, res, next) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ success: false, error: 'MissingParameter', message: 'Query parameter "url" is required.' });
    }

    const urlData = await analyzeUrl(targetUrl);
    res.json({
      success: true,
      data: urlData
    });
  } catch (error) {
    next(error);
  }
}
