/** Parse a public LinkedIn profile URL into a clean link and a display name guess. */
export function parseLinkedin(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { error: "Paste your LinkedIn profile link." };
  let parsed: URL;
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return { error: "That doesn't look like a link." };
  }
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "linkedin.com") return { error: "Use a linkedin.com profile link." };
  const match = parsed.pathname.match(/\/in\/([^/]+)/i);
  if (!match?.[1]) return { error: "Use a profile link, like linkedin.com/in/your-name." };
  const slug = decodeURIComponent(match[1]).replace(/-+/g, " ").replace(/\d+$/, "").trim();
  const name = slug.replace(/\b\w/g, (letter) => letter.toUpperCase());
  return { url: `https://www.linkedin.com/in/${match[1]}`, name };
}
