"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { htmlToMarkdown, markdownToHtml } from "@/lib/richtext";

function Tool({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={active ? "look-tool is-on" : "look-tool"}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * A summary field with a Canva-style format strip. Marks still save as markdown.
 */
export function RichEditor({
  label,
  value,
  placeholder,
  aside,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  aside?: ReactNode;
  onChange: (next: string) => void;
}) {
  const area = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = area.current;
    if (!node) return;
    if (htmlToMarkdown(node) === value) return;
    node.innerHTML = markdownToHtml(value);
  }, [value]);

  const emit = () => {
    if (area.current) onChange(htmlToMarkdown(area.current));
  };

  const run = (command: string) => {
    area.current?.focus();
    document.execCommand(command, false);
    emit();
  };

  const toggleCase = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const text = selection.toString();
    if (!text) return;
    const next = text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase();
    area.current?.focus();
    document.execCommand("insertText", false, next);
    emit();
  };

  return (
    <div className="editor-box">
      <div className="look-bar is-rich" role="toolbar" aria-label="Text style">
        <Tool label="Bold" onClick={() => run("bold")}>
          <strong>B</strong>
        </Tool>
        <Tool label="Italic" onClick={() => run("italic")}>
          <em>I</em>
        </Tool>
        <Tool label="Underline" onClick={() => run("underline")}>
          <u>U</u>
        </Tool>
        <Tool label="Strikethrough" onClick={() => run("strikeThrough")}>
          <s>S</s>
        </Tool>
        <Tool label="Change case" onClick={toggleCase}>
          <span className="look-case">aA</span>
        </Tool>
        <div className="look-sep" aria-hidden="true" />
        <Tool label="Bullet list" onClick={() => run("insertUnorderedList")}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="3" cy="4" r="1.2" />
            <circle cx="3" cy="8" r="1.2" />
            <circle cx="3" cy="12" r="1.2" />
            <path d="M6 4h8M6 8h8M6 12h8" />
          </svg>
        </Tool>
        {aside}
      </div>
      <label className="field is-bare">
        <span>{label}</span>
        <div
          ref={area}
          className="rich-area"
          contentEditable
          role="textbox"
          aria-label={label}
          data-placeholder={placeholder}
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
        />
      </label>
    </div>
  );
}
