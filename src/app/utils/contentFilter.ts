const explicitPatterns = [
  /\b(porn|porno|xxx|nude|naked)\b/i,
  /\b(sex|sexual|orgasm|masturbat(e|ion))\b/i,
  /\b(penis|vagina|pussy|dick|cock|cum)\b/i,
  /\b(anal|blowjob|handjob|threesome)\b/i,
  /\b(hentai)\b/i,
];

export function containsExplicitContent(text: string) {
  if (!text) return false;
  return explicitPatterns.some((pattern) => pattern.test(text));
}

export function sanitizeContent(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
