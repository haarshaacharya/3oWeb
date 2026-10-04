"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, seedAdmin, type User } from "@/lib/auth";

const quickPrompts = [
  {
    icon: "☕",
    title: "Restaurant",
    description: "Premium restaurant website",
    prompt:
      "Create a premium modern restaurant website with a beautiful navbar, cinematic hero section, menu, about section, gallery, customer reviews, reservation CTA, location/contact section and footer. Use excellent typography, spacing, animations and a premium color palette.",
  },
  {
    icon: "🚀",
    title: "SaaS",
    description: "Modern SaaS landing page",
    prompt:
      "Create a premium modern SaaS landing page with navbar, hero section, product showcase, features, statistics, pricing cards, testimonials, FAQ, strong CTA and footer. Make it look like a high-end startup website with excellent UI/UX.",
  },
  {
    icon: "🎨",
    title: "Portfolio",
    description: "Creative personal portfolio",
    prompt:
      "Create a premium creative portfolio website with navbar, impressive hero section, about me, skills, selected projects, experience, testimonials, contact section and footer. Use modern animations, elegant typography and a visually impressive layout.",
  },
  {
    icon: "🛍️",
    title: "Online Store",
    description: "Premium ecommerce website",
    prompt:
      "Create a premium ecommerce website with navbar, hero banner, product categories, featured products, product cards, special offer section, testimonials, newsletter signup, shopping CTA and footer. Make it look like a professional modern fashion/lifestyle brand.",
  },
];

const quickSuggestions = [
  "Coffee shop",
  "SaaS startup",
  "Restaurant",
  "Portfolio",
  "E-commerce",
];

const loadingSteps = [
  {
    title: "Understanding your idea",
    description: "Analyzing your website requirements",
  },
  {
    title: "Planning the structure",
    description: "Creating sections and page layout",
  },
  {
    title: "Designing the interface",
    description: "Choosing colors, typography and spacing",
  },
  {
    title: "Writing the code",
    description: "Generating your complete website",
  },
  {
    title: "Finishing touches",
    description: "Polishing your website for preview",
  },
];

const maxLength = 4000;

