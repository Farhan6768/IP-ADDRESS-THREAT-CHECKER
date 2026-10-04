/**
 * Global API error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[ThreatScope Error]:', err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An internal cybersecurity scanner error occurred.';

  res.status(statusCode).json({
    success: false,
    error: err.name || 'ServerError',
    message,
    status: statusCode,
    timestamp: new Date().toISOString()
  });
}

/**
 * 404 handler for undefined API routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `API endpoint '${req.originalUrl}' does not exist on ThreatScope Server.`
  });
}
