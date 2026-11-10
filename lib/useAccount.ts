"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, loadAccount, signIn, signOut, signUp } from "./api";
import { clearToken, consumeEntitlementRefresh, readToken, writeToken } from "./session";
import type { Account, Entitlement } from "./types";

const NO_ACCESS: Entitlement = { canDownload: false, subscription: null };

export type AccountState = ReturnType<typeof useAccount>;

/**
 * Who is signed in and what they have paid for. One of these lives in Builder
 * and is handed down; the token itself stays in lib/session.
 */
export function useAccount(ownerKey: () => string) {
  const [user, setUser] = useState<Account | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement>(NO_ACCESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!readToken()) {
      setReady(true);
      return;
    }
    let cancelled = false;
    loadAccount()
      .then((result) => {
        if (cancelled) return;
        setUser(result.user);
        setEntitlement(result.entitlement);
      })
      .catch((reason: unknown) => {
        // a token the server no longer knows is worse than no token
        if (reason instanceof ApiError && reason.needsSignIn) clearToken();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const keep = useCallback((result: { token: string; user: Account; entitlement: Entitlement }) => {
    writeToken(result.token);
    setUser(result.user);
    setEntitlement(result.entitlement);
    // handed back so a caller acting on the result doesn't read stale state
    return result.entitlement;
  }, []);

  const register = useCallback(
    async (input: { email: string; name: string; password: string }) => {
      return keep(await signUp({ ...input, ownerKey: ownerKey() }));
    },
    [keep, ownerKey],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      return keep(await signIn({ ...input, ownerKey: ownerKey() }));
    },
    [keep, ownerKey],
  );

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch {
      /* the local session goes either way */
    }
    clearToken();
    setUser(null);
    setEntitlement(NO_ACCESS);
  }, []);

  const refresh = useCallback(async () => {
    if (!readToken()) return;
    try {
      const result = await loadAccount();
      setUser(result.user);
      setEntitlement(result.entitlement);
    } catch {
      /* keep what we have */
    }
  }, []);

  useEffect(() => {
    if (!ready || !readToken()) return;
    if (!consumeEntitlementRefresh()) return;
    void refresh();
  }, [ready, refresh]);

  useEffect(() => {
    if (!readToken()) return;
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return { user, entitlement, ready, register, login, logout, refresh, setEntitlement };
}
