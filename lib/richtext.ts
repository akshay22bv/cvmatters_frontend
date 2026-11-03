/** The same marks FormattedText reads: **bold**, *italic*, ++underline++, ~~strike~~, - lists. */

export type Mark = "bold" | "italic" | "underline" | "strike";

export type InlineNode = { type: "text"; text: string } | { type: "mark"; mark: Mark; children: InlineNode[] };

const TOKEN: Record<Mark, string> = { bold: "**", italic: "*", underline: "++", strike: "~~" };

function markerAt(input: string, index: number) {
  if (input.startsWith("**", index)) return { mark: "bold" as const, token: "**" };
  if (input.startsWith("++", index)) return { mark: "underline" as const, token: "++" };
  if (input.startsWith("~~", index)) return { mark: "strike" as const, token: "~~" };
  if (input.startsWith("*", index)) return { mark: "italic" as const, token: "*" };
  return null;
}

/**
 * Bold wrapped around italic is stored as ***text***. A single left-to-right
 * pass keeps those nested, so the extra stars are marks rather than letters.
 */
export function parseInline(input: string): InlineNode[] {
  const root: InlineNode[] = [];
  const stack: { mark: Mark; children: InlineNode[] }[] = [];
  let buffer = "";

  const list = () => (stack.length ? stack[stack.length - 1].children : root);
  const flush = () => {
    if (!buffer) return;
    const nodes = list();
    const last = nodes[nodes.length - 1];
    if (last && last.type === "text") last.text += buffer;
    else nodes.push({ type: "text", text: buffer });
    buffer = "";
  };

  for (let index = 0; index < input.length; ) {
    const top = stack[stack.length - 1];
    if (top && input.startsWith(TOKEN[top.mark], index)) {
      flush();
      stack.pop();
      const parent = stack.length ? stack[stack.length - 1].children : root;
      parent.push({ type: "mark", mark: top.mark, children: top.children });
      index += TOKEN[top.mark].length;
      continue;
    }
    const opener = markerAt(input, index);
    if (opener && !stack.some((frame) => frame.mark === opener.mark)) {
      flush();
      stack.push({ mark: opener.mark, children: [] });
      index += opener.token.length;
      continue;
    }
    buffer += input[index];
    index += 1;
  }
  flush();
  while (stack.length) {
    const top = stack.pop()!;
    const parent = stack.length ? stack[stack.length - 1].children : root;
    parent.push({ type: "text", text: TOKEN[top.mark] }, ...top.children);
  }
  return root;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function nodesToHtml(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return escapeHtml(node.text);
      const inner = nodesToHtml(node.children);
      if (node.mark === "bold") return `<strong>${inner}</strong>`;
      if (node.mark === "italic") return `<em>${inner}</em>`;
      if (node.mark === "strike") return `<s>${inner}</s>`;
      return `<u>${inner}</u>`;
    })
    .join("");
}

function inlineToHtml(text: string) {
  return nodesToHtml(parseInline(text));
}

export function markdownToHtml(text: string) {
  if (!text.trim()) return "";
  const lines = text.split("\n");
  const out: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (!list.length) return;
    out.push(`<ul>${list.map((item) => `<li>${inlineToHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flush();
    if (line.trim()) out.push(`<p>${inlineToHtml(line)}</p>`);
  }
  flush();
  return out.join("");
}

function inlineFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const inner = [...el.childNodes].map(inlineFromNode).join("");
  if (tag === "strong" || tag === "b") return `**${inner}**`;
  if (tag === "em" || tag === "i") return `*${inner}*`;
  if (tag === "u") return `++${inner}++`;
  if (tag === "s" || tag === "strike" || tag === "del") return `~~${inner}~~`;
  if (tag === "br") return "\n";
  return inner;
}

export function htmlToMarkdown(root: HTMLElement) {
  const lines: string[] = [];

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || "").replace(/\u00a0/g, " ");
      if (text) lines.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      for (const item of el.querySelectorAll(":scope > li")) {
        lines.push(`- ${[...item.childNodes].map(inlineFromNode).join("").trim()}`);
      }
      return;
    }
    if (tag === "p" || tag === "div") {
      const text = [...el.childNodes].map(inlineFromNode).join("").trim();
      if (text) lines.push(text);
      return;
    }
    if (tag === "br") {
      lines.push("");
      return;
    }
    lines.push([...el.childNodes].map(inlineFromNode).join(""));
  };

  for (const child of root.childNodes) walk(child);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
