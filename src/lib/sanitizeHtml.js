/**
 * Dependency-free, SSR-safe HTML sanitizer for admin/editor-authored article
 * and page content rendered via dangerouslySetInnerHTML.
 *
 * It runs identically on the server and client (pure string processing, no DOM
 * needed), so there is no hydration mismatch, and it protects legacy content
 * without re-saving. It strips the common XSS vectors while preserving the rich
 * formatting the content relies on (headings, tables, images, links, and
 * YouTube-style <iframe> embeds).
 *
 * This is intentionally conservative rather than a full DOM-based sanitizer so
 * it adds no heavy dependencies (e.g. jsdom) to the server bundle. For a
 * stricter guarantee, also sanitize with DOMPurify at save time.
 */

// Tags whose entire contents must be removed.
const DANGEROUS_BLOCKS = ['script', 'style', 'object', 'embed', 'noscript', 'template'];

export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  let out = html;

  // 1. Remove dangerous tag blocks (including their contents).
  for (const tag of DANGEROUS_BLOCKS) {
    const re = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, 'gi');
    out = out.replace(re, '');
    // Also drop any stray self-closing / unclosed opener.
    out = out.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '');
  }

  // 2. Strip inline event handlers: on*="..." / on*='...' / on*=value
  out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
  out = out.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');
  out = out.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');

  // 3. Neutralise javascript: / vbscript: URLs in href/src/etc.
  out = out.replace(/(href|src|xlink:href)\s*=\s*"(\s*(?:javascript|vbscript):[^"]*)"/gi, '$1="#"');
  out = out.replace(/(href|src|xlink:href)\s*=\s*'(\s*(?:javascript|vbscript):[^']*)'/gi, "$1='#'");

  // 4. Remove data: URIs except inline images (block data:text/html etc.).
  out = out.replace(/(href|src)\s*=\s*"(\s*data:(?!image\/)[^"]*)"/gi, '$1="#"');
  out = out.replace(/(href|src)\s*=\s*'(\s*data:(?!image\/)[^']*)'/gi, "$1='#'");

  return out;
}

export default sanitizeHtml;
