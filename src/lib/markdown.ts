function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url, "https://example.com");
    if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:") {
      return escapeHtml(url);
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

/**
 * Converts a constrained Markdown subset (bold, italic, links, bullet lists,
 * line breaks) to HTML. Input is escaped first so only the patterns below can
 * ever produce markup — safe to render with dangerouslySetInnerHTML.
 */
export function markdownToHtml(text: string): string {
  const escaped = escapeHtml(text);

  const withInline = escaped
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
      const href = safeHref(url);
      return href
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : match;
    });

  const lines = withInline.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${bullet[1]}</li>`);
      continue;
    }
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
    html.push(line.length ? `<p>${line}</p>` : "<br/>");
  }
  if (inList) html.push("</ul>");

  return html.join("");
}
