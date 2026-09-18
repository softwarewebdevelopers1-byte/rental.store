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
  login: (email: string, password: string) => Promise<void>;
  loginAsRole: (role: UserRole) => Promise<void>;
  registerStudent: (input: RegisterStudentInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    storage.get<AuthSession>("auth.session"),
  );

  useEffect(() => {
    if (session) storage.set("auth.session", session);
    else storage.remove("auth.session");
  }, [session]);

  const login = useCallback(async (email: string, password: string) => {
    const s = await authService.login({ email, password });
    setSession(s);
  }, []);

  const loginAsRole = useCallback(async (role: UserRole) => {
    const s = await authService.loginAsRole(role);
    setSession(s);
  }, []);

  const registerStudent = useCallback(async (input: RegisterStudentInput) => {
    const s = await authService.registerStudent(input);
    setSession(s);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
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
    }),
    [session, login, loginAsRole, registerStudent, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
