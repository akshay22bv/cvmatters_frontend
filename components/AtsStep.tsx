"use client";

import { useState } from "react";
import { IconAlert, IconCheck } from "./icons";
import type { AtsFix, AtsGroupId, AtsReport } from "@/lib/ats";

const TABS: { id: "all" | AtsGroupId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "design", label: "Design" },
  { id: "structure", label: "Structure" },
  { id: "content", label: "Content" },
];

function tone(score: number) {
  if (score >= 75) return "good";
  if (score >= 50) return "mid";
  return "low";
}

/**
 * A live scan of the CV on the page: one score, then the design, structure,
 * and content checks behind it. Warnings open the place that fixes them.
 */
export function AtsStep({ report, onFix }: { report: AtsReport; onFix: (fix: AtsFix) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const checks = report.groups.flatMap((group) => group.checks).filter((check) => tab === "all" || check.group === tab);
  const passed = report.groups.reduce((total, group) => total + group.checks.filter((check) => check.status === "pass").length, 0);
  const total = report.groups.reduce((count, group) => count + group.checks.length, 0);

  return (
    <div className="ats">
      <header className="ats-top">
        <div>
          <h1>ATS check</h1>
          <p className={`ats-verdict is-${tone(report.score)}`}>
            {passed} of {total} pass · {report.label}
          </p>
        </div>
        <div className={`ats-ring is-${tone(report.score)}`} style={{ ["--p" as string]: report.score }} role="img" aria-label={`${report.score} out of 100, ${report.label}`}>
          <span>
            <b>{report.score}</b>
            <small>/100</small>
          </span>
        </div>
      </header>

      <div className="ats-groups" role="tablist" aria-label="Check groups">
        {TABS.map((item) => {
          const group = report.groups.find((entry) => entry.id === item.id);
          const on = tab === item.id;
          return (
            <button key={item.id} type="button" role="tab" aria-selected={on} className={on ? "is-on" : undefined} onClick={() => setTab(item.id)}>
              <strong>{group ? group.score : report.score}</strong>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <ul className="ats-list">
        {checks.map((check) => (
          <li key={check.id} className={check.status === "pass" ? "is-pass" : "is-warn"}>
            <span className="ats-mark" aria-hidden="true">
              {check.status === "pass" ? <IconCheck /> : <IconAlert />}
            </span>
            <div>
              <strong>{check.title}</strong>
              <p>{check.detail}</p>
            </div>
            {check.status === "warn" && check.fix ? (
              <button type="button" onClick={() => onFix(check.fix as AtsFix)}>
                Fix
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {report.repeats.length > 0 && (
        <section className="ats-extra">
          <h2>Opening words</h2>
          <p>A parser does not mind a repeated verb. A person does. These words start more than one bullet.</p>
          <div className="chips">
            {report.repeats.map((item) => (
              <span key={item.word} className="chip">
                {item.word} · {item.count}
              </span>
            ))}
          </div>
        </section>
      )}

      {report.keywords && (
        <section className="ats-extra">
          <h2>Words from the job</h2>
          <p>
            {report.keywords.matched.length} of {report.keywords.matched.length + report.keywords.missing.length} repeated words from the posting already appear.
          </p>
          {report.keywords.missing.length > 0 && (
            <div className="chip-group">
              <p className="chip-label">Missing</p>
              <div className="chips">
                {report.keywords.missing.map((word) => (
                  <span key={word} className="chip">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
          {report.keywords.matched.length > 0 && (
            <div className="chip-group">
              <p className="chip-label">Already on the CV</p>
              <div className="chips">
                {report.keywords.matched.map((word) => (
                  <span key={word} className="chip on">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
