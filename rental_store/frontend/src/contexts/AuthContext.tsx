import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  authService,
  type RegisterStudentInput,
} from "../services/authService";
import type { AuthSession, User, UserRole } from "../types/user";
import { storage } from "../utils/storage";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  loginAsRole: (role: UserRole) => Promise<AuthSession>;
  registerStudent: (input: RegisterStudentInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(session: AuthSession | null): void {
  if (session) {
    storage.set("auth.session", session);
    localStorage.setItem("auth.token", session.token);
  } else {
    storage.remove("auth.session");
    localStorage.removeItem("auth.token");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    storage.get<AuthSession>("auth.session"),
  );

  useEffect(() => {
    persistSession(session);
  }, [session]);

  const login = useCallback(async (email: string, password: string) => {
    const s = await authService.login({ email, password });
    // Persist before the protected dashboard mounts. Its initial requests
    // must already include the new token.
    persistSession(s);
    setSession(s);
    return s;
  }, []);

  const loginAsRole = useCallback(async (role: UserRole) => {
    const s = await authService.loginAsRole(role);
    persistSession(s);
    setSession(s);
    return s;
  }, []);

  const registerStudent = useCallback(async (input: RegisterStudentInput) => {
    const s = await authService.registerStudent(input);
    persistSession(s);
    setSession(s);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    persistSession(null);
    setSession(null);
  }, []);

  const updateUser = useCallback((user: User) => {
    setSession((current) => (current ? { ...current, user } : current));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: !!session,
      login,
      loginAsRole,
      registerStudent,
      logout,
      updateUser,
    }),
    [session, login, loginAsRole, registerStudent, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
