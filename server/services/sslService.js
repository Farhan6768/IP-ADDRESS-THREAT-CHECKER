import tls from 'tls';

/**
 * Inspects the TLS / SSL certificate of a given hostname
 */
export async function inspectSsl(hostname, port = 443) {
  return new Promise((resolve) => {
    const cleanHost = hostname.trim();
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({
          status: 'UNAVAILABLE',
          httpsStatus: 'PORT 443 TIMEOUT',
          error: 'Connection timed out while querying SSL/TLS certificate.',
          isSecure: false
        });
      }
    }, 8000);

    try {
      const socket = tls.connect(
        {
          host: cleanHost,
          port: port,
          servername: cleanHost, // SNI extension
          rejectUnauthorized: false // Don't crash on self-signed; we inspect them!
        },
        () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);

          try {
            const cert = socket.getPeerCertificate(true);
            const protocol = socket.getProtocol();
            const cipher = socket.getCipher();
            const authorized = socket.authorized;
            const authError = socket.authorizationError;

            socket.end();

            if (!cert || Object.keys(cert).length === 0) {
              return resolve({
                status: 'NO_CERTIFICATE',
                httpsStatus: 'NO CERTIFICATE DETECTED',
                isSecure: false
              });
            }

            const validFrom = cert.valid_from ? new Date(cert.valid_from).toISOString().split('T')[0] : 'Unknown';
            const validTo = cert.valid_to ? new Date(cert.valid_to).toISOString().split('T')[0] : 'Unknown';
            const expiryDate = cert.valid_to ? new Date(cert.valid_to) : null;
            const now = new Date();
            const isExpired = expiryDate ? expiryDate < now : false;

            // Extract SANs (Subject Alternative Names)
            let sans = [];
            if (cert.subjectaltname) {
              sans = cert.subjectaltname
                .split(',')
                .map(s => s.trim().replace(/^DNS:/i, ''))
                .filter(Boolean);
            }

            // Extract Issuer details
            const issuerOrg = cert.issuer ? (cert.issuer.O || cert.issuer.CN || 'Unknown') : 'Unknown';
            const subjectCN = cert.subject ? (cert.subject.CN || cleanHost) : cleanHost;

            // Calculate days remaining
            const daysRemaining = expiryDate ? Math.round((expiryDate - now) / (1000 * 60 * 60 * 24)) : null;

            let status = 'VALID';
            if (isExpired) {
              status = 'EXPIRED';
            } else if (!authorized) {
              status = authError ? `INVALID (${authError})` : 'SELF_SIGNED_OR_UNTRUSTED';
            }

            resolve({
              status,
              isValid: !isExpired && authorized,
              issuer: issuerOrg,
              issuerDetails: cert.issuer,
              validFrom,
              validTo,
              expiryDate: validTo,
              daysRemaining,
              tlsVersion: protocol || 'TLSv1.2',
              cipher: cipher ? cipher.name : 'Unknown',
              subject: subjectCN,
              san: sans.slice(0, 15), // cap at 15 for display
              sanCount: sans.length,
              serialNumber: cert.serialNumber || 'N/A',
              fingerprint: cert.fingerprint || 'N/A',
              httpsStatus: isExpired ? 'EXPIRED' : (authorized ? 'VALID / ENFORCED' : 'UNTRUSTED / SELF-SIGNED'),
              isSecure: !isExpired && authorized
            });
          } catch (innerErr) {
            resolve({
              status: 'PARSING_ERROR',
              httpsStatus: 'ERROR',
              error: innerErr.message,
              isSecure: false
            });
          }
        }
      );

      socket.on('error', (err) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        resolve({
          status: 'INACTIVE',
          httpsStatus: 'NO HTTPS LISTENER',
          error: err.code === 'ECONNREFUSED' ? 'Port 443 refused' : err.message,
          isSecure: false
        });
      });
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({
          status: 'ERROR',
          httpsStatus: 'FAILED',
          error: e.message,
          isSecure: false
        });
      }
    }
  });
}
