import { ImageResponse } from "workers-og";
import type { AssessmentDoc } from "../src/lib/schema/assessment";
import { escapeHtml } from "./ssrShell";

const PLATFORM_LABELS: Record<string, string> = {
  hn: "Hacker News",
  reddit: "Reddit",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
};

const FONT_URL = "https://cdn.jsdelivr.net/fontsource/fonts/archivo@latest/latin-700-normal.woff";

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(FONT_URL, { cf: { cacheTtl: 86_400, cacheEverything: true } } as RequestInit);
  fontCache = await res.arrayBuffer();
  return fontCache;
}

/**
 * 1200x630 social preview card. Deliberately minimal (flexbox + one font, no
 * emoji rasterization) to stay inside the free-tier CPU budget; rendered once
 * per slug and cached at the edge by the caller.
 */
export async function ogImage(doc: AssessmentDoc): Promise<Response> {
  const platform = PLATFORM_LABELS[doc.metadata.platform] ?? doc.metadata.platform;
  const traits = doc.traits.slice(0, 3);
  const captions = doc.emojiSummary
    .slice(0, 3)
    .map((e) => escapeHtml(e.caption))
    .join(" · ");

  // Riso print palette: two inks (blue #2f4daa, orange #c74e2d) on warm paper.
  const traitBars = traits
    .map(
      (t) => `
      <div style="display:flex; align-items:center; gap:16px; width:100%;">
        <div style="display:flex; flex:0 0 320px; max-width:320px; overflow:hidden; font-size:24px; color:#3d4460; white-space:nowrap;">${escapeHtml(t.name)}</div>
        <div style="display:flex; flex:1 1 0px; height:18px; background:#e9e2d2; border:2px solid #2f4daa; border-radius:2px;">
          <div style="display:flex; width:${Math.round(t.score)}%; height:14px; background:#2f4daa;"></div>
        </div>
        <div style="display:flex; flex:0 0 60px; justify-content:flex-end; font-size:24px; color:#c74e2d;">${Math.round(t.score)}</div>
      </div>`,
    )
    .join("");

  const html = `
  <div style="display:flex; flex-direction:column; width:1200px; height:630px; background:#f4efe6; padding:64px; font-family:'Archivo'; justify-content:space-between; border:14px solid #2f4daa;">
    <div style="display:flex; flex-direction:column; gap:18px;">
      <div style="display:flex; font-size:26px; color:#6b7188; text-transform:uppercase; letter-spacing:2px;">@${escapeHtml(doc.metadata.username)} on ${escapeHtml(platform)} · ${doc.metadata.counts.analyzedItems} items analyzed</div>
      <div style="display:flex; font-size:50px; font-weight:700; color:#232633; line-height:1.08; text-transform:uppercase;">${escapeHtml(doc.essay.title.slice(0, 120))}</div>
      <div style="display:flex; font-size:26px; color:#3d4460;">${captions}</div>
    </div>
    <div style="display:flex; flex-direction:column; gap:20px;">${traitBars}</div>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; font-size:26px; font-weight:700; color:#c74e2d; text-transform:uppercase; letter-spacing:1px;">Selbstbild</div>
      <div style="display:flex; font-size:21px; color:#6b7188;">BYOK · analysis ran in the sharer's own browser</div>
    </div>
  </div>`;

  const font = await loadFont();
  // satori treats inter-tag whitespace as child text nodes — strip it.
  const compact = html.replace(/>\s+</g, "><").trim();
  return new ImageResponse(compact, {
    width: 1200,
    height: 630,
    fonts: [{ name: "Archivo", data: font, weight: 700, style: "normal" }],
  });
}
