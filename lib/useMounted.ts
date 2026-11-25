"use client";

import { useEffect, useState } from "react";

/** False on the server and on the first client paint — true after mount. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}