export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Otomatik bağlantılar (<https://...>) adres olarak korunur.
    .replace(/<((?:https?:\/\/|mailto:)[^\s<>]+)>/gi, "$1")
    .replace(/<([^\s<>@]+@[^\s<>]+\.[^\s<>]+)>/g, "$1")
    // Yalnızca gerçek HTML etiketleri silinir; "5 < 7 ve > 3" korunur.
    .replace(/<\/?[a-z][^>]*>/gi, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "")
    .replace(/^\s*(?:[-*_]\s*){3,}$/gm, " ")
    .replace(/`([^`]*)`/g, "$1")
    // Kelime içindeki _ ve * (snake_case, 2*3*4) vurgu sayılmaz.
    .replace(
      /(?<![\p{L}\p{N}*_\\])(\*\*|__)(?=\S)(.+?)(?<=\S)\1(?![\p{L}\p{N}*_])/gu,
      "$2",
    )
    .replace(
      /(?<![\p{L}\p{N}*_\\])([*_])(?=\S)(.+?)(?<=\S)\1(?![\p{L}\p{N}*_])/gu,
      "$2",
    )
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(markdown: string, max = 160): string {
  const plain = stripMarkdown(markdown);
  if (plain.length <= max) return plain;

  const cut = plain.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut)
    .replace(/[\s.,;:!?\-–—]+$/, "");
  return `${trimmed}…`;
}
