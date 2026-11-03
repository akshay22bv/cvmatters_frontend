"use client";

import Link from "next/link";
import { Monogram } from "./Monogram";
import { Stars } from "./Stars";
import type { AccountState } from "@/lib/useAccount";
import type { Category, RatingSummary, ResumeData } from "@/lib/types";

/**
 * A public-facing card for this person: photo, name, ATS score, star rating
 * and how many people liked the CV.
 */
export function ProfilePage({
  data,
  category,
  isPublic,
  rating,
  account,
  onShare,
}: {
  data: ResumeData;
  category: Category;
  isPublic: boolean;
  rating?: RatingSummary;
  account: AccountState;
  onShare: () => void;
}) {
  const name = data.personal.fullName.trim() || account.user?.name || "Your name";
  const handle = (name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "you").slice(0, 18);
  const likes = rating?.count || 0;
  const average = rating?.average || 0;

  return (
    <div className="prof">
      <header className="prof-head">
        <Monogram name={name} photoUrl={data.personal.photoUrl} size={96} />
        <div className="prof-who">
          <h1>{name}</h1>
          <p className="prof-handle">@{handle}</p>
          <p className="prof-title">{data.personal.title || "Add a job title"}</p>
          <p className="prof-meta">
            {[data.personal.location, category, isPublic ? `Listed in ${category}` : "Not listed"].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="prof-acts">
          <Link href="/cv/details" className="btn btn-primary">
            Edit CV
          </Link>
          {account.user ? (
            <button type="button" className="btn" onClick={onShare}>
              {isPublic ? "Sharing on" : "List my CV"}
            </button>
          ) : null}
        </div>
      </header>

      <ul className="prof-stats">
        <li>
          <strong>{average ? average.toFixed(1) : "—"}</strong>
          <span>Rating</span>
          <Stars value={average} count={likes} size={14} />
        </li>
        <li>
          <strong>{likes}</strong>
          <span>{likes === 1 ? "Person liked it" : "People liked it"}</span>
          <small>{isPublic ? "From the gallery" : "List the CV to collect likes"}</small>
        </li>
      </ul>

      {data.summary ? <p className="prof-bio">{data.summary.replace(/\*\*|\+\+|\*/g, "")}</p> : null}
    </div>
  );
}
