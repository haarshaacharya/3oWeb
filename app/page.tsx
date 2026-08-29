"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    const savedPrompt = sessionStorage.getItem("websitePrompt");

    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
  }, []);

  async function generateWebsite(e?: FormEvent) {
    e?.preventDefault();

    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError("");
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((current) =>
        current < loadingSteps.length - 1 ? current + 1 : current
      );
    }, 2200);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate website");
      }

      sessionStorage.setItem("generatedWebsite", data.html);
      sessionStorage.setItem("websitePrompt", prompt.trim());

      clearInterval(interval);

      router.push("/preview");
    } catch (err) {
      clearInterval(interval);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  function useTemplate(template: string) {
    setPrompt(template);
    setError("");

    setTimeout(() => {
      document.getElementById("prompt-box")?.focus();
    }, 50);
  }

  function clearPrompt() {
    setPrompt("");
    setError("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070708] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[140px]" />

        <div className="absolute left-[-150px] top-[35%] h-[400px] w-[400px] rounded-full bg-purple-500/[0.025] blur-[140px]" />

        <div className="absolute right-[-150px] top-[50%] h-[400px] w-[400px] rounded-full bg-blue-500/[0.02] blur-[140px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 border-b border-white/[0.07] bg-[#070708]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.08)] transition group-hover:scale-105">
              AI
            </div>

            <div className="text-left">
              <div className="text-[17px] font-semibold tracking-tight">
                WebBuilder
              </div>

              <div className="text-[11px] text-white/35">
                AI Website Builder
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/projects")}
            className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            Projects
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-[1150px] px-5 pb-24 pt-20 text-center sm:pt-24 lg:pt-28">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/65 shadow-[0_0_30px_rgba(255,255,255,0.025)]">
          <span className="text-base">✨</span>

          <span>AI Website Builder</span>

          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-green-400/80">Local AI</span>
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-[1000px] text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[82px]">
          Build websites
          <br />
          <span className="bg-gradient-to-b from-white/55 to-white/20 bg-clip-text text-transparent">
            with just one prompt.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-[700px] text-base leading-7 text-white/45 sm:text-lg">
          Describe your idea and AI will design, write and build a complete
          website for you in seconds.
        </p>

        {/* Prompt Box */}
        <form onSubmit={generateWebsite} className="mx-auto mt-12 max-w-[920px]">
          <div
            className={`relative overflow-hidden rounded-2xl border bg-[#0d0d0f] text-left shadow-2xl transition-all ${
              loading
                ? "border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.06)]"
                : "border-white/10 hover:border-white/15"
            }`}
          >
            {/* Prompt Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-white/35">
                <span className="text-base">✨</span>
                Describe your website
              </div>

              {prompt.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={clearPrompt}
                  className="text-xs text-white/25 transition hover:text-white/60"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Textarea */}
            <textarea
              id="prompt-box"
              value={prompt}
              onChange={(e) =>
                setPrompt(e.target.value.slice(0, maxLength))
              }
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  generateWebsite();
                }
              }}
              disabled={loading}
              placeholder="e.g. Create a premium coffee shop website with a dark brown theme, menu, reviews and contact section..."
              className="min-h-[190px] w-full resize-none bg-transparent px-6 py-6 text-[15px] leading-7 text-white outline-none placeholder:text-white/20 disabled:opacity-50 sm:min-h-[205px] sm:px-7"
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
                className="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25 disabled:hover:translate-y-0"
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

            {/* Loading Progress */}
            {loading && (
              <div className="border-t border-white/[0.06] px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/70">
                    {loadingSteps[loadingStep].title}
                  </span>

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
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-left text-sm text-red-300">
              {error}
            </div>
          )}
        </form>

        {/* Quick Suggestions */}
        <div className="mx-auto mt-7 flex max-w-[920px] flex-wrap justify-center gap-2">
          {[
            "Coffee shop",
            "SaaS startup",
            "Restaurant",
            "Portfolio",
            "E-commerce",
          ].map((item) => (
            <button
              key={item}
              type="button"
              disabled={loading}
              onClick={() =>
                useTemplate(
                  `Create a premium modern ${item.toLowerCase()} website with beautiful UI, responsive design, impressive hero section, professional sections, animations and footer.`
                )
              }
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs text-white/40 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white/75 disabled:opacity-30"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Quick Start */}
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
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045] disabled:opacity-30"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-xl transition group-hover:bg-white/10">
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

        {/* Features */}
        <div className="mx-auto mt-24 max-w-[950px] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015]">
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

        {/* Bottom CTA */}
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
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-6 py-7 text-xs text-white/25 sm:flex-row lg:px-10">
          <div>© 2026 WebBuilder. Built with AI.</div>

          <div className="flex gap-4">
            <span>AI Powered</span>
            <span>•</span>
            <span>Local AI</span>
            <span>•</span>
            <span>Ollama</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

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

      <div className="text-sm font-medium text-white/75">{title}</div>

      <div className="mt-2 text-xs leading-5 text-white/30">{text}</div>
    </div>
  );
}