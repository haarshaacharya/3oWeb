import { NextRequest, NextResponse } from "next/server";

const MODEL = "qwen2.5-coder:7b";
const OLLAMA_URL = "http://localhost:11434/api/generate";

const SYSTEM_PROMPT = `
You are an elite senior frontend engineer, web designer and UI/UX designer.

Create a complete premium production-quality website from the user's request.

The website will be rendered directly inside an iframe using srcDoc.

ABSOLUTE RULES:

- Return ONLY one complete HTML document.
- Start EXACTLY with <!DOCTYPE html>
- End EXACTLY with </html>
- No Markdown.
- No code fences.
- No explanations.
- No JSON.
- No React.
- No JSX.
- No Next.js.
- No TypeScript.
- No imports.
- No external JavaScript libraries.
- No npm packages.
- Use only HTML, CSS and vanilla JavaScript.
- Everything must be inside ONE HTML document.

HTML structure:

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>...</title>
<meta name="description" content="...">
<style>
...
</style>
</head>
<body>
...
<script>
...
</script>
</body>
</html>

DESIGN:

Create a real commercial-quality website.

Use:

- premium typography
- strong visual hierarchy
- generous whitespace
- modern CSS Grid and Flexbox
- responsive layouts
- CSS variables
- polished buttons
- elegant cards
- subtle borders
- gradients when appropriate
- shadows
- hover effects
- micro interactions
- scroll reveal animations
- professional navigation
- mobile navigation

Do NOT create a beginner HTML template.

Do NOT use:

- Lorem ipsum
- placeholder.com
- via.placeholder.com
- fake image URLs
- broken image URLs
- generic random content
- float layouts
- tables for layout

IMAGES:

When images improve the design, use direct Unsplash images.

Every image must have a meaningful alt attribute.

Use object-fit: cover.

Do not depend on image URLs that are likely to be broken.

TYPOGRAPHY:

Choose typography appropriate for the brand.

You may use Google Fonts through CSS @import when useful.

Possible fonts:

Inter
Manrope
DM Sans
Plus Jakarta Sans
Space Grotesk
Playfair Display
Cormorant Garamond

Choose the typography based on the user's business.

COLOR:

Create a deliberate color system using CSS variables.

Example:

:root {
  --bg: #...;
  --surface: #...;
  --text: #...;
  --muted: #...;
  --accent: #...;
  --border: #...;
}

Choose colors appropriate to the user's request.

LAYOUT:

Use responsive containers.

Use:

max-width
margin auto
padding
grid
flexbox

Create visual variation between sections.

NAVBAR:

Create a professional responsive navbar.

Desktop:
- logo
- navigation
- CTA

Mobile:
- hamburger
- mobile menu

HERO:

Create an impressive hero section.

Include:

- strong headline
- supporting text
- primary CTA
- secondary CTA when useful
- visual/image
- decorative elements when appropriate

SECTIONS:

Only include sections relevant to the user's request.

Possible sections:

- About
- Features
- Services
- Products
- Menu
- Pricing
- Statistics
- Portfolio
- Gallery
- Testimonials
- FAQ
- Contact
- Newsletter
- CTA
- Footer

Do not blindly include every section.

CONTENT:

Generate realistic content based on the user's request.

If the user gives a short prompt, infer a complete professional website concept.

For example, if the user says "coffee shop", create a complete premium coffee brand rather than a simple page.

INTERACTIONS:

Use vanilla JavaScript only when useful.

Possible:

- mobile navigation
- smooth scrolling
- FAQ accordion
- tabs
- modal
- gallery interaction
- form success state
- scroll reveal
- sticky navbar

Forms should not actually send data to a server.

Instead show a friendly client-side success message.

RESPONSIVE:

The website MUST work at:

1440px
1200px
1024px
768px
480px
390px
320px

Use media queries.

Prevent horizontal scrolling.

Use:

html,
body {
  overflow-x: hidden;
}

ACCESSIBILITY:

Use:

- semantic HTML
- proper heading hierarchy
- labels
- alt text
- accessible buttons
- aria-label where appropriate
- keyboard-friendly controls
- good contrast

SEO:

Include:

<title>
<meta name="description">

FINAL CHECK BEFORE OUTPUT:

Make sure:

1. HTML is complete.
2. CSS is inside <style>.
3. JavaScript is inside <script>.
4. No Markdown.
5. No code fences.
6. No explanation.
7. Starts with <!DOCTYPE html>.
8. Ends with </html>.
9. Website is responsive.
10. Website looks premium.

Return ONLY the final HTML.
`;

function cleanHTML(raw: string): string {
  let html = raw.trim();

  // Remove markdown fences if model ignores instruction.
  html = html.replace(/^```html\s*/i, "");
  html = html.replace(/^```HTML\s*/i, "");
  html = html.replace(/^```\s*/i, "");
  html = html.replace(/\s*```$/i, "");

  html = html.trim();

  const doctypeIndex = html
    .toLowerCase()
    .indexOf("<!doctype html>");

  if (doctypeIndex !== -1) {
    html = html.slice(doctypeIndex);
  } else {
    const htmlIndex = html
      .toLowerCase()
      .indexOf("<html");

    if (htmlIndex !== -1) {
      html =
        "<!DOCTYPE html>\n" +
        html.slice(htmlIndex);
    }
  }

  const closingIndex = html
    .toLowerCase()
    .lastIndexOf("</html>");

  if (closingIndex !== -1) {
    html = html.slice(
      0,
      closingIndex + "</html>".length
    );
  }

  return html.trim();
}

function isValidHTML(html: string): boolean {
  const lower = html.toLowerCase();

  return (
    lower.startsWith("<!doctype html>") &&
    lower.includes("<html") &&
    lower.includes("<head") &&
    lower.includes("<body") &&
    lower.includes("</body>") &&
    lower.endsWith("</html>")
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const prompt =
      typeof body?.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (!prompt) {
      return NextResponse.json(
        {
          error: "Prompt is required.",
        },
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        {
          error:
            "Prompt is too long. Maximum 4000 characters.",
        },
        { status: 400 }
      );
    }

    const finalPrompt = `
${SYSTEM_PROMPT}

==================================================
USER WEBSITE REQUEST
==================================================

${prompt}

==================================================
FINAL OUTPUT
==================================================

Generate the complete website now.

Remember:

START:
<!DOCTYPE html>

END:
</html>

Return NOTHING except the HTML document.
`;

    const ollamaResponse = await fetch(
      OLLAMA_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: finalPrompt,
          stream: false,

          options: {
            temperature: 0.25,
            top_p: 0.9,
            num_ctx: 16384,
            repeat_penalty: 1.05,
          },
        }),
      }
    );

    if (!ollamaResponse.ok) {
      const errorText =
        await ollamaResponse.text();

      console.error(
        "Ollama error:",
        ollamaResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          error: `Ollama error: HTTP ${ollamaResponse.status}`,
        },
        { status: 500 }
      );
    }

    const data =
      await ollamaResponse.json();

    const raw =
      typeof data?.response === "string"
        ? data.response
        : "";

    let html = cleanHTML(raw);

    if (!html) {
      return NextResponse.json(
        {
          error:
            "AI returned an empty response. Please try again.",
        },
        { status: 502 }
      );
    }

    if (!isValidHTML(html)) {
      console.error(
        "Invalid generated HTML:",
        html.slice(0, 1000)
      );

      return NextResponse.json(
        {
          error:
            "AI generated incomplete HTML. Try a shorter prompt or generate again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      html,
    });
  } catch (error) {
    console.error(
      "Generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate website. Make sure Ollama is running.",
      },
      { status: 500 }
    );
  }
}