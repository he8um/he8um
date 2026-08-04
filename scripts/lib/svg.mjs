export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function svgDocument({ title, description, width, height, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" viewBox="0 0 ${width} ${height}">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <style>
    text { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Arial,sans-serif; fill:#f0f6fc; }
    .muted { fill:#9da7b3; }
    .accent { fill:#f0443e; }
    .surface { fill:#161b22; stroke:#30363d; }
    .surface2 { fill:#21262d; stroke:#30363d; }
    .line { stroke:#30363d; }
    .accent-line { stroke:#f0443e; }
  </style>
  <rect width="${width}" height="${height}" rx="24" fill="#0d1117" stroke="#30363d"/>
${body}
</svg>
`;
}

export function pill(x, y, text, { width = 150, accent = false } = {}) {
  const fill = accent ? "#f0443e" : "#21262d";
  const textFill = accent ? "#ffffff" : "#f0f6fc";
  return `<rect x="${x}" y="${y}" width="${width}" height="34" rx="17" fill="${fill}" stroke="${accent ? "#f0443e" : "#30363d"}"/>
  <text x="${x + width / 2}" y="${y + 22}" text-anchor="middle" font-size="14" font-weight="700" fill="${textFill}">${escapeXml(text)}</text>`;
}
