"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  async function generateWebsite() {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setHtml("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setHtml(data.html);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function editWebsite() {
    if (!editPrompt.trim() || !html) return;

    setEditing(true);
    setError("");

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          instruction: editPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Editing failed");
      }

      setHtml(data.html);
      setEditPrompt("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setEditing(false);
    }
  }

  function startNewWebsite() {
    setHtml("");
    setPrompt("");
    setEditPrompt("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-bold text-black">
            AI
          </div>

          <span className="text-lg font-semibold">
            WebBuilder
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
            Projects
          </button>

          <button className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            Sign in
          </button>
        </div>
      </header>

      {/* Generator */}
      {!html && (
        <section className="flex min-h-[calc(100vh-64px)] flex-col items-center px-6 py-16">
          <div className="w-full max-w-4xl text-center">
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              ✨ AI Website Builder
            </div>

            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              Build websites
              <br />
              <span className="text-zinc-500">
                with just one prompt.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              Describe the website you want and AI will
              generate it for you.
            </p>

            {/* Prompt Box */}
            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-[#111113] p-3 shadow-2xl">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to build..."
                className="min-h-32 w-full resize-none bg-transparent p-4 text-lg text-white outline-none placeholder:text-zinc-600"
                maxLength={2000}
              />

              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="px-2 text-sm text-zinc-600">
                  {prompt.length}/2000
                </span>

                <button
                  onClick={generateWebsite}
                  disabled={!prompt.trim() || loading}
                  className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {loading
                    ? "✨ Building..."
                    : "✨ Generate"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Examples */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                "Portfolio website",
                "SaaS landing page",
                "Restaurant website",
                "Online store",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setPrompt(
                      `Create a modern ${item.toLowerCase()}`
                    )
                  }
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Website Editor */}
      {html && (
        <section className="min-h-[calc(100vh-64px)] p-4 md:p-6">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
            {/* Editor Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Your Website
                </h2>

                <p className="text-sm text-zinc-500">
                  Generated by AI
                </p>
              </div>

              <button
                onClick={startNewWebsite}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
              >
                ← New Website
              </button>
            </div>

            {/* AI Edit Bar */}
            <div className="rounded-2xl border border-white/10 bg-[#111113] p-3">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-black/30 px-4">
                  <span className="mr-3 text-lg">
                    ✨
                  </span>

                  <input
                    value={editPrompt}
                    onChange={(e) =>
                      setEditPrompt(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        editWebsite();
                      }
                    }}
                    placeholder="Ask AI to change your website..."
                    className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>

                <button
                  onClick={editWebsite}
                  disabled={
                    !editPrompt.trim() || editing
                  }
                  className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {editing
                    ? "✨ Updating..."
                    : "✨ Update"}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Make it more premium",
                  "Improve the hero section",
                  "Add a pricing section",
                  "Make it mobile responsive",
                  "Use better colors",
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => setEditPrompt(action)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Preview */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
              <iframe
                title="Generated Website"
                srcDoc={html}
                sandbox="allow-scripts allow-forms"
                className="h-[calc(100vh-260px)] min-h-[600px] w-full border-0"
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}