"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/types";

const STORAGE_KEY = "nepal_petition_users";
const SESSION_KEY = "nepal_petition_session";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadUsers(): Record<string, User> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, User>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function loadSession(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveSession(user: User | null) {
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

// ─── Context types ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  /** Sign an existing voter ID in.  Returns error string or null on success. */
  login: (voterID: string) => string | null;
  /** Register a new user. Returns error string or null on success. */
  register: (data: Omit<User, "id">) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore session on mount (client-only)
  useEffect(() => {
    const saved = loadSession();
    if (saved) setUser(saved);
  }, []);

  const login = useCallback((voterID: string): string | null => {
    const trimmed = voterID.trim().toUpperCase();
    if (!trimmed) return "Please enter your Voter ID.";
    const users = loadUsers();
    const found = Object.values(users).find(
      (u) => u.voterID.toUpperCase() === trimmed,
    );
    if (!found) return "No account found for that Voter ID. Please sign up.";
    setUser(found);
    saveSession(found);
    return null;
  }, []);

  const register = useCallback((data: Omit<User, "id">): string | null => {
    const trimmedID = data.voterID.trim().toUpperCase();
    if (!trimmedID) return "Voter ID is required.";
    if (!data.name.trim()) return "Full name is required.";
    if (!data.dob) return "Date of birth is required.";
    if (!data.constituencyId) return "Please select your constituency.";

    const users = loadUsers();
    const exists = Object.values(users).some(
      (u) => u.voterID.toUpperCase() === trimmedID,
    );
    if (exists)
      return "A user with this Voter ID already exists. Please log in.";

    const newUser: User = {
      ...data,
      voterID: trimmedID,
      id: `${trimmedID}-${Date.now()}`,
    };
    users[newUser.id] = newUser;
    saveUsers(users);
    setUser(newUser);
    saveSession(newUser);
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
