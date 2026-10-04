import net from 'net';
import dns from 'dns/promises';

/**
 * Checks if an IPv4 address falls within private, loopback, or reserved ranges
 */
export function isPrivateIPv4(ip) {
  if (!ip || !net.isIPv4(ip)) return false;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [b0, b1, b2, b3] = parts;

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true;

  // 10.0.0.0/8 (Private network)
  if (b0 === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata 169.254.169.254)
  if (b0 === 169 && b1 === 254) return true;

  // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private network)
  if (b0 === 192 && b1 === 168) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (b0 === 192 && b1 === 0 && b2 === 0) return true;

  // 198.18.0.0/15 (Network benchmark tests)
  if (b0 === 198 && (b1 === 18 || b1 === 19)) return true;

  // 224.0.0.0/4 (Multicast)
  if (b0 >= 224 && b0 <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future use)
  if (b0 >= 240) return true;

  // Broadcast
  if (ip === '255.255.255.255') return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or link-local
 */
export function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();

  // Loopback ::1
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // Unspecified ::
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

  // Link-local fe80::/10
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
    return true;
  }

  // Unique local fc00::/7 (fc00:: and fd00::)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }

  // IPv4-mapped IPv6 ::ffff:127.0.0.1
  if (normalized.startsWith('::ffff:')) {
    const v4 = normalized.replace('::ffff:', '');
    if (net.isIPv4(v4)) {
      return isPrivateIPv4(v4);
    }
  }

  return false;
}

/**
 * Verifies if a hostname or IP is safe to probe externally
 */
export async function validateSafeTarget(hostname) {
  if (!hostname) {
    return { safe: false, reason: 'Target host is undefined.' };
  }

  const cleanHost = hostname.trim().toLowerCase();

  // Blocked hostnames / internal patterns
  const blockedHostnames = [
    'localhost',
    'localhost.localdomain',
    'ip6-localhost',
    'ip6-loopback',
    'broadcasthost',
    'local',
    'internal',
    'corp',
    'lan',
    'home.arpa',
    'metadata.google.internal',
    'instance-data'
  ];

  if (blockedHostnames.includes(cleanHost) || cleanHost.endsWith('.local') || cleanHost.endsWith('.internal')) {
    return { safe: false, reason: 'Access to internal or loopback hostnames is restricted for security (SSRF Protection).' };
  }

  // If host is directly an IP
  if (net.isIPv4(cleanHost)) {
    if (isPrivateIPv4(cleanHost)) {
      return { safe: false, reason: `Target IP ${cleanHost} belongs to a private, loopback, or reserved network range.` };
    }
    return { safe: true, resolvedIp: cleanHost };
  }

  if (net.isIPv6(cleanHost)) {
    if (isPrivateIPv6(cleanHost)) {
      return { safe: false, reason: `Target IPv6 ${cleanHost} belongs to a private or link-local range.` };
    }
    return { safe: true, resolvedIp: cleanHost };
  }

  // For domains, resolve DNS to verify it doesn't resolve to private IP (DNS Rebinding protection)
  try {
    const addresses = await dns.resolve4(cleanHost);
    if (!addresses || addresses.length === 0) {
      return { safe: false, reason: `Domain ${cleanHost} could not be resolved to an active IPv4 address.` };
    }

    for (const ip of addresses) {
      if (isPrivateIPv4(ip)) {
        return {
          safe: false,
          reason: `Target domain resolves to a protected/private IP address (${ip}). Request blocked.`
        };
      }
    }

    return { safe: true, resolvedIp: addresses[0], allIps: addresses };
  } catch (err) {
    // Check if IPv6 resolve works
    try {
      const addresses6 = await dns.resolve6(cleanHost);
      if (addresses6 && addresses6.length > 0) {
        for (const ip of addresses6) {
          if (isPrivateIPv6(ip)) {
            return { safe: false, reason: `Target domain resolves to a private IPv6 address (${ip}). Request blocked.` };
          }
        }
        return { safe: true, resolvedIp: addresses6[0], allIps: addresses6 };
      }
    } catch {
      try {
        const lookupRes = await dns.lookup(cleanHost);
        if (lookupRes?.address) {
          const isPriv = net.isIPv4(lookupRes.address)
            ? isPrivateIPv4(lookupRes.address)
            : isPrivateIPv6(lookupRes.address);
          if (isPriv) {
            return { safe: false, reason: `Target domain resolves to a private IP address (${lookupRes.address}). Request blocked.` };
          }
          return { safe: true, resolvedIp: lookupRes.address, allIps: [lookupRes.address] };
        }
      } catch {}
      return { safe: true, resolvedIp: null, dnsError: err.message };
    }
  }
}
