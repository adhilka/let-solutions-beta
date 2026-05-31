/**
 * Input sanitization utility to protect the application against Cross-Site Scripting (XSS),
 * SQL/NoSQL Injection patterns, and malicious content delivery.
 */

// Keys that are allowed to contain structured rich HTML text (e.g. from TipTap editors)
const HTML_FIELDS = ['content', 'description'];

/**
 * Escapes plain text inputs to remove all HTML-like markup safely while supporting letters, numbers, and symbols.
 */
export function sanitizePlainText(value: string): string {
  if (!value) return '';
  
  // 1. Strip HTML tags entirely to prevent injection of elements
  let cleaned = value.replace(/<\/?[a-zA-Z][^>]*>/g, '');
  
  // 2. Trim excessive or trailing white-spaces
  return cleaned.trim();
}

/**
 * Parses and sanitizes rich HTML strings via the browser's native DOM Parser (fast and robust).
 * Safely strips scripts, non-youtube iframes, inline events (on* handlers), and link protocols from rich editors.
 */
export function sanitizeRichHtml(htmlString: string): string {
  if (!htmlString) return '';
  
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallbackRegexSanitize(htmlString);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // 1. Remove known dangerous and forbidden elements
    const dangerousTags = ['script', 'noscript', 'object', 'embed', 'applet', 'meta', 'link', 'form', 'style', 'xml', 'canvas'];
    dangerousTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    // 2. Filter iframe elements to strictly permit only YouTube embeds
    doc.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.getAttribute('src') || '';
      const isYouTube = src.includes('youtube.com/') || src.includes('youtu.be/');
      if (!isYouTube) {
        iframe.remove();
      } else {
        // Enforce safe attributes only on permitted frames
        const allowedAttrs = ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'class', 'style'];
        Array.from(iframe.attributes).forEach(attr => {
          if (!allowedAttrs.includes(attr.name.toLowerCase())) {
            iframe.removeAttribute(attr.name);
          }
        });
      }
    });

    // 3. Scrub action attributes and remove all on* inline event listeners
    doc.body.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const attrName = attr.name.toLowerCase();
        
        // Strip event attributes like onclick, onerror, onload, etc.
        if (attrName.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        
        // Strip client redirection via javascript URI protocols
        if ((attrName === 'href' || attrName === 'src') && attr.value.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.warn('[Sanitization] Native DOM Parser failed, using backup routine:', err);
    return fallbackRegexSanitize(htmlString);
  }
}

/**
 * Backup sanitization handler utilizing resilient string replacements.
 */
function fallbackRegexSanitize(html: string): string {
  let cleaned = html;
  
  // Strip scripts completely
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Wipe off other blocked containers
  cleaned = cleaned.replace(/<(object|embed|applet|form|style|meta|link)\b[^>]*>(.*?)<\/\1>/gi, '');
  cleaned = cleaned.replace(/<(object|embed|applet|form|style|meta|link|xml)\b[^>]*>/gi, '');

  // Strip event handlers like onclick, onload
  cleaned = cleaned.replace(/\s\bon[a-zA-Z]+\s*=\s*["'].*?["']/gi, '');
  cleaned = cleaned.replace(/\s\bon[a-zA-Z]+\s*=\s*[^\s>]+/gi, '');

  // Strip javascript protocol hrefs
  cleaned = cleaned.replace(/(href|src)\s*=\s*["']\s*javascript:[^"'>]*?["']/gi, '$1="#"');

  return cleaned;
}

/**
 * Recursively scans and sanitizes a complete state payload (object or arrays) before storage or execution.
 */
export function sanitizePayload<T>(data: T, currentKey: string = ''): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item, currentKey)) as unknown as T;
  }

  // Handle nested sub-objects
  if (typeof data === 'object') {
    // Keep File instances or specialized objects intact
    if (data instanceof Date || (typeof File !== 'undefined' && data instanceof File)) {
      return data;
    }
    
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = sanitizePayload(data[key], key);
      }
    }
    return result as T;
  }

  // Handle strings (apply specific filters based on content categories)
  if (typeof data === 'string') {
    if (HTML_FIELDS.includes(currentKey)) {
      return sanitizeRichHtml(data) as unknown as T;
    } else {
      return sanitizePlainText(data) as unknown as T;
    }
  }

  // Numbers, booleans, and other primitives remain unmodified
  return data;
}
