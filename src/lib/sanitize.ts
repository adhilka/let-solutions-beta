
const HTML_FIELDS = ['content', 'description'];

export function sanitizePlainText(value: string): string {
  if (!value) return '';
  
  let cleaned = value.replace(/<\/?[a-zA-Z][^>]*>/g, '');
  
  return cleaned.trim();
}

export function sanitizeRichHtml(htmlString: string): string {
  if (!htmlString) return '';
  
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallbackRegexSanitize(htmlString);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const dangerousTags = ['script', 'noscript', 'object', 'embed', 'applet', 'meta', 'link', 'form', 'style', 'xml', 'canvas'];
    dangerousTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    doc.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.getAttribute('src') || '';
      const isYouTube = src.includes('youtube.com/') || src.includes('youtu.be/');
      if (!isYouTube) {
        iframe.remove();
      } else {
        const allowedAttrs = ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'class', 'style'];
        Array.from(iframe.attributes).forEach(attr => {
          if (!allowedAttrs.includes(attr.name.toLowerCase())) {
            iframe.removeAttribute(attr.name);
          }
        });
      }
    });

    doc.body.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const attrName = attr.name.toLowerCase();
        
        if (attrName.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        
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

function fallbackRegexSanitize(html: string): string {
  let cleaned = html;
  
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  cleaned = cleaned.replace(/<(object|embed|applet|form|style|meta|link)\b[^>]*>(.*?)<\/\1>/gi, '');
  cleaned = cleaned.replace(/<(object|embed|applet|form|style|meta|link|xml)\b[^>]*>/gi, '');

  cleaned = cleaned.replace(/\s\bon[a-zA-Z]+\s*=\s*["'].*?["']/gi, '');
  cleaned = cleaned.replace(/\s\bon[a-zA-Z]+\s*=\s*[^\s>]+/gi, '');

  cleaned = cleaned.replace(/(href|src)\s*=\s*["']\s*javascript:[^"'>]*?["']/gi, '$1="#"');

  return cleaned;
}

export function sanitizePayload<T>(data: T, currentKey: string = ''): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item, currentKey)) as unknown as T;
  }

  if (typeof data === 'object') {
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

  if (typeof data === 'string') {
    if (HTML_FIELDS.includes(currentKey)) {
      return sanitizeRichHtml(data) as unknown as T;
    } else {
      return sanitizePlainText(data) as unknown as T;
    }
  }

  return data;
}
