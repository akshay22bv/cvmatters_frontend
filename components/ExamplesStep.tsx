"use client";

import { useEffect, useState } from "react";
import { Field } from "./Field";
import { IconSearch, IconStar } from "./icons";
import { Monogram } from "./Monogram";
import { StepCard } from "./StepCard";
import { loadGallery } from "@/lib/api";
import type { AccountState } from "@/lib/useAccount";
import { templateName, type Category, type RatingSummary, type ResumeRecord } from "@/lib/types";

/**
 * Browse shared resumes. Rows show the score they already have. Opening a row
 * shows the CV; rating happens on that view, not in the list.
 */
export function ExamplesStep({
  mineId,
  account,
  suggest,
  rated,
  onView,
  onOpen,
}: {
  mineId: string | null;
  account: AccountState;
  /** The field on the reader's own CV, used when the page has no field in the URL. */
  suggest?: Category;
  /** Latest rating written from the CV view, so the list stays in sync. */
  rated?: { id: string; summary: RatingSummary } | null;
  onView: (resume: ResumeRecord | null) => void;
  /** Open the resume when the side preview is not on screen. */
  onOpen?: (resume: ResumeRecord) => void;
}) {
  const [items, setItems] = useState<ResumeRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    loadGallery()
      .then((next) => {
        if (cancelled) return;
        setItems(next);
        const pick = next.find((item) => item.id === selected) || next[0] || null;
        setSelected(pick?.id || null);
        onView(pick);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setSelected(null);
        onView(null);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [account.user]);

  useEffect(() => {
    if (!rated) return;
    setItems((list) => list.map((row) => (row.id === rated.id ? { ...row, rating: rated.summary } : row)));
  }, [rated]);

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? items.filter((item) => {
        const skills = item.data.skills
          ? [...item.data.skills.industry, ...item.data.skills.tools, ...item.data.skills.other]
          : [];
        const roles = (item.data.experience || []).flatMap((job) => [job.role, job.company]);
        const hay = [
          item.data.personal.fullName,
          item.data.personal.title,
          item.category,
          templateName(item.templateId),
          ...skills,
          ...roles,
        ].join(" ").toLowerCase();
        return hay.includes(needle);
      })
    : items;

  const open = (item: ResumeRecord) => {
    setSelected(item.id);
    onView(item);
    onOpen?.(item);
  };

  return (
    <div className="examples-panel">
      <StepCard
        title="Resumes in your field"
        sub="Shared CVs. Open a page to read how they wrote it."
        plain
      >
        <Field
          className="span-all"
          label="Search"
          value={query}
          placeholder="Search names, skills, or job titles"
          icon={<IconSearch />}
          onChange={setQuery}
        />
      </StepCard>

      <div className="example-list">
        {shown.map((item) => {
          const own = Boolean(item.isMine || item.id === mineId);
          const count = item.rating?.count || 0;
          const average = item.rating?.average || 0;
          return (
            <button
              key={item.id}
              type="button"
              className={item.id === selected ? "example is-active" : "example"}
              aria-label={`View ${item.data.personal.fullName || "this resume"}`}
              onClick={() => open(item)}
            >
              <span className="example-open">
                <Monogram name={item.data.personal.fullName} photoUrl={item.data.personal.photoUrl} size={42} />
                <span>
                  <strong>{item.data.personal.fullName || "Untitled"}</strong>
                  <em>{item.data.personal.title || item.category}</em>
                  <small>
                    {templateName(item.templateId)}
                    {own ? " · You" : ""}
                  </small>
                </span>
              </span>
              <span className="example-score" title={count ? `${average.toFixed(1)} from ${count}` : "No ratings yet"}>
                <IconStar filled={count > 0} />
                <b>{count ? average.toFixed(1) : "—"}</b>
                {count > 0 ? <i>({count})</i> : null}
              </span>
            </button>
          );
        })}
        {loaded && !items.length && (
          <p className="empty-note">
            Nobody has shared a resume yet.
          </p>
        )}
        {loaded && items.length > 0 && !shown.length && <p className="empty-note">Nothing matches “{query.trim()}”.</p>}
      </div>
    </div>
  );
}
