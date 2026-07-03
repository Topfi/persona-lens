import type { AssessmentDoc } from "../src/lib/schema/assessment";
import type { Env } from "./share";

const PLATFORM_LABELS: Record<string, string> = {
  hn: "Hacker News",
  reddit: "Reddit",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
};

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Serve the SPA's index.html with OG meta tags injected for a share URL, so
 * link unfurlers (which don't run JS) get a real title/description/image.
 */
export async function shareShell(env: Env, request: Request, slug: string, doc: AssessmentDoc | null): Promise<Response> {
  const assetRes = await env.ASSETS.fetch(new Request(new URL("/", request.url)));
  let html = await assetRes.text();

  if (doc) {
    const platform = PLATFORM_LABELS[doc.metadata.platform] ?? doc.metadata.platform;
    const title = escapeHtml(`${doc.essay.title} — @${doc.metadata.username} on ${platform}`);
    const description = escapeHtml(doc.essay.tldr.slice(0, 280));
    const image = `${new URL(request.url).origin}/og/${slug}.png`;
    const meta = [
      `<meta property="og:type" content="article" />`,
      `<meta property="og:title" content="${title}" />`,
      `<meta property="og:description" content="${description}" />`,
      `<meta property="og:image" content="${image}" />`,
      `<meta property="og:url" content="${new URL(request.url).origin}/s/${slug}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${title}" />`,
      `<meta name="twitter:description" content="${description}" />`,
      `<meta name="twitter:image" content="${image}" />`,
      `<meta name="robots" content="noindex" />`,
    ].join("\n    ");
    html = html.replace("<!--OG-->", meta);
  }

  return new Response(html, {
    status: doc ? 200 : 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": doc ? "public, max-age=300" : "no-store",
    },
  });
}
