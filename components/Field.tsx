"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Chevron, IconCheck, IconEye, IconEyeOff, IconSearch, IconX } from "./icons";
import { searchSkills } from "@/lib/api";
import { useCountries } from "@/lib/countries";
import { htmlToMarkdown, markdownToHtml } from "@/lib/richtext";

export type Option = { id: string; name: string; hint?: string };

export const MONTHS: Option[] = [
  { id: "01", name: "January" },
  { id: "02", name: "February" },
  { id: "03", name: "March" },
  { id: "04", name: "April" },
  { id: "05", name: "May" },
  { id: "06", name: "June" },
  { id: "07", name: "July" },
  { id: "08", name: "August" },
  { id: "09", name: "September" },
  { id: "10", name: "October" },
  { id: "11", name: "November" },
  { id: "12", name: "December" },
];

const now = new Date().getFullYear();
export const YEARS: Option[] = Array.from({ length: now - 1969 }, (_, index) => {
  const year = String(now + 1 - index);
  return { id: year, name: year };
});

export function parseMonthYear(value: string) {
  const match = String(value || "").trim().match(/^(\d{1,2})\/(\d{4})$/);
  if (match) return { month: match[1].padStart(2, "0"), year: match[2] };
  const year = String(value || "").match(/^(19|20)\d{2}$/);
  return { month: "", year: year?.[0] || "" };
}

export function joinMonthYear(month: string, year: string) {
  if (!year) return "";
  return `${month || "01"}/${year}`;
}

/* ------------------------------------------------------------- shell ---- */

type ShellProps = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  ok?: string;
  optional?: boolean;
  className?: string;
  count?: string;
  children: ReactNode;
};

/**
 * The frame every field shares: a top-aligned label, the control, and one line
 * of help underneath that turns into the error when there is one. Labels sit on
 * top rather than floating — they stay readable while the field is filled, and
 * they do not collide with the error text.
 */
function Shell({ id, label, hint, error, ok, optional, className, count, children }: ShellProps) {
  const state = error ? "bad" : ok ? "good" : "";
  return (
    <div className={`fld${state ? ` is-${state}` : ""}${className ? ` ${className}` : ""}`}>
      <div className="fld-top">
        <label className="fld-label" htmlFor={id}>
          {label}
          {optional ? <em>(Optional)</em> : null}
        </label>
        {count ? <span className="fld-count">{count}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="fld-note is-bad" role="alert">
          {error}
        </p>
      ) : ok ? (
        <p className="fld-note is-good">
          <IconCheck />
          {ok}
        </p>
      ) : hint ? (
        <p className="fld-note">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- input ---- */

/** A one-line field that shows bold, italic, and the other marks while you type. */
function RichLineInput({
  id,
  value,
  placeholder,
  disabled,
  autoFocus,
  labelledBy,
  onChange,
  onBlur,
}: {
  id: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  labelledBy?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (htmlToMarkdown(node) === value) return;
    node.innerHTML = value ? markdownToHtml(value) : "";
  }, [value]);

  const emit = () => {
    const node = ref.current;
    if (node) onChange(htmlToMarkdown(node));
  };

  return (
    <div
      id={id}
      ref={ref}
      className="rich-line"
      contentEditable={disabled ? false : true}
      role="textbox"
      aria-labelledby={labelledBy}
      aria-multiline="false"
      data-placeholder={placeholder}
      suppressContentEditableWarning
      onInput={emit}
      onBlur={() => {
        emit();
        onBlur?.();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    />
  );
}

/* ------------------------------------------------------------- input ---- */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  className,
  hint,
  error,
  ok,
  icon,
  maxLength,
  showCount = false,
  optional,
  disabled,
  onBlur,
  autoFocus,
  inputMode,
  name,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  className?: string;
  hint?: string;
  error?: string;
  ok?: string;
  icon?: ReactNode;
  maxLength?: number;
  showCount?: boolean;
  optional?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  autoFocus?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  name?: string;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      error={error}
      ok={ok}
      optional={optional}
      className={className}
      count={showCount && maxLength ? `${value.length}/${maxLength}` : undefined}
    >
      <div className={`fld-box${icon ? " has-lead" : ""}`}>
        {icon ? <span className="fld-lead">{icon}</span> : null}
        {type === "text" && !isPassword ? (
          <RichLineInput
            id={id}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            onChange={onChange}
            onBlur={onBlur}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={isPassword && revealed ? "text" : type}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            inputMode={inputMode}
            maxLength={maxLength}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
        {error ? (
          <span className="fld-bad" aria-hidden="true">
            <IconX />
          </span>
        ) : null}
        {isPassword ? (
          <button
            type="button"
            className="fld-trail"
            aria-label={revealed ? "Hide password" : "Show password"}
            onClick={() => setRevealed((current) => !current)}
          >
            {revealed ? <IconEyeOff /> : <IconEye />}
          </button>
        ) : null}
      </div>
    </Shell>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  placeholder,
  className,
  minHeight = 120,
  extra,
  hint,
  error,
  maxLength,
  showCount = false,
  optional,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  extra?: ReactNode;
  hint?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
  optional?: boolean;
}) {
  const id = useId();
  return (
    <div className={`fld${error ? " is-bad" : ""}${className ? ` ${className}` : ""}`}>
      <div className="fld-top">
        <label className="fld-label" htmlFor={id}>
          {label}
          {optional ? <em>(Optional)</em> : null}
        </label>
        {extra}
        {showCount && maxLength ? <span className="fld-count">{value.length}/{maxLength}</span> : null}
      </div>
      <div className="fld-box is-area">
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{ minHeight }}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {error ? (
        <p className="fld-note is-bad" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="fld-note">{hint}</p>
      ) : null}
    </div>
  );
}

export function CheckRow({
  label,
  checked,
  onChange,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <label className={`check${className ? ` ${className}` : ""}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="check-box" aria-hidden="true">
        <IconCheck />
      </span>
      <span className="check-text">{label}</span>
    </label>
  );
}

/* ---------------------------------------------------------- dropdowns ---- */

type Anchor = { top: number; left: number; width: number; drop: "down" | "up"; max: number };

/**
 * Works out where a popover should sit: under the trigger when there is room,
 * flipped above when there is not, clamped to the viewport on both axes.
 */
function anchorTo(node: HTMLElement | null, wanted = 300): Anchor | null {
  if (!node) return null;
  const box = node.getBoundingClientRect();
  const below = window.innerHeight - box.bottom - 12;
  const above = box.top - 12;
  const drop = below < Math.min(wanted, 220) && above > below ? "up" : "down";
  const max = Math.max(160, Math.min(wanted, drop === "down" ? below : above));
  const width = Math.max(box.width, 240);
  const left = Math.min(Math.max(8, box.left), Math.max(8, window.innerWidth - width - 8));
  return {
    top: drop === "down" ? box.bottom + 8 : box.top - 8,
    left,
    width,
    drop,
    max,
  };
}

/** Keeps a popover glued to its trigger while the page moves under it. */
function useAnchor(open: boolean, ref: React.RefObject<HTMLElement | null>, wanted?: number) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const measure = useCallback(() => {
    setAnchor(anchorTo(ref.current, wanted));
  }, [ref, wanted]);

  useLayoutEffect(() => {
    if (!open) {
      setAnchor(null);
      return;
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  return anchor;
}

function useOutside(open: boolean, onClose: () => void) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (root.current?.contains(target)) return;
      if (target?.closest(".pop")) return;
      onClose();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, onClose]);
  return root;
}

export function SearchSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  allowCustom = false,
  disabled = false,
  className,
  hint,
  error,
  searchable,
  optional,
  hideLabel,
  emptyLabel,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (id: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  disabled?: boolean;
  className?: string;
  hint?: string;
  error?: string;
  searchable?: boolean;
  optional?: boolean;
  /** For a control whose group already carries the label, e.g. a date pair. */
  hideLabel?: boolean;
  /** Shown when the list has no rows, for example while countries are loading. */
  emptyLabel?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const root = useOutside(open, () => setOpen(false));
  const anchor = useAnchor(open, trigger, 320);

  const selected = options.find((item) => item.id === value);
  const filter = searchable ?? options.length > 7;

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((item) => item.name.toLowerCase().includes(needle) || item.id.toLowerCase().includes(needle));
  }, [options, query]);

  const custom = allowCustom && query.trim() && !shown.some((item) => item.name.toLowerCase() === query.trim().toLowerCase());
  const rowCount = shown.length + (custom ? 1 : 0);

  const show = () => {
    if (disabled) return;
    setQuery("");
    const index = Math.max(0, options.findIndex((item) => item.id === value));
    setActive(index);
    setOpen(true);
    requestAnimationFrame(() => (filter ? search.current?.focus() : list.current?.focus()));
  };

  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) trigger.current?.focus();
  };

  const pick = (next: string) => {
    onChange(next);
    close();
  };

  // keep the highlighted row inside view as the arrows move it
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKeys = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!rowCount) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + rowCount) % rowCount);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(0, rowCount - 1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (custom && active === shown.length) pick(query.trim());
      else if (shown[active]) pick(shown[active].id);
    }
  };

  return (
    <div className={`fld${error ? " is-bad" : ""}${className ? ` ${className}` : ""}`} ref={root}>
      {hideLabel ? null : (
        <div className="fld-top">
          <span className="fld-label" id={`${id}-label`}>
            {label}
            {optional ? <em>(Optional)</em> : null}
          </span>
        </div>
      )}
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={hideLabel ? label : undefined}
        aria-labelledby={hideLabel ? undefined : `${id}-label`}
        disabled={disabled}
        className={`fld-box fld-trigger${open ? " is-open" : ""}`}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            show();
          }
        }}
      >
        <em className={selected ? "" : "is-empty"}>{selected?.name || value || placeholder}</em>
        <Chevron />
      </button>

      {error ? (
        <p className="fld-note is-bad" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="fld-note">{hint}</p>
      ) : null}

      {open && anchor && typeof document !== "undefined" && createPortal(
        <div
          className={`pop drop-${anchor.drop}`}
          style={{
            top: anchor.drop === "down" ? anchor.top : undefined,
            bottom: anchor.drop === "up" ? window.innerHeight - anchor.top : undefined,
            left: anchor.left,
            width: anchor.width,
            maxHeight: anchor.max,
          }}
        >
          {filter ? (
            <div className="pop-search">
              <IconSearch />
              <input
                ref={search}
                value={query}
                placeholder={`Search ${label.toLowerCase()}`}
                aria-label={`Search ${label}`}
                aria-controls={listId}
                onKeyDown={onKeys}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
              />
            </div>
          ) : null}
          <ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={filter ? -1 : 0}
            aria-label={label}
            className="pop-list"
            onKeyDown={filter ? undefined : onKeys}
          >
            {shown.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.id === value}
                  data-active={index === active}
                  className={item.id === value ? "pop-row is-picked" : "pop-row"}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => pick(item.id)}
                >
                  <span className="pop-name">
                    {item.name}
                    {item.hint ? <small>{item.hint}</small> : null}
                  </span>
                  {item.id === value ? <IconCheck /> : null}
                </button>
              </li>
            ))}

            {custom ? (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  data-active={active === shown.length}
                  className="pop-row is-new"
                  onMouseEnter={() => setActive(shown.length)}
                  onClick={() => pick(query.trim())}
                >
                  <span className="pop-name">Use “{query.trim()}”</span>
                </button>
              </li>
            ) : null}

            {!rowCount ? (
              <li className="pop-empty">{emptyLabel || `Nothing matches “${query.trim()}”`}</li>
            ) : null}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}

/** A country dropdown whose options come from the public country list. */
export function CountrySelect({
  label = "Country",
  value,
  onChange,
  optional = true,
  className,
}: {
  label?: string;
  value: string;
  onChange: (name: string) => void;
  optional?: boolean;
  className?: string;
}) {
  const { countries, ready } = useCountries();
  const options = useMemo(
    () => countries.map((country) => ({ id: country.name, name: country.name })),
    [countries],
  );
  return (
    <SearchSelect
      label={label}
      optional={optional}
      className={className}
      value={value}
      options={options}
      placeholder={ready ? "Select a country" : "Loading countries…"}
      emptyLabel={ready ? undefined : "Loading countries…"}
      onChange={onChange}
    />
  );
}

function matchRank(item: string, needle: string) {
  if (!needle) return 1;
  const hay = item.toLowerCase();
  if (hay === needle) return 0;
  if (hay.startsWith(needle) && (hay.length === needle.length || hay[needle.length] === " ")) return 1;
  if (hay.split(/[^a-z0-9+#.]+/).some((word) => word.startsWith(needle))) return 2;
  if (hay.includes(needle)) return 3;
  return 4;
}

export function SearchTags({
  label,
  values,
  suggestions,
  onChange,
  placeholder = "Type to add",
  hint,
  max = 24,
  lookup,
  group,
}: {
  label: string;
  values: string[];
  suggestions: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
  max?: number;
  /** Also search public skill lists as you type. */
  lookup?: "skill" | "occupation";
  /** Which skill field this is, so tools can include Stack Overflow tags. */
  group?: "industry" | "tools" | "other";
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const root = useOutside(open, () => setOpen(false));
  const anchor = useAnchor(open, wrap, 260);

  const [remote, setRemote] = useState<string[]>([]);

  // ask the classification once typing settles, so a keystroke is never a request
  useEffect(() => {
    if (!lookup) return;
    const needle = query.trim();
    if (needle.length < 2) {
      setRemote([]);
      return;
    }
    let stale = false;
    const timer = window.setTimeout(() => {
      searchSkills(needle, lookup, group)
        .then((result) => {
          if (!stale) setRemote(result.results);
        })
        .catch(() => {
          if (!stale) setRemote([]);
        });
    }, 260);
    return () => {
      stale = true;
      window.clearTimeout(timer);
    };
  }, [query, lookup, group]);

  const options = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const seen = new Set(values.map((item) => item.toLowerCase()));
    const ranked = [...suggestions, ...remote]
      .map((item, index) => ({ item, index, score: matchRank(item, needle) }))
      .filter((row) => row.score < 4)
      .sort((a, b) => a.score - b.score || a.index - b.index);
    const out: string[] = [];
    for (const row of ranked) {
      const key = row.item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(row.item);
      if (out.length >= 12) break;
    }
    return out;
  }, [suggestions, remote, query, values]);
  const known = new Set([...suggestions, ...remote].map((item) => item.toLowerCase()));
  const custom = Boolean(query.trim()) && !known.has(query.trim().toLowerCase());
  const rowCount = options.length + (custom ? 1 : 0);

  const add = (next: string) => {
    const value = next.trim();
    setQuery("");
    setActive(0);
    if (!value || values.includes(value) || values.length >= max) return;
    onChange([...values, value]);
    input.current?.focus();
  };

  return (
    <div className="fld" ref={root}>
      <div className="fld-top">
        <label className="fld-label" htmlFor={id}>
          {label}
        </label>
      </div>

      <div
        ref={wrap}
        className={`fld-box fld-tags${open ? " is-open" : ""}`}
        onClick={() => {
          setOpen(true);
          input.current?.focus();
        }}
      >
        {values.map((tag) => (
          <span key={tag} className="tag">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={(event) => {
                event.stopPropagation();
                onChange(values.filter((item) => item !== tag));
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          ref={input}
          value={query}
          placeholder={values.length ? "" : placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              if (options[active]) add(options[active]);
              else add(query);
              return;
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              if (!rowCount) return;
              event.preventDefault();
              const step = event.key === "ArrowDown" ? 1 : -1;
              setActive((current) => (current + step + rowCount) % rowCount);
              return;
            }
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Backspace" && !query && values.length) onChange(values.slice(0, -1));
          }}
        />
      </div>

      {hint ? <p className="fld-note">{hint}</p> : null}

      {open && anchor && rowCount > 0 && typeof document !== "undefined" && createPortal(
        <div
          className={`pop drop-${anchor.drop}`}
          style={{
            top: anchor.drop === "down" ? anchor.top : undefined,
            bottom: anchor.drop === "up" ? window.innerHeight - anchor.top : undefined,
            left: anchor.left,
            width: anchor.width,
            maxHeight: anchor.max,
          }}
        >
          <ul className="pop-list" role="listbox" aria-label={label}>
            {options.map((item, index) => (
              <li key={item}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  data-active={index === active}
                  className="pop-row"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => add(item)}
                >
                  <span className="pop-name">{item}</span>
                </button>
              </li>
            ))}
            {custom ? (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  data-active={active === options.length}
                  className="pop-row is-new"
                  onMouseEnter={() => setActive(options.length)}
                  onClick={() => add(query)}
                >
                  <span className="pop-name">Add “{query.trim()}”</span>
                </button>
              </li>
            ) : null}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}

export function DateFields({
  start,
  end,
  current,
  onStart,
  onEnd,
  onCurrent,
}: {
  start: string;
  end: string;
  current: boolean;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
  onCurrent: (value: boolean) => void;
}) {
  const from = parseMonthYear(start);
  const to = parseMonthYear(end);
  return (
    <>
      <div className="fld">
        <div className="fld-top">
          <span className="fld-label">Start date</span>
        </div>
        <div className="date-row">
          <SearchSelect
            hideLabel
            label="Start year"
            value={from.year}
            options={YEARS}
            placeholder="Year"
            onChange={(year) => onStart(joinMonthYear(from.month, year))}
          />
          <SearchSelect
            hideLabel
            label="Start month"
            value={from.month}
            options={MONTHS}
            placeholder="Month"
            onChange={(month) => onStart(joinMonthYear(month, from.year))}
          />
        </div>
      </div>

      <div className="fld">
        <div className="fld-top">
          <span className="fld-label">End date</span>
        </div>
        <div className="date-row">
          <SearchSelect
            hideLabel
            label="End year"
            value={current ? "" : to.year}
            options={YEARS}
            placeholder={current ? "Present" : "Year"}
            disabled={current}
            onChange={(year) => onEnd(joinMonthYear(to.month, year))}
          />
          <SearchSelect
            hideLabel
            label="End month"
            value={current ? "" : to.month}
            options={MONTHS}
            placeholder={current ? "Present" : "Month"}
            disabled={current}
            onChange={(month) => onEnd(joinMonthYear(month, to.year))}
          />
        </div>
        <CheckRow label="I currently work here" checked={current} onChange={onCurrent} />
      </div>
    </>
  );
}
