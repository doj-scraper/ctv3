import { useUser, useSignOut } from "@clerk/clerk-react";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/sign-in" } =
    options ?? {};

  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useSignOut();
  const utils = trpc.useUtils();

  // Fetch user from database (synced from Clerk)
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!clerkUser,
  });

  const logout = useCallback(async () => {
    try {
      await signOut();
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }, [signOut, utils]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));

    return {
      user,
      loading: !clerkLoaded || meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(clerkUser && user),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    clerkLoaded,
    clerkUser,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (!clerkLoaded || meQuery.isLoading) return;
    if (state.isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    clerkLoaded,
    meQuery.isLoading,
    state.isAuthenticated,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
