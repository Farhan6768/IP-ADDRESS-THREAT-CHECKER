import net from 'net';

/**
 * Checks if string is a valid IPv4 address
 */
export function isIPv4(str) {
  return net.isIPv4(str);
}

/**
 * Checks if string is a valid IPv6 address
 */
export function isIPv6(str) {
  return net.isIPv6(str);
}

/**
 * Validates domain name syntax (RFC 1035 / RFC 1123)
 */
export function isDomain(str) {
  if (!str || typeof str !== 'string') return false;
  const clean = str.trim().toLowerCase();
  
  // Exclude IP addresses
  if (isIPv4(clean) || isIPv6(clean)) return false;

  // Domain regex matching hostnames with valid TLDs
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(clean);
}

/**
 * Validates if string is a web URL
 */
export function isURL(str) {
  if (!str || typeof str !== 'string') return false;
  let trimmed = str.trim();

  // Auto-heal common copy-paste errors (e.g. accidental 'v' before paste: 'vhttps://' or 'vhttp://')
  trimmed = trimmed.replace(/^[a-zA-Z]?https?:\/\//i, (match) => {
    return match.toLowerCase().includes('https') ? 'https://' : 'http://';
  });

  // If it starts with http:// or https://
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // If it contains path, query, or port, e.g. example.com/test or example.com:8080
  if (trimmed.includes('/') || trimmed.includes('?')) {
    try {
      const parsed = new URL(`https://${trimmed}`);
      return isDomain(parsed.hostname) || isIPv4(parsed.hostname) || isIPv6(parsed.hostname);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Automatically detects target type and normalizes target
 */
export function detectTarget(input) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Target input cannot be empty'
    };
  }

  let cleaned = input.trim();

  // Auto-heal common copy-paste errors (e.g. accidental 'v' before paste: 'vhttps://' or 'vhttp://')
  cleaned = cleaned.replace(/^[a-zA-Z]?https?:\/\//i, (match) => {
    return match.toLowerCase().includes('https') ? 'https://' : 'http://';
  });

  // Check IPv4 directly
  if (isIPv4(cleaned)) {
    return {
      isValid: true,
      type: 'IPv4',
      original: input,
      normalized: cleaned,
      ip: cleaned,
      domain: null,
      url: null,
      hostname: cleaned
    };
  }

  // Check IPv6 directly
  if (isIPv6(cleaned)) {
    return {
      isValid: true,
      type: 'IPv6',
      original: input,
      normalized: cleaned,
      ip: cleaned,
      domain: null,
      url: null,
      hostname: cleaned
    };
  }

  // Check URL (with http:// or https:// or paths)
  if (isURL(cleaned)) {
    let urlObj;
    try {
      if (!/^https?:\/\//i.test(cleaned)) {
        cleaned = `https://${cleaned}`;
      }
      urlObj = new URL(cleaned);
    } catch {
      return { isValid: false, error: 'Malformed URL provided' };
    }

    const host = urlObj.hostname;
    const isHostIp4 = isIPv4(host);
    const isHostIp6 = isIPv6(host);

    return {
      isValid: true,
      type: 'URL',
      original: input,
      normalized: urlObj.href,
      hostname: host,
      protocol: urlObj.protocol.replace(':', ''),
      pathname: urlObj.pathname,
      search: urlObj.search,
      port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
      domain: !isHostIp4 && !isHostIp6 ? host : null,
      ip: isHostIp4 || isHostIp6 ? host : null,
      url: urlObj.href
    };
  }

  // Check Domain (e.g. example.com, sub.domain.org)
  // Strip protocol if someone entered e.g. domain.com
  cleaned = cleaned.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0];
  if (isDomain(cleaned)) {
    return {
      isValid: true,
      type: 'DOMAIN',
      original: input,
      normalized: cleaned.toLowerCase(),
      hostname: cleaned.toLowerCase(),
      domain: cleaned.toLowerCase(),
      url: `https://${cleaned.toLowerCase()}`,
      ip: null
    };
  }

  return {
    isValid: false,
    error: 'Unrecognized target format. Please provide a valid IPv4, IPv6, Domain, or Web URL.'
  };
}
