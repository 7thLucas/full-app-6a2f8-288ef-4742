import { useCallback, useEffect, useState } from "react";
import { apiGet } from "./client";
import type { AccountUser } from "./types";

/**
 * Resolves the current marketplace account (customer / shop_owner / admin)
 * from /api/account/me. Returns null when unauthenticated.
 */
export function useAccount() {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<AccountUser>("/api/account/me");
      setAccount(res.success && res.data ? res.data : null);
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { account, loading, refresh, isAuthenticated: !!account };
}
