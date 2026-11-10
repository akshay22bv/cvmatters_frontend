const TOKEN_KEY = "cv-matters-token";

/** The session token lives in localStorage; the server is the real authority. */
export function readToken() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function writeToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private window: the session just won't outlive the tab */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clean up */
  }
}

const ENTITLEMENT_REFRESH_KEY = "cv-matters-refresh-entitlement";

/** After Cashfree return, Builder reloads subscription from the server. */
export function markEntitlementRefresh() {
  try {
    sessionStorage.setItem(ENTITLEMENT_REFRESH_KEY, "1");
  } catch {
    /* private window */
  }
}

export function consumeEntitlementRefresh() {
  try {
    const hit = sessionStorage.getItem(ENTITLEMENT_REFRESH_KEY);
    if (hit) sessionStorage.removeItem(ENTITLEMENT_REFRESH_KEY);
    return Boolean(hit);
  } catch {
    return false;
  }
}
