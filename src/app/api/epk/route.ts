import { NextResponse } from "next/server";
import { getBio, getStats, getCollaborations, getTracks, getPress } from "@/lib/data";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

/**
 * GET /api/epk
 * Generates a professional Electronic Press Kit (EPK) as a downloadable PDF.
 * Single A4 page with artist photo, bio, stats, collaborations, discography,
 * press quotes, and contact. All data is live from Supabase.
 */
export async function GET() {
  const [bio, stats, collabs, tracks, press] = await Promise.all([
    getBio(),
    getStats(),
    getCollaborations(),
    getTracks(),
    getPress(),
  ]);

  // Read the image file and convert to base64 for embedding in HTML
  // (file:// URLs don't work with Puppeteer's setContent)
  const imagePath = bio.imageUrl
    ? path.join(process.cwd(), "public", bio.imageUrl)
    : path.join(process.cwd(), "public", "assets", "images", "bio.jpg");
  let imageBase64 = "";
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).slice(1).toLowerCase();
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
    imageBase64 = `data:${mime};base64,${imageBuffer.toString("base64")}`;
  } catch {
    // Fallback: no image, just dark background
  }

  const statsHtml = stats
    .map(
      (s) =>
        `<div class="stat"><span class="num">${s.number}</span><span class="lbl">${s.label}</span></div>`
    )
    .join("");

  const collabHtml = collabs
    .slice(0, 5)
    .map(
      (c) =>
        `<li><span class="gold">${c.name}</span><span class="role"> — ${c.role}</span><br><span class="muted">${c.subtitle}</span></li>`
    )
    .join("");

  const tracksHtml = tracks
    .map(
      (t) =>
        `<li><span class="gold">${t.title}</span><span class="muted"> · ${t.category}</span></li>`
    )
    .join("");

  const pressQuotes = press
    .filter((p) => p.type === "recognition")
    .slice(0, 2)
    .map(
      (p) =>
        `<blockquote>${p.quote || p.title}<cite>— ${p.source}</cite></blockquote>`
    )
    .join("");

  const bioShort = (bio.intro || "").slice(0, 400);
  const bioBody = [bio.body1, bio.body2].filter(Boolean).join(" ").slice(0, 500);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>EPK — ARAGAL · Mario Aravena</title>
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #0a0a0a;
    color: #e8e0d0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { width: 210mm; height: 297mm; padding: 0; position: relative; overflow: hidden; display: flex; flex-direction: column; }

  /* === HEADER BAR (compact, ~45mm) === */
  .header {
    position: relative;
    height: 45mm;
    overflow: hidden;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    padding: 0 15mm;
    gap: 6mm;
  }
  .header-photo {
    width: 30mm;
    height: 36mm;
    border-radius: 3px;
    object-fit: cover;
    object-position: center 20%;
    border: 1px solid rgba(212,175,55,0.4);
    flex-shrink: 0;
  }
  .header-text { flex: 1; }
  .header h1 {
    font-size: 36px;
    letter-spacing: 6px;
    color: #d4af37;
    text-transform: uppercase;
    font-weight: bold;
    line-height: 1;
  }
  .header .tagline {
    font-size: 9px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #a0a0a0;
    margin-top: 4px;
  }
  .epk-label {
    font-size: 7px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #d4af37;
    border: 1px solid #d4af37;
    padding: 3px 8px;
    border-radius: 2px;
    margin-top: 5px;
    display: inline-block;
  }

  /* === BODY (fills remaining space) === */
  .body { padding: 8mm 15mm 6mm; flex: 1; display: flex; flex-direction: column; }

  .stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
    padding: 8px 0;
    border-top: 1px solid rgba(212,175,55,0.2);
    border-bottom: 1px solid rgba(212,175,55,0.2);
  }
  .stat { text-align: center; }
  .stat .num { display: block; font-size: 20px; color: #d4af37; font-weight: bold; font-style: italic; }
  .stat .lbl { font-size: 6px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-top: 1px; display: block; }

  .section-title {
    font-size: 8px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #d4af37;
    margin: 10px 0 4px;
    padding-bottom: 2px;
    border-bottom: 1px solid rgba(212,175,55,0.2);
  }

  .bio { font-size: 8.5px; line-height: 1.5; color: #c0b8a8; text-align: justify; }
  .bio p { margin-bottom: 4px; }

  .two-col { display: flex; gap: 12px; margin-top: 2px; }
  .col { flex: 1; }
  .col ul { list-style: none; font-size: 8px; line-height: 1.5; }
  .col li { margin-bottom: 4px; padding-left: 8px; position: relative; }
  .col li::before { content: "—"; position: absolute; left: 0; color: #d4af37; }

  .quotes { margin-top: 4px; }
  .quotes blockquote {
    margin-bottom: 4px;
    padding: 5px 8px;
    border-left: 2px solid #d4af37;
    background: rgba(212,175,55,0.04);
    font-style: italic;
    font-size: 8px;
    line-height: 1.4;
    color: #c8c0b0;
  }
  .quotes cite { display: block; margin-top: 2px; font-style: normal; font-size: 7px; color: #d4af37; }

  .muted { color: #777; font-size: 7px; }
  .role { color: #aaa; font-size: 7.5px; }
  .gold { color: #d4af37; }

  .contact {
    margin-top: 8px;
    padding: 8px 10px;
    background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02));
    border: 1px solid rgba(212,175,55,0.2);
    border-radius: 4px;
  }
  .contact p { font-size: 8px; line-height: 1.4; }
  .links { display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
  .links a { font-size: 7px; color: #d4af37; text-decoration: none; border-bottom: 1px dotted rgba(212,175,55,0.4); }

  .footer {
    text-align: center;
    font-size: 6px;
    color: #444;
    border-top: 1px solid #222;
    padding-top: 5px;
    margin-top: 6px;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
<div class="page">
  <!-- HEADER with photo + title -->
  <div class="header">
    ${imageBase64 ? `<img class="header-photo" src="${imageBase64}" alt="Mario Aravena">` : ""}
    <div class="header-text">
      <h1>ARAGAL</h1>
      <div class="tagline">Mario Aravena · Compositor & Productor Musical</div>
      <div class="epk-label">Electronic Press Kit</div>
    </div>
  </div>

  <!-- BODY -->
  <div class="body">
    <div class="stats">${statsHtml}</div>

    <div class="section-title">Biografía</div>
    <div class="bio">
      <p>${bioShort}</p>
      <p>${bioBody}</p>
    </div>

    <div class="two-col">
      <div class="col">
        <div class="section-title">Colaboraciones</div>
        <ul>${collabHtml}</ul>
      </div>
      <div class="col">
        <div class="section-title">Discografía</div>
        <ul>${tracksHtml}</ul>
      </div>
    </div>

    ${pressQuotes ? `
    <div class="section-title">Reconocimientos</div>
    <div class="quotes">${pressQuotes}</div>
    ` : ""}

    <div class="contact">
      <div class="section-title" style="margin-top:0">Contacto & Streaming</div>
      <p><strong style="color:#d4af37">Booking:</strong> mharavena@yahoo.es</p>
      <div class="links">
        <a>Spotify</a><a>YouTube</a><a>Instagram</a><a>Apple Music</a><a>Amazon Music</a><a>Facebook</a>
      </div>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} ARAGAL — Mario Aravena · EPK · aragal.vercel.app
    </div>
  </div>
</div>
</body>
</html>`;

  // Find the system Chromium
  const chromePaths = [
    "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
    "/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome",
    "/home/z/.agent-browser/browsers/chrome-149.0.7827.115/chrome",
  ];
  let chromePath = "";
  for (const p of chromePaths) {
    try {
      if (fs.existsSync(p)) {
        chromePath = p;
        break;
      }
    } catch {}
  }

  if (!chromePath) {
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="EPK-ARAGAL-Mario-Aravena.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
