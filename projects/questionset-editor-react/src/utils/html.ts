/**
 * HTML escaping/extraction helpers — user- and server-supplied strings must
 * be encoded before interpolation into markup that reaches innerHTML.
 */

export function escapeHtml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Alias for attribute contexts — same encoding covers both. */
export const escapeHtmlAttr = escapeHtml;

/**
 * Plain text of an HTML fragment with entities decoded (&nbsp; → space, etc.)
 * — a tag-strip regex leaves entities behind as literal text.
 */
export function htmlToText(html: string): string {
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.textContent ?? '';
  }
  // Non-DOM fallback (node test environment): strip tags, decode the
  // entities contenteditable actually produces.
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}
