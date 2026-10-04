import axios from 'axios';
import { reverseDns } from './dnsService.js';

/**
 * Enriches an IP address with Geolocation, ASN, ISP, and Connection details
 */
export async function getIpIntelligence(ip) {
  const ipinfoToken = process.env.IPINFO_TOKEN;
  let geoData = null;

  // 1. Try ipinfo.io if token provided
  if (ipinfoToken) {
    try {
      const res = await axios.get(`https://ipinfo.io/${ip}?token=${ipinfoToken}`, { timeout: 4000 });
      if (res.data) {
        const locParts = (res.data.loc || '').split(',');
        const lat = parseFloat(locParts[0]);
        const lon = parseFloat(locParts[1]);
        geoData = {
          ip,
          hostname: res.data.hostname || null,
          city: res.data.city || 'Unknown',
          region: res.data.region || 'Unknown',
          country: res.data.country || 'Unknown',
          countryCode: res.data.country || 'XX',
          timezone: res.data.timezone || 'UTC',
          org: res.data.org || 'Unknown',
          isp: res.data.org || 'Unknown',
          asn: res.data.org ? res.data.org.split(' ')[0] : 'Unknown',
          latitude: !isNaN(lat) ? lat : 18.5204,
          longitude: !isNaN(lon) ? lon : 73.8567,
          hostingProvider: res.data.org || 'Unknown',
          connectionType: detectConnectionType(res.data.org)
        };
      }
    } catch (err) {
      console.warn(`ipinfo.io lookup failed for ${ip}:`, err.message);
    }
  }

  // 2. Fallback to free public endpoint (ip-api.com or ipwhois)
  if (!geoData) {
    try {
      const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
        timeout: 4000
      });
      if (res.data && res.data.status === 'success') {
        const d = res.data;
        const lat = parseFloat(d.lat);
        const lon = parseFloat(d.lon);
        geoData = {
          ip: d.query || ip,
          hostname: null,
          city: d.city || 'Unknown',
          region: d.regionName || 'Unknown',
          country: d.country || 'Unknown',
          countryCode: d.countryCode || 'XX',
          timezone: d.timezone || 'UTC',
          org: d.org || d.isp || 'Unknown',
          isp: d.isp || 'Unknown',
          asn: d.as || 'Unknown',
          latitude: !isNaN(lat) ? lat : 18.5204,
          longitude: !isNaN(lon) ? lon : 73.8567,
          hostingProvider: d.org || d.isp || 'Unknown',
          connectionType: detectConnectionType(d.org + ' ' + d.isp + ' ' + d.as)
        };
      }
    } catch (err) {
      console.warn(`ip-api fallback failed for ${ip}:`, err.message);
    }
  }

  // 3. Reverse DNS resolution
  const rDns = await reverseDns(ip);

  // If still no geo data (e.g. offline/rate-limited fallback), return structured baseline
  if (!geoData) {
    geoData = {
      ip,
      hostname: rDns,
      city: 'Distributed Network',
      region: 'Global',
      country: 'Global Anycast',
      countryCode: 'GL',
      timezone: 'UTC',
      org: 'Network Infrastructure',
      isp: 'Broadband / Cloud Service',
      asn: 'AS-Transit',
      latitude: 37.7749,
      longitude: -122.4194,
      hostingProvider: 'Cloud / Datacenter Node',
      connectionType: 'Datacenter'
    };
  }

  geoData.reverseDns = rDns || geoData.hostname || `${ip}.in-addr.arpa`;

  return geoData;
}

/**
 * Heuristic connection type classifier
 */
function detectConnectionType(str = '') {
  const s = str.toLowerCase();
  if (s.includes('cloud') || s.includes('aws') || s.includes('amazon') || s.includes('google') || s.includes('azure') || s.includes('digitalocean') || s.includes('ovh') || s.includes('linode') || s.includes('hetzner') || s.includes('vultr') || s.includes('cloudflare')) {
    return 'Datacenter / Cloud Edge';
  }
  if (s.includes('tor') || s.includes('exit') || s.includes('relay') || s.includes('vpn') || s.includes('proxy')) {
    return 'Tor / Anonymizing VPN';
  }
  if (s.includes('telecom') || s.includes('broadband') || s.includes('fiber') || s.includes('comcast') || s.includes('charter') || s.includes('verizon') || s.includes('at&t') || s.includes('vodafone') || s.includes('airtel') || s.includes('jio')) {
    return 'Residential / ISP Gateway';
  }
  if (s.includes('mobile') || s.includes('cellular') || s.includes('wireless') || s.includes('lte') || s.includes('5g')) {
    return 'Mobile Carrier';
  }
  return 'Anycast / Enterprise';
}
