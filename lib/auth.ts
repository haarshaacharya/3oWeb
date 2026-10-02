// ─── Auth Utility ───────────────────────────────────────────────────────────
// Simple localStorage-based auth (no backend needed)
// Admin credentials: admin@ai.com / admin123

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = "ai_builder_users";
const SESSION_KEY = "ai_builder_session";

// ─── Seed admin account on first load ────────────────────────────────────────
export function seedAdmin() {
  if (typeof window === "undefined") return;
  const users = getStoredUsers();
  const adminExists = users.some((u) => u.email === "admin@ai.com");
  if (!adminExists) {
    const admin: StoredUser = {
      id: "admin-001",
      name: "Admin",
      email: "admin@ai.com",
      password: "admin123",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, admin]));
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function signup(name: string, email: string, password: string): { ok: boolean; error?: string } {
  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "Email already registered." };
  }
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password,
    role: "user",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  // Auto-login after signup
  const { password: _p, ...session } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true };
}

export function login(email: string, password: string): { ok: boolean; error?: string } {
  const users = getStoredUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, error: "Invalid email or password." };
  const { password: _p, ...session } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAllUsers(): User[] {
  return getStoredUsers().map(({ password: _p, ...u }) => u);
}

export function deleteUser(id: string) {
  const users = getStoredUsers().filter((u) => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