export default function Home() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [session, setSession] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    seedAdmin();
    const s = getSession();
    if (s) setSession(s);
    setAuthReady(true);

    try {
      const savedPrompt =
        sessionStorage.getItem("websitePrompt") ||
        localStorage.getItem("websitePrompt") ||
        "";

      if (savedPrompt) {
        setPrompt(savedPrompt);
      }
    } catch (error) {
      console.error("Prompt restore error:", error);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [router]);

  function startLoadingSteps() {
    setLoadingStep(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setLoadingStep((current) => {
        if (current < loadingSteps.length - 1) {
          return current + 1;
        }

        return current;
      });
    }, 1800);
  }

  function stopLoadingSteps() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function isValidGeneratedHTML(html: unknown): html is string {
    if (typeof html !== "string") {
      return false;
    }

    const value = html.trim().toLowerCase();

    return (
      value.length > 100 &&
      value.includes("<!doctype html>") &&
      value.includes("<html") &&
      value.includes("<head") &&
      value.includes("<body") &&
      value.includes("</body>") &&
      value.includes("</html>")
    );
  }

  async function generateWebsite(e?: FormEvent) {
    e?.preventDefault();

    const cleanPrompt = prompt.trim();

    if (!cleanPrompt || loading) {
      return;
    }

    if (cleanPrompt.length > maxLength) {
      setError(
        `Your prompt is too long. Maximum ${maxLength} characters allowed.`
      );
      return;
    }

    setLoading(true);
    setError("");
    startLoadingSteps();

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 180000);

      let response: Response;

      try {
        response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: cleanPrompt,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Website generation failed. Server returned ${response.status}.`
        );
      }

      const generatedHTML = data?.html;

      if (!isValidGeneratedHTML(generatedHTML)) {
        throw new Error(
          "AI generated incomplete HTML. Please try again with a slightly more detailed prompt."
        );
      }

      /*
       * Save generated website.
       *
       * sessionStorage:
       * Used by /preview immediately.
       *
       * localStorage:
       * Gives us a backup if sessionStorage is unavailable
       * or the preview page is refreshed.
       */
      try {
        sessionStorage.setItem("generatedHTML", generatedHTML);
        sessionStorage.setItem("websitePrompt", cleanPrompt);

        localStorage.setItem("generatedWebsite", generatedHTML);
        localStorage.setItem("websiteHtml", generatedHTML);
        localStorage.setItem("websitePrompt", cleanPrompt);
      } catch (storageError) {
        console.error("Storage error:", storageError);

        /*
         * If storage fails, still continue to preview.
         * The error is not allowed to block navigation.
         */
      }

      setLoadingStep(loadingSteps.length - 1);

      stopLoadingSteps();

      /*
       * Small delay so the final loading state can be seen.
       */
      await new Promise((resolve) => setTimeout(resolve, 250));

      router.push("/preview");
    } catch (err) {
      stopLoadingSteps();

      console.error("Website generation error:", err);

      if (err instanceof DOMException && err.name === "AbortError") {
        setError(
          "Generation is taking too long. Make sure Ollama is running and try again."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }

      setLoading(false);
    }
  }

  function useTemplate(template: string) {
    if (loading) {
      return;
    }

    setPrompt(template);
    setError("");

    try {
      sessionStorage.setItem("websitePrompt", template);
    } catch {
      // Ignore storage errors.
    }

    setTimeout(() => {
      const textarea = document.getElementById("prompt-box");

      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus();

        textarea.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 80);
  }

  function useSuggestion(item: string) {
    const generatedPrompt = `Create a premium modern ${item.toLowerCase()} website with beautiful UI, responsive design, an impressive hero section, professional sections, smooth animations, high-quality typography, strong CTA buttons and a polished footer. Make it look like a real professional commercial website, not a basic HTML template.`;

    useTemplate(generatedPrompt);
  }

  function clearPrompt() {
    if (loading) {
      return;
    }

    setPrompt("");
    setError("");

    try {
      sessionStorage.removeItem("websitePrompt");
    } catch {
      // Ignore storage errors.
    }

    setTimeout(() => {
      document.getElementById("prompt-box")?.focus();
    }, 50);
  }

  // Show blank screen while auth check is in progress
  if (!authReady) {
    return (
      <div style={{ minHeight: "100vh", background: "#070708", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070708] text-white">
      {/* =========================================
          BACKGROUND
      ========================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-320px] h-[650px] w-[950px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[150px]" />

        <div className="absolute left-[-180px] top-[32%] h-[450px] w-[450px] rounded-full bg-purple-500/[0.025] blur-[150px]" />

        <div className="absolute right-[-180px] top-[48%] h-[450px] w-[450px] rounded-full bg-blue-500/[0.02] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      {/* =========================================
          NAVBAR
      ========================================== */}

      <header className="relative z-20 border-b border-white/[0.07] bg-[#070708]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex items-center transition duration-300 hover:opacity-90"
            aria-label="Go to home"
          >
            <img
              src="/3ologo.png"
              alt="30web"
              className="h-8 sm:h-12 w-auto object-contain transition duration-300 group-hover:scale-105"
            />
          </button>

          {/* Navbar right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {session ? (
              <>
                {session.role === "admin" && (
                  <button
                    type="button"
                    id="nav-admin"
                    onClick={() => router.push("/admin")}
                    style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(108,59,255,0.18)", border: "1px solid rgba(108,59,255,0.35)", color: "#c4b5fd", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                  >
                    👑 Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => router.push("/projects")}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-white/70 transition duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  Projects
                </button>
                {/* User avatar chip */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6c3bff,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                    {session.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</span>
                </div>
                <button
                  id="nav-logout"
                  type="button"
                  onClick={() => { logout(); router.replace("/auth"); }}
                  style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                >
                  ↩ Logout
                </button>
              </>
            ) : (
              <>
                {/* Sign In — ghost style */}
                <button
                  id="nav-signin"
                  type="button"
                  onClick={() => router.push("/auth?mode=login")}
                  style={{
                    padding: "9px 20px", borderRadius: 10,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14, fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)"; }}
                >
                  Sign In
                </button>
                {/* Get Started — filled blue style */}
                <button
                  id="nav-getstarted"
                  type="button"
                  onClick={() => router.push("/auth?mode=signup")}
                  style={{
                    padding: "9px 20px", borderRadius: 10,
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    border: "none",
                    color: "#fff",
                    fontSize: 14, fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(37,99,235,0.6)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(37,99,235,0.4)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================
          HERO
      ========================================== */}

      <section className="relative z-10 mx-auto max-w-[1150px] px-5 pb-24 pt-20 text-center sm:pt-24 lg:pt-28">
        {/* Badge */}

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/65 shadow-[0_0_35px_rgba(255,255,255,0.025)]">
          <span className="text-base">✨</span>

          <span>AI Website Builder</span>

          <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />

          <span className="text-xs text-green-400/80">
            Local AI
          </span>
        </div>

        {/* Heading */}

        <h1 className="mx-auto max-w-[1000px] text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[82px]">
          Build websites
          <br />

          <span className="bg-gradient-to-b from-white/70 via-white/45 to-white/20 bg-clip-text text-transparent">
            with just one prompt.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-[700px] text-base leading-7 text-white/45 sm:text-lg">
          Describe your idea and AI will design, write and build a complete
          website for you in seconds.
        </p>

        {/* =========================================
            PROMPT FORM
        ========================================== */}

        <form
          onSubmit={generateWebsite}
          className="mx-auto mt-12 max-w-[920px]"
          suppressHydrationWarning
        >
          <div
            className={`relative overflow-hidden rounded-2xl border bg-[#0d0d0f] text-left shadow-2xl transition-all duration-500 ${
              loading
                ? "border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.07)]"
                : "border-white/10 hover:border-white/15"
            }`}
          >
            {/* Prompt Header */}

            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-white/35">
                <span className="text-base">✨</span>

                <span>Describe your website</span>
              </div>

              {prompt.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={clearPrompt}
                  className="text-xs text-white/25 transition hover:text-white/70"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Textarea */}

            <textarea
              id="prompt-box"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value.slice(0, maxLength));
                setError("");
              }}
              onKeyDown={(e) => {
                if (
                  (e.ctrlKey || e.metaKey) &&
                  e.key.toLowerCase() === "enter"
                ) {
                  e.preventDefault();

                  if (!loading && prompt.trim()) {
                    generateWebsite();
                  }
                }
              }}
              disabled={loading}
              maxLength={maxLength}
              aria-label="Describe the website you want to create"
              placeholder="e.g. Create a premium coffee shop website with a dark brown theme, menu, reviews and contact section..."
              className="min-h-[190px] w-full resize-none bg-transparent px-6 py-6 text-[15px] leading-7 text-white outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[205px] sm:px-7"
            />

            {/* Toolbar */}

            <div className="flex flex-col gap-4 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs ${
                    prompt.length > maxLength * 0.9
                      ? "text-orange-400"
                      : "text-white/25"
                  }`}
                >
                  {prompt.length}/{maxLength}
                </span>

                <span className="hidden text-xs text-white/15 sm:inline">
                  Ctrl + Enter to generate
                </span>
              </div>

              <button
                type="submit"
                disabled={!prompt.trim() || loading}
                className="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Building...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Generate
                  </>
                )}
              </button>
            </div>

            {/* =========================================
                LOADING PROGRESS
            ========================================== */}

            {loading && (
              <div className="border-t border-white/[0.06] px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />

                    <span className="text-xs font-medium text-white/70">
                      {loadingSteps[loadingStep].title}
                    </span>
                  </div>

                  <span className="text-xs text-white/25">
                    {loadingStep + 1}/{loadingSteps.length}
                  </span>
                </div>

                <div className="mb-3 flex gap-1.5">
                  {loadingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        index <= loadingStep
                          ? "bg-white"
                          : "bg-white/[0.08]"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-white/30">
                  {loadingSteps[loadingStep].description}
                </p>
              </div>
            )}
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-left text-sm text-red-300"
            >
              <span className="mt-0.5">⚠</span>

              <span className="leading-6">{error}</span>
            </div>
          )}
        </form>

        {/* =========================================
            QUICK SUGGESTIONS
        ========================================== */}

        <div className="mx-auto mt-7 flex max-w-[920px] flex-wrap justify-center gap-2">
          {quickSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              disabled={loading}
              onClick={() => useSuggestion(item)}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs text-white/40 transition duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {item}
            </button>
          ))}
        </div>

        {/* =========================================
            QUICK START
        ========================================== */}

        <div className="mx-auto mt-24 max-w-[1050px]">
          <div className="mb-6 text-left">
            <div className="text-sm font-medium text-white/75">
              Start with a template
            </div>

            <div className="mt-1 text-xs text-white/30">
              Pick a starting point and customize it with your own prompt.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {quickPrompts.map((item) => (
              <button
                key={item.title}
                type="button"
                disabled={loading}
                onClick={() => useTemplate(item.prompt)}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-xl transition duration-300 group-hover:bg-white/10 group-hover:scale-105">
                  {item.icon}
                </div>

                <div className="text-sm font-medium text-white/80">
                  {item.title}
                </div>

                <div className="mt-1 text-xs text-white/30">
                  {item.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================
            FEATURES
        ========================================== */}

        <div id="features" className="mx-auto mt-24 max-w-[950px] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015]">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <Feature
              icon="⚡"
              title="Generate in seconds"
              text="Turn a simple idea into a complete website using local AI."
            />

            <Feature
              icon="🎨"
              title="Premium design"
              text="AI creates polished layouts, typography, spacing and responsive UI."
            />

            <Feature
              icon="💻"
              title="Real HTML"
              text="Get actual website code that can be previewed and customized."
            />
          </div>
        </div>

        {/* =========================================
            HOW IT WORKS
        ========================================== */}

        <div id="how-it-works" className="mx-auto mt-24 max-w-[950px]">
          <div className="mb-10 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/25">
              Simple workflow
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white/80 sm:text-3xl">
              From idea to website.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ProcessCard
              number="01"
              title="Describe"
              text="Tell the AI what kind of website you want."
            />

            <ProcessCard
              number="02"
              title="Generate"
              text="Local AI creates the complete HTML, CSS and JavaScript."
            />

            <ProcessCard
              number="03"
              title="Preview"
              text="Your finished website opens instantly in the preview."
            />
          </div>
        </div>

        {/* =========================================
            BOTTOM CTA
        ========================================== */}

        <div className="mx-auto mt-24 max-w-[700px]">
          <p className="text-sm text-white/25">
            Your idea → AI design → Real website
          </p>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white/80 sm:text-3xl">
            Build your next website with AI.
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/30">
            No templates to manually edit. Just describe what you want.
          </p>

          <button
            type="button"
            onClick={() => {
              const promptBox = document.getElementById("prompt-box");
              if (promptBox) {
                promptBox.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                setTimeout(() => {
                  promptBox.focus();
                }, 500);
              } else {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            }}
            className="group relative mt-7 inline-flex items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white px-7 py-3 text-sm font-semibold text-black shadow-lg transition-all duration-300 ease-out hover:border-white/30 hover:bg-black hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.18)] hover:-translate-y-0.5 active:scale-95"
          >
            {/* Left Dot (Image 2 style: visible by default, collapses on hover) */}
            <span className="flex items-center justify-center overflow-hidden transition-all duration-300 ease-out w-2 mr-2.5 group-hover:w-0 group-hover:mr-0 group-hover:opacity-0 group-hover:scale-0 group-hover:-translate-x-2">
              <span className="h-2 w-2 rounded-full bg-black shrink-0 transition-colors duration-300" />
            </span>

            {/* Button Text */}
            <span className="font-semibold tracking-tight transition-colors duration-300 select-none">
              Start Building
            </span>

            {/* Right Arrow (Image 3 style: hidden by default, expands and slides in on hover) */}
            <span className="flex items-center justify-center overflow-hidden transition-all duration-300 ease-out w-0 ml-0 opacity-0 -translate-x-2 group-hover:w-4 group-hover:ml-2.5 group-hover:opacity-100 group-hover:translate-x-0">
              <svg
                className="h-4 w-4 shrink-0 stroke-[2.5]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================== */}

      {/* =========================================
          FOOTER (Dark Theme with 30logo.png)
      ========================================== */}

      <footer className="relative z-10 mt-28 px-4 pt-8 pb-14 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* Main Footer Card - Single unified dark card */}
          <div className="relative overflow-hidden rounded-[32px] sm:rounded-[44px] border border-white/[0.08] bg-[#070709] px-6 pt-16 pb-14 shadow-[0_20px_80px_rgba(0,0,0,0.8)] sm:px-12 sm:pt-20 lg:px-20 lg:pb-16">

            {/* ── Center Logo (HD, large, sharp) ── */}
            <div className="mb-14 flex w-full items-center justify-center sm:mb-20">
              <img
                src="/r3o.png"
                alt="30web logo"
                style={{
                  imageRendering: "auto",
                  WebkitFontSmoothing: "antialiased",
                }}
                className="w-[85%] sm:w-[80%] md:w-[78%] lg:w-[72%] max-w-[1100px] h-auto object-contain select-none transition-transform duration-500 hover:scale-[1.025]"
              />
            </div>

            {/* ── 3 Columns Navigation ── */}
            <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 border-t border-white/[0.08] pt-10 sm:grid-cols-3 sm:gap-12">

              {/* Column 1: Product */}
              <div className="flex flex-col space-y-3.5 text-left">
                {[
                  { label: "How It Works", target: "how-it-works" },
                  { label: "Features", target: "features" },
                  { label: "FAQ", target: "prompt-box" },
                  { label: "Pricing", target: "prompt-box" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(item.target);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="group flex items-center gap-2 text-left text-sm sm:text-[15px] font-medium text-white/55 transition duration-200 hover:text-white hover:translate-x-1"
                  >
                    <span className="text-white/25 font-bold transition duration-200 group-hover:text-white/70">›</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Column 2: Social */}
              <div className="flex flex-col space-y-3.5 text-left">
                {[
                  { label: "X (Twitter)", href: "https://x.com" },
                  { label: "LinkedIn", href: "https://linkedin.com" },
                  { label: "Instagram", href: "https://instagram.com" },
                  { label: "Discord", href: "https://discord.com" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 text-sm sm:text-[15px] font-medium text-white/55 transition duration-200 hover:text-white hover:translate-x-1"
                  >
                    <span className="text-white/25 font-bold transition duration-200 group-hover:text-white/70">›</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>

              {/* Column 3: Legal */}
              <div className="flex flex-col space-y-3.5 text-left">
                {[
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Cookie Policy", href: "#" },
                  { label: "Support", href: "mailto:support@30web.ai" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-2 text-sm sm:text-[15px] font-medium text-white/55 transition duration-200 hover:text-white hover:translate-x-1"
                  >
                    <span className="text-white/25 font-bold transition duration-200 group-hover:text-white/70">›</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-Footer */}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 px-2 text-xs text-white/30 sm:flex-row">
            <div>© 2026 30web. Built with AI.</div>
            <div className="flex flex-wrap justify-center gap-4">
              <span>AI Powered</span>
              <span>•</span>
              <span>Local AI</span>
              <span>•</span>
              <span>Ollama</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================
   FEATURE COMPONENT
========================================= */

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-white/[0.07] p-6 text-left last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-lg">
        {icon}
      </div>

      <div className="text-sm font-medium text-white/75">
        {title}
      </div>

      <div className="mt-2 text-xs leading-5 text-white/30">
        {text}
      </div>
    </div>
  );
}

/* =========================================
   PROCESS CARD
========================================= */

function ProcessCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.035]">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-xs font-medium tracking-[0.15em] text-white/25">
          STEP
        </span>

        <span className="text-xs text-white/20">
          {number}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-white/75">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-white/30">
        {text}
      </p>
    </div>
  );
}