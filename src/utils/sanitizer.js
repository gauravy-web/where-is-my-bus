/**
 * Sanitize HTML to prevent XSS attacks
 * For chat messages and other user inputs, we strip all HTML tags since we only support plain text
 * 
 * Strategy:
 * 1. First, escape all special characters to prevent XSS
 * 2. Then, remove any remaining HTML-like patterns
 * 
 * @param {any} input - The input to sanitize
 * @returns {string} - Sanitized string, empty string if input is null/undefined/non-string
 * 
 * Edge cases handled:
 * - null: returns ''
 * - undefined: returns ''
 * - non-string types (numbers, objects, arrays): returns ''
 * - empty string: returns ''
 * - HTML tags: stripped
 * - Special characters: escaped
 */
function sanitizeHtml(input) {
  // Handle null, undefined, and non-string types
  if (input === null || input === undefined || typeof input !== 'string') {
    return '';
  }
  
  // First, escape ampersands (must be done first to avoid double-escaping)
  let sanitized = input.replace(/&/g, '&amp;');
  
  // Strip HTML tags before escaping < and >
  // This regex looks for actual HTML tags (letter after <, or / after <)
  sanitized = sanitized.replace(/<\/?[a-zA-Z][^>]*>/g, '');
  
  // Now escape remaining < and > characters (for comparisons like 5 < 10)
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Escape other special characters
  sanitized = sanitized
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

module.exports = { sanitizeHtml };
