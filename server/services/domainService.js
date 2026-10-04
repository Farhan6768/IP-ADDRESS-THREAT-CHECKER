import { resolveAllDns } from './dnsService.js';
import { getWhoisInformation } from './whoisService.js';

/**
 * Consolidates Domain intelligence: WHOIS registration data + DNS records
 */
export async function getDomainIntelligence(domain) {
  const cleanDomain = domain.toLowerCase().trim();

  // Run DNS and WHOIS concurrently
  const [dnsResult, whoisResult] = await Promise.all([
    resolveAllDns(cleanDomain),
    getWhoisInformation(cleanDomain)
  ]);

  return {
    domain: cleanDomain,
    registrar: whoisResult.registrar,
    registrationDate: whoisResult.registrationDate,
    expirationDate: whoisResult.expirationDate,
    updatedDate: whoisResult.updatedDate,
    domainAge: whoisResult.domainAge,
    nameservers: whoisResult.nameservers,
    status: whoisResult.status,
    registrant: whoisResult.registrant,
    dnsSummary: dnsResult.summary,
    dnsRecords: dnsResult.records
  };
}
