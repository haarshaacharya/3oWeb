import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are an expert senior frontend developer and UI/UX designer.

Your job is to generate a complete, beautiful, production-quality website from the user's description.

STRICT OUTPUT RULES:
- Return ONLY the HTML document.
- Start directly with <!DOCTYPE html>
- NEVER use markdown.
- NEVER use triple backticks.
- NEVER write explanations before or after the HTML.
- Include all CSS inside a <style> tag.
- Include JavaScript inside a <script> tag when useful.
- The result must work by directly placing the HTML inside an iframe srcDoc.
- Do not use React.
- Do not use Next.js components.
- Use pure HTML, CSS and JavaScript.
- Make the website fully responsive.
- Use modern CSS.
- Use CSS variables.
- Use smooth animations and hover effects.
- Use professional typography.
- Use rounded cards, shadows, gradients and spacing where appropriate.
- Create a visually impressive website, not a basic HTML template.
- Make the website look like a real professional commercial website.

IMPORTANT IMAGE RULE:
Do NOT use placeholder.com.
Do NOT use via.placeholder.com.
Do NOT use broken or fake image URLs.

If images are required, use reliable Unsplash Source URLs such as:
https://images.unsplash.com/photo-1495474472287-4d71bcdd2085
https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb
https://images.unsplash.com/photo-1445116572660-236099ec97a0

Always add meaningful alt text.

WEBSITE QUALITY:
- Header/navbar
- Hero section
- Main content sections
- Attractive cards
- Call-to-action buttons
- Responsive mobile layout
- Footer
- Consistent color palette
- Professional spacing
- Good visual hierarchy
- Accessible buttons and links

If the user asks for a restaurant, coffee shop, portfolio, SaaS, store or business website, create realistic content relevant to that business.

Do not mention that you are an AI.
Do not explain your code.
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
          prompt: `${systemPrompt}

USER REQUEST:
${prompt}

Generate the complete website now.`,
          stream: false,
          options: {
            temperature: 0.4,
            num_ctx: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    let html = data.response || "";

    // Remove accidental markdown code fences
    html = html
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // If model accidentally puts text before <!DOCTYPE html>
    const doctypeIndex = html.toLowerCase().indexOf("<!doctype html>");

    if (doctypeIndex > 0) {
      html = html.slice(doctypeIndex);
    }

    // If model didn't use doctype but returned <html>
    const htmlIndex = html.toLowerCase().indexOf("<html");

    if (doctypeIndex === -1 && htmlIndex > 0) {
      html = html.slice(htmlIndex);
    }

    return NextResponse.json({
      html,
    });
  } catch (error) {
    console.error("Generation error:", error);

    return NextResponse.json(
      {
        error:
          "Failed to generate website. Make sure Ollama is running on localhost:11434.",
      },
      { status: 500 }
    );
  }
}