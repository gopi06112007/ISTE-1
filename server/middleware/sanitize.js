/**
 * Middleware: Basic input sanitization for XSS prevention.
 * Strips potentially dangerous HTML/script content from string fields in req.body.
 * Applied as a global middleware on all routes.
 */
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  next();
};

/**
 * Recursively sanitize all string values in an object.
 * Removes script tags, event handlers, and dangerous patterns.
 * Preserves TipTap HTML content (handled separately with DOMPurify on client).
 */
function sanitizeObject(obj, skipKeys = ['content']) {
  for (const key of Object.keys(obj)) {
    // Skip 'content' field — that's TipTap HTML, sanitized on the client with DOMPurify
    if (skipKeys.includes(key)) continue;

    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key], skipKeys);
    }
  }
}

/**
 * Sanitize a single string value.
 */
function sanitizeString(str) {
  return str
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handler attributes
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: protocol
    .replace(/javascript\s*:/gi, '')
    // Remove data: protocol (prevents data URI attacks)
    .replace(/data\s*:[^,]*,/gi, '')
    // Trim whitespace
    .trim();
}

module.exports = sanitizeInput;
