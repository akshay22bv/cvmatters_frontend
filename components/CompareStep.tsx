"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchSelect } from "./Field";
import { ResumeSheet } from "./ResumeSheet";
import { StepCard } from "./StepCard";
import { Stars } from "./Stars";
import { loadGallery } from "@/lib/api";
import { CATEGORIES, templateName, type Category, type ResumeData, type ResumeRecord } from "@/lib/types";

const PAPER_W = 250;

/** The numbers worth comparing between two resumes. */
function profile(data: ResumeData) {
  const bullets = data.experience.reduce((total, job) => total + job.bullets.filter((line) => line.trim()).length, 0);
  const skills = [...data.skills.industry, ...data.skills.tools, ...data.skills.other];
  const words = [data.summary, ...data.experience.flatMap((job) => job.bullets)].join(" ").trim().split(/\s+/).filter(Boolean).length;
  return {
    roles: data.experience.length,
    bullets,
    perRole: data.experience.length ? Math.round((bullets / data.experience.length) * 10) / 10 : 0,
    skills,
    words,
    sections: {
      Summary: data.summary.trim().length > 0,
      Experience: data.experience.length > 0,
      Education: data.education.length > 0,
      Skills: skills.length > 0,
      ...Object.fromEntries((data.extras || []).filter((extra) => extra.items.some((item) => item.trim())).map((extra) => [extra.title, true])),
    } as Record<string, boolean>,
  };
}

function Paper({ record }: { record: ResumeRecord }) {
  return (
    <div className="cmp-paper" style={{ width: PAPER_W, height: Math.round((PAPER_W * 1123) / 794) }}>
      <div style={{ width: 794, height: 1123, transform: `scale(${PAPER_W / 794})`, transformOrigin: "top left" }}>
        <ResumeSheet templateId={record.templateId} data={record.data} hideContact preview fill />
      </div>
    </div>
  );
}

/**
 * Your resume beside one someone else shared: the same handful of numbers for
 * each, the sections they have that you do not, and the skills they name that
 * yours never mentions.
 */
export function CompareStep({
  mine,
  myTemplate,
  category,
  onCategory,
}: {
  mine: ResumeData;
  myTemplate: string;
  category: Category;
  onCategory: (category: Category) => void;
}) {
  const [items, setItems] = useState<ResumeRecord[]>([]);
  const [againstId, setAgainstId] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    loadGallery(category)
      .then((next) => {
        if (cancelled) return;
        const others = next.filter((item) => !item.isMine);
        setItems(others);
        setAgainstId((current) => (others.some((item) => item.id === current) ? current : others[0]?.id || ""));
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const against = items.find((item) => item.id === againstId) || null;
  const me = useMemo(() => profile(mine), [mine]);
  const them = useMemo(() => (against ? profile(against.data) : null), [against]);

  const missingSections = them
    ? Object.keys(them.sections).filter((name) => them.sections[name] && !me.sections[name])
    : [];
  const missingSkills = them
    ? them.skills.filter((skill) => !me.skills.some((mySkill) => mySkill.toLowerCase() === skill.toLowerCase())).slice(0, 12)
    : [];

  return (
    <>
      <StepCard
        title="How does yours compare?"
        sub="Put your resume beside one someone in your field shared, and see what they cover that you don't."
        grid={false}
        plain
      >
        <div className="cmp-pick">
          <SearchSelect
            label="Field"
            value={category}
            options={CATEGORIES.map((item) => ({ id: item, name: item }))}
            onChange={(id) => onCategory(id as Category)}
          />
          <SearchSelect
            label="Compare against"
            value={againstId}
            options={items.map((item) => ({
              id: item.id,
              name: item.data.personal.fullName || "Someone",
              hint: item.data.personal.title,
            }))}
            placeholder={loaded && !items.length ? "Nobody has shared one yet" : "Pick a resume"}
            disabled={!items.length}
            onChange={setAgainstId}
          />
        </div>
      </StepCard>

      {against && them ? (
        <>
          <StepCard title="Side by side" grid={false}>
            <div className="cmp-row">
              <div className="cmp-col">
                <header>
                  <strong>Yours</strong>
                  <small>{templateName(myTemplate)}</small>
                </header>
                <div className="cmp-paper-wrap">
                  <div className="cmp-paper" style={{ width: PAPER_W, height: Math.round((PAPER_W * 1123) / 794) }}>
                    <div style={{ width: 794, height: 1123, transform: `scale(${PAPER_W / 794})`, transformOrigin: "top left" }}>
                      <ResumeSheet templateId={myTemplate as never} data={mine} preview fill />
                    </div>
                  </div>
                </div>
              </div>

              <div className="cmp-col">
                <header>
                  <strong>{against.data.personal.fullName || "Theirs"}</strong>
                  <small>
                    {against.data.personal.title} · {templateName(against.templateId)}
                  </small>
                </header>
                <div className="cmp-paper-wrap">
                  <Paper record={against} />
                </div>
                {against.rating?.count ? (
                  <Stars value={against.rating.average} count={against.rating.count} size={14} />
                ) : null}
              </div>
            </div>

            <table className="cmp-table">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Yours</th>
                  <th>Theirs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Roles listed</td>
                  <td>{me.roles}</td>
                  <td>{them.roles}</td>
                </tr>
                <tr>
                  <td>Bullet points</td>
                  <td>{me.bullets}</td>
                  <td>{them.bullets}</td>
                </tr>
                <tr>
                  <td>Bullets per role</td>
                  <td>{me.perRole}</td>
                  <td>{them.perRole}</td>
                </tr>
                <tr>
                  <td>Skills named</td>
                  <td>{me.skills.length}</td>
                  <td>{them.skills.length}</td>
                </tr>
                <tr>
                  <td>Words of prose</td>
                  <td>{me.words}</td>
                  <td>{them.words}</td>
                </tr>
              </tbody>
            </table>
          </StepCard>

          <StepCard title="What they have that you don't" grid={false}>
            {missingSections.length === 0 && missingSkills.length === 0 ? (
              <p className="fld-note">Nothing stands out — yours covers everything theirs does.</p>
            ) : null}

            {missingSections.length > 0 && (
              <div className="chip-group">
                <p className="chip-label">Sections you don&apos;t have</p>
                <div className="chips">
                  {missingSections.map((name) => (
                    <span key={name} className="chip">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {missingSkills.length > 0 && (
              <div className="chip-group">
                <p className="chip-label">Skills they name and you don&apos;t</p>
                <div className="chips">
                  {missingSkills.map((skill) => (
                    <span key={skill} className="chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="fld-note">Only borrow what is true of you — a resume that claims someone else&apos;s work reads as one at interview.</p>
          </StepCard>
        </>
      ) : (
        loaded && (
          <StepCard title="Nothing to compare yet" grid={false}>
            <p className="fld-note">
              Nobody in {category} has shared a resume yet. Share yours from Reference CVs so others can learn from it too.
            </p>
          </StepCard>
        )
      )}
    </>
  );
}
