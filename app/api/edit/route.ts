import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { html, instruction } = await request.json();

    if (!html || !html.trim()) {
      return NextResponse.json(
        { error: "Website HTML is required" },
        { status: 400 }
      );
    }

    if (!instruction || !instruction.trim()) {
      return NextResponse.json(
        { error: "Edit instruction is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are an expert senior frontend developer and UI/UX designer.

You are editing an existing website.

IMPORTANT RULES:
- Return ONLY the complete updated HTML document.
- NEVER use markdown.
- NEVER use triple backticks.
- Start directly with <!DOCTYPE html>.
- Preserve existing functionality unless the user explicitly asks to change it.
- Preserve existing sections unless the user asks to remove them.
- Make only the changes requested by the user.
- Keep the website professional and visually polished.
- Maintain excellent color contrast.
- Make the website responsive on mobile, tablet and desktop.
- Keep CSS inside the <style> tag.
- Keep JavaScript inside the <script> tag when required.
- Do not explain your changes.
- Do not add comments explaining your response.
- Do not output anything outside the HTML document.

The final response MUST begin with:
<!DOCTYPE html>
`;

    const userPrompt = `
CURRENT WEBSITE:

${html}

-----------------------------------

USER REQUEST:

${instruction}

-----------------------------------

Return the complete updated HTML website.
`;

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen2.5-coder:7b",
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          options: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    let updatedHtml = data.response.trim();

    // Remove markdown fences if the model accidentally adds them
    updatedHtml = updatedHtml.replace(/^```html\s*/i, "");
    updatedHtml = updatedHtml.replace(/^```\s*/i, "");
    updatedHtml = updatedHtml.replace(/\s*```$/i, "");

    // If model returned text before <!DOCTYPE html>, remove it
    const htmlStart = updatedHtml.toLowerCase().indexOf("<!doctype html>");

    if (htmlStart > 0) {
      updatedHtml = updatedHtml.substring(htmlStart);
    }

    return NextResponse.json({
      html: updatedHtml.trim(),
    });
  } catch (error) {
    console.error("Edit error:", error);

    return NextResponse.json(
      {
        error:
          "Failed to edit website. Make sure Ollama is running.",
      },
      { status: 500 }
    );
  }
}