"use client";

import { useEffect, useState } from "react";

export function Monogram({ name, photoUrl, size = 40 }: { name: string; photoUrl?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photoUrl]);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CV";

  if (photoUrl && !failed) {
    return (
      <img
        className="mono-photo"
        src={photoUrl}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="mono" style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }} aria-hidden="true">
      {initials}
    </span>
  );
}
