"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const router = useRouter();

  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedHtml =
        sessionStorage.getItem(
          "generatedHTML"
        ) ||
        localStorage.getItem(
          "generatedWebsite"
        ) ||
        localStorage.getItem(
          "websiteHtml"
        ) ||
        localStorage.getItem(
          "generated-html"
        ) ||
        "";

      setHtml(savedHtml);
    } catch (error) {
      console.error(
        "Preview loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              border:
                "3px solid #222",
              borderTop:
                "3px solid #fff",
              borderRadius: "50%",
              animation:
                "spin 1s linear infinite",
              margin:
                "0 auto 20px",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#aaa",
              fontSize: 14,
            }}
          >
            Loading preview...
          </p>

          <style jsx>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </main>
    );
  }

  if (!html) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 620,
            textAlign: "center",
            padding: 42,
            border:
              "1px solid #222",
            background: "#0b0b0b",
            borderRadius: 20,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin:
                "0 auto 22px",
              borderRadius: 18,
              background: "#151515",
              border:
                "1px solid #292929",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              fontSize: 30,
            }}
          >
            ✨
          </div>

          <h1
            style={{
              fontSize: 28,
              margin:
                "0 0 12px",
              fontWeight: 700,
            }}
          >
            No Website Found
          </h1>

          <p
            style={{
              color: "#888",
              lineHeight: 1.7,
              margin:
                "0 auto 28px",
              maxWidth: 450,
              fontSize: 14,
            }}
          >
            Generate a website first
            from the builder and
            then open the preview.
          </p>

          <button
            onClick={() =>
              router.push("/")
            }
            style={{
              border: "none",
              background: "#fff",
              color: "#000",
              padding:
                "13px 24px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Back to Builder
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#050505",
      }}
    >
      <iframe
        title="Generated Website Preview"
        srcDoc={html}
        sandbox="allow-scripts allow-forms allow-modals"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          background: "#fff",
        }}
      />
    </main>
  );
}