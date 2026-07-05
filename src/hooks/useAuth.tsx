import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  continueAsGuest,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  isCloudAuthAvailable,
} from "@/services/authService";
import { syncWithCloud } from "@/services/syncService";
import { AuthUser } from "@/types/user";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  cloudAvailable: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  sync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const u = await getCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const u = await signIn(email, password);
    setUser(u);
    await syncWithCloud();
    const { registerPushTokens } = await import("@/services/pushTokenService");
    await registerPushTokens();
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string, name?: string) => {
    const u = await signUp(email, password, name);
    setUser(u);
    await syncWithCloud();
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const handleGuest = useCallback(async () => {
    const u = await continueAsGuest();
    setUser(u);
  }, []);

  const handleSync = useCallback(async () => {
    await syncWithCloud();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cloudAvailable: isCloudAuthAvailable(),
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        continueAsGuest: handleGuest,
        sync: handleSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
