const STOP = new Set(
  "that with this from your have will their about which would there been they them into than then also such other only some what when where while using across within each more most able role team work looking join our are for and the you job description over after before under years year experience including skills skill strong plus ability candidate candidates requirements requirement responsibilities responsibility preferred qualification qualifications who whom whose what with your our".split(
    " ",
  ),
);

export function keywords(text: string) {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().match(/[a-z][a-z+.#-]{2,}/g) || []) {
    const word = raw.replace(/[.#+-]+$/g, "");
    if (word.length < 4 || STOP.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 12)
    .map(([word]) => word);
}
