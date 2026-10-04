import dns from 'dns/promises';
import axios from 'axios';
import { getApexDomain } from './whoisService.js';

function extractDnsString(item) {
  if (item === null || item === undefined) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (typeof item === 'object') {
    if (typeof item.address === 'string') return item.address;
    if (typeof item.alias === 'string') return item.alias;
    if (typeof item.target === 'string') return item.target;
    if (typeof item.value === 'string') return item.value;
    if (typeof item.nameserver === 'string') return item.nameserver;
    if (typeof item.exchange === 'string') return item.exchange;
    if (typeof item.ip === 'string') return item.ip;
    if (typeof item.data === 'string') return item.data;
    if (Array.isArray(item)) return item.map(extractDnsString).join(' ');
    const strVals = Object.values(item).filter(v => typeof v === 'string');
    if (strVals.length > 0) return strVals[0];
    return JSON.stringify(item);
  }
  return String(item);
}

/**
 * Resolves all real live DNS records (A, AAAA, MX, NS, TXT, CNAME) for a given domain
 */
export async function resolveAllDns(domain) {
  const records = [];
  const cleanDomain = domain.toLowerCase().trim();

  // 1. Try real live NetworkCalc DNS API (bypasses ISP UDP port 53 blocking)
  try {
    const res = await axios.get(`https://networkcalc.com/api/dns/lookup/${cleanDomain}`, {
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });

    if (res.data?.records) {
      const r = res.data.records;

      // A records
      if (Array.isArray(r.A)) {
        r.A.forEach(item => {
          records.push({
            type: 'A',
            host: cleanDomain,
            value: extractDnsString(item.address || item),
            ttl: item.ttl || 300,
            status: 'ACTIVE'
          });
        });
      }

      // AAAA records
      if (Array.isArray(r.AAAA)) {
        r.AAAA.forEach(item => {
          records.push({
            type: 'AAAA',
            host: cleanDomain,
            value: extractDnsString(item.address || item),
            ttl: item.ttl || 300,
            status: 'ACTIVE'
          });
        });
      }

      // MX records
      if (Array.isArray(r.MX)) {
        r.MX.forEach(item => {
          const exchangeVal = extractDnsString(item.exchange || item);
          records.push({
            type: 'MX',
            host: cleanDomain,
            value: `Priority ${item.priority || 0}: ${exchangeVal}`,
            ttl: 3600,
            status: 'ACTIVE'
          });
        });
      }

      // NS records
      if (Array.isArray(r.NS)) {
        r.NS.forEach(item => {
          records.push({
            type: 'NS',
            host: cleanDomain,
            value: extractDnsString(item.nameserver || item),
            ttl: 86400,
            status: 'ACTIVE'
          });
        });
      }

      // TXT records
      if (Array.isArray(r.TXT)) {
        r.TXT.forEach(item => {
          records.push({
            type: 'TXT',
            host: cleanDomain,
            value: extractDnsString(item),
            ttl: 3600,
            status: 'ACTIVE'
          });
        });
      }

      // CNAME records
      if (Array.isArray(r.CNAME)) {
        r.CNAME.forEach(item => {
          records.push({
            type: 'CNAME',
            host: cleanDomain,
            value: extractDnsString(item.alias || item.address || item.target || item),
            ttl: 300,
            status: 'ACTIVE'
          });
        });
      }
    }
  } catch (apiErr) {
    // If external DNS API timed out, fallback to OS resolver
  }

  // 2. If subdomain has no authoritative NS records, check the apex domain
  const apexDomain = getApexDomain(cleanDomain);
  if (apexDomain && apexDomain !== cleanDomain && records.filter(r => r.type === 'NS').length === 0) {
    try {
      const apexRes = await axios.get(`https://networkcalc.com/api/dns/lookup/${apexDomain}`, {
        timeout: 4000,
        headers: { 'Accept': 'application/json' }
      });
      if (Array.isArray(apexRes.data?.records?.NS)) {
        apexRes.data.records.NS.forEach(item => {
          records.push({
            type: 'NS',
            host: apexDomain,
            value: extractDnsString(item.nameserver || item),
            ttl: 86400,
            status: 'ACTIVE'
          });
        });
      }
      if (records.filter(r => r.type === 'MX').length === 0 && Array.isArray(apexRes.data?.records?.MX)) {
        apexRes.data.records.MX.forEach(item => {
          const exchangeVal = extractDnsString(item.exchange || item);
          records.push({
            type: 'MX',
            host: apexDomain,
            value: `Priority ${item.priority || 0}: ${exchangeVal}`,
            ttl: 3600,
            status: 'ACTIVE'
          });
        });
      }
    } catch {}
  }

  // 2. Ensure at least primary A record is always resolved via OS lookup if empty
  if (records.filter(r => r.type === 'A').length === 0) {
    try {
      const lk = await dns.lookup(cleanDomain);
      if (lk?.address) {
        records.push({
          type: 'A',
          host: cleanDomain,
          value: lk.address,
          ttl: 300,
          status: 'ACTIVE'
        });
      }
    } catch {}
  }

  return {
    records,
    summary: {
      aCount: records.filter(r => r.type === 'A').length,
      aaaaCount: records.filter(r => r.type === 'AAAA').length,
      mxCount: records.filter(r => r.type === 'MX').length,
      nsCount: records.filter(r => r.type === 'NS').length,
      txtCount: records.filter(r => r.type === 'TXT').length,
      cnameCount: records.filter(r => r.type === 'CNAME').length,
      total: records.length
    }
  };
}

/**
 * Reverse DNS resolution for an IP
 */
export async function reverseDns(ip) {
  try {
    const hostnames = await dns.reverse(ip);
    return hostnames && hostnames.length > 0 ? hostnames[0] : null;
  } catch {
    return null;
  }
}
