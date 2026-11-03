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
