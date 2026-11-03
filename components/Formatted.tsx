import type { ReactNode } from "react";
import { parseInline, type InlineNode } from "@/lib/richtext";

function Nodes({ nodes }: { nodes: InlineNode[] }) {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.text;
    const children = <Nodes nodes={node.children} />;
    if (node.mark === "bold") return <strong key={index}>{children}</strong>;
    if (node.mark === "italic") return <em key={index}>{children}</em>;
    if (node.mark === "strike") return <s key={index}>{children}</s>;
    return <u key={index}>{children}</u>;
  });
}

export function RichLine({ text }: { text: string }) {
  return <Nodes nodes={parseInline(text)} />;
}

export function FormattedText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flush = (key: string) => {
    if (!list.length) return;
    const items = list;
    list = [];
    blocks.push(
      <ul key={key}>
        {items.map((item, itemIndex) => (
          <li key={itemIndex}>
            <RichLine text={item} />
          </li>
        ))}
      </ul>,
    );
  };

  lines.forEach((line, lineIndex) => {
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      return;
    }
    flush(`list-${lineIndex}`);
    if (line.trim()) {
      blocks.push(
        <p key={lineIndex}>
          <RichLine text={line} />
        </p>,
      );
    }
  });
  flush("list-end");

  return <div className={className}>{blocks}</div>;
}
