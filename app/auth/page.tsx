"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, signup, seedAdmin, getSession } from "@/lib/auth";

type Mode = "login" | "signup";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Read mode from URL immediately — no flash
  const urlMode = searchParams.get("mode");
  const [mode, setMode] = useState<Mode>(urlMode === "signup" ? "signup" : "login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    seedAdmin();
    // If already logged in, redirect
    const session = getSession();
    if (session) {
      router.replace(session.role === "admin" ? "/admin" : "/");
    }
  }, [router]);

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


        {/* ── Continue with Google ── */}
        <button
          id="auth-google"
          type="button"
          className="auth-google-btn"
          onClick={() => alert("Google Sign-In: Configure Google Client ID in environment to enable.")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <span className="auth-divider-line" />
        </div>

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

        /* ── Google Button ── */
        .auth-google-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 13px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          color: #fff; font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          margin-bottom: 4px;
        }
        .auth-google-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }
        .auth-google-btn:active { transform: translateY(0); }

        /* ── Divider ── */
        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 8px 0 4px;
        }
        .auth-divider-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .auth-divider-text {
          font-size: 12px; color: rgba(255,255,255,0.3); font-weight: 500;
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
