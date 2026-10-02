"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, signup, seedAdmin, getSession } from "@/lib/auth";

type Mode = "login" | "signup";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    seedAdmin();
    // Read ?mode=login or ?mode=signup from URL
    const urlMode = searchParams.get("mode");
    if (urlMode === "signup") setMode("signup");
    else setMode("login");
    // If already logged in, redirect
    const session = getSession();
    if (session) {
      router.replace(session.role === "admin" ? "/admin" : "/");
    }
  }, [router, searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600)); // subtle delay for UX

    if (mode === "signup") {
      if (!name.trim()) { setError("Name is required."); setLoading(false); return; }
      const result = signup(name.trim(), email.trim(), password);
      if (!result.ok) { setError(result.error || "Signup failed."); setLoading(false); return; }
    } else {
      const result = login(email.trim(), password);
      if (!result.ok) { setError(result.error || "Login failed."); setLoading(false); return; }
    }

    const session = getSession();
    router.replace(session?.role === "admin" ? "/admin" : "/");
  }

  return (
    <div className="auth-root">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-grid" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">✦</span>
          <span className="auth-logo-text">AI Builder</span>
        </div>

        <h1 className="auth-title">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in to your AI website builder"
            : "Start building stunning websites with AI"}
        </p>

        {/* Admin hint */}
        {mode === "login" && (
          <div className="auth-hint">
            <span className="auth-hint-badge">👑 Admin</span>
            <span>admin@ai.com &nbsp;/&nbsp; admin123</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" suppressHydrationWarning>
          {mode === "signup" && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="auth-password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          <button
            id="auth-submit"
            type="submit"
            className={`auth-btn ${loading ? "auth-btn-loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : mode === "login" ? (
              "Sign In →"
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                id="auth-switch-signup"
                className="auth-switch-btn"
                onClick={() => { setMode("signup"); setError(""); }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                id="auth-switch-login"
                className="auth-switch-btn"
                onClick={() => { setMode("login"); setError(""); }}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060608;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Animated Background ── */
        .auth-bg { position: absolute; inset: 0; pointer-events: none; }
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .auth-orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #6c3bff, transparent); top: -100px; left: -100px; animation-delay: 0s; }
        .auth-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #0ea5e9, transparent); bottom: -80px; right: -80px; animation-delay: -3s; }
        .auth-orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #f0abfc, transparent); top: 50%; left: 60%; animation-delay: -5s; }
        .auth-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }

        /* ── Card ── */
        .auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          margin: 20px;
          background: rgba(15, 15, 20, 0.85);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(108, 59, 255, 0.15),
                      0 40px 80px rgba(0,0,0,0.6),
                      inset 0 1px 0 rgba(255,255,255,0.06);
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Logo ── */
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .auth-logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6c3bff, #0ea5e9);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 20px rgba(108, 59, 255, 0.4);
        }
        .auth-logo-text { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }

        /* ── Headings ── */
        .auth-title {
          font-size: 28px; font-weight: 800; color: #fff;
          letter-spacing: -0.5px; margin-bottom: 8px;
        }
        .auth-subtitle { font-size: 14px; color: rgba(255,255,255,0.45); margin-bottom: 24px; }

        /* ── Admin Hint ── */
        .auth-hint {
          display: flex; align-items: center; gap: 10px;
          background: rgba(108,59,255,0.12);
          border: 1px solid rgba(108,59,255,0.25);
          border-radius: 10px; padding: 10px 14px;
          font-size: 12.5px; color: rgba(255,255,255,0.6);
          margin-bottom: 20px;
        }
        .auth-hint-badge {
          background: linear-gradient(135deg, #6c3bff, #9d5cff);
          color: #fff; font-size: 11px; font-weight: 700;
          padding: 3px 8px; border-radius: 6px; white-space: nowrap;
        }

        /* ── Form ── */
        .auth-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; }
        .auth-field { display: flex; flex-direction: column; gap: 8px; }
        .auth-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); }

        .auth-input-wrap {
          position: relative; display: flex; align-items: center;
        }
        .auth-input-icon {
          position: absolute; left: 14px; font-size: 15px;
          pointer-events: none; opacity: 0.6;
        }
        .auth-input {
          width: 100%; padding: 13px 14px 13px 42px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #fff;
          font-size: 14px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-input:focus {
          border-color: rgba(108,59,255,0.6);
          background: rgba(108,59,255,0.08);
          box-shadow: 0 0 0 3px rgba(108,59,255,0.15);
        }
        .auth-eye {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          font-size: 16px; opacity: 0.5;
          transition: opacity 0.2s;
          padding: 4px;
        }
        .auth-eye:hover { opacity: 1; }

        /* ── Error ── */
        .auth-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px; padding: 11px 14px;
          font-size: 13px; color: #fca5a5;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        /* ── Submit Button ── */
        .auth-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #6c3bff, #4f8ef7);
          border: none; border-radius: 12px;
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.2px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(108,59,255,0.4);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn:hover:not(:disabled) {
          opacity: 0.9; transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(108,59,255,0.5);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* ── Spinner ── */
        .auth-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Switch link ── */
        .auth-switch { text-align: center; font-size: 13.5px; color: rgba(255,255,255,0.4); }
        .auth-switch-btn {
          background: none; border: none; cursor: pointer;
          color: #818cf8; font-weight: 700; font-size: 13.5px;
          transition: color 0.2s;
        }
        .auth-switch-btn:hover { color: #a5b4fc; }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#060608" }} />}>
      <AuthForm />
    </Suspense>
  );
}
