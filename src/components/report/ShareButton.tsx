import { useState } from "react";
import type { AssessmentDoc } from "../../lib/schema/assessment";
import { createShare } from "../../lib/share/client";
import { useStore } from "../../state/store";

/**
 * Privacy-friendly social sharing: plain share-intent links only. No SDKs,
 * no embeds, no third-party requests until the user actually clicks one.
 */
function SocialRow({ url, title }: { url: string; title: string }) {
  const text = `Selbstbild case file: “${title}”`;
  const enc = encodeURIComponent;
  const links = [
    { label: "Bluesky", href: `https://bsky.app/intent/compose?text=${enc(`${text} ${url}`)}` },
    { label: "Mastodon", href: null }, // needs an instance — handled below
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(text)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
  ];

  const shareToMastodon = () => {
    const saved = localStorage.getItem("pl.mastoInstance") ?? "";
    const instance = window.prompt("Your Mastodon instance (the share is composed there, nothing is sent from here):", saved || "mastodon.social");
    if (!instance) return;
    const host = instance.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return;
    localStorage.setItem("pl.mastoInstance", host);
    window.open(`https://${host}/share?text=${enc(`${text} ${url}`)}`, "_blank", "noopener");
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span className="kicker" style={{ fontSize: 11 }}>post to</span>
      {links.map((l) =>
        l.href ? (
          <a key={l.label} className="btn btn--ghost" style={{ padding: "4px 10px", fontSize: 11.5, textDecoration: "none" }} href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        ) : (
          <button key={l.label} className="btn btn--ghost" style={{ padding: "4px 10px", fontSize: 11.5 }} onClick={shareToMastodon}>
            {l.label}
          </button>
        ),
      )}
      {typeof navigator.share === "function" && (
        <button
          className="btn btn--ghost"
          style={{ padding: "4px 10px", fontSize: 11.5 }}
          onClick={() => navigator.share({ title: text, url }).catch(() => {})}
        >
          more…
        </button>
      )}
    </div>
  );
}

export default function ShareButton({ doc }: { doc: AssessmentDoc }) {
  const { shareUrl, shareDeletionToken, set } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"url" | "token" | null>(null);

  const share = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await createShare(doc);
      set({ shareUrl: res.url, shareDeletionToken: res.deletionToken });
    } catch (e: any) {
      setError(e?.message ?? "Share failed.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, which: "url" | "token") => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!shareUrl) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button className="btn btn--primary" onClick={share} disabled={busy}>
          {busy ? "publishing…" : "share this report"}
        </button>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
          Uploads only this finished report (never your key or the raw history). Deletable; expires after 180 days.
        </span>
        {error && <span style={{ color: "var(--danger)", fontSize: 13 }}>{error}</span>}
      </div>
    );
  }

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <a href={shareUrl} style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{shareUrl}</a>
        <button className="btn btn--ghost" onClick={() => copy(shareUrl, "url")}>
          {copied === "url" ? "copied ✓" : "copy link"}
        </button>
      </div>
      {shareDeletionToken && (
        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
          Deletion token (shown once, also saved in this browser):{" "}
          <code style={{ userSelect: "all" }}>{shareDeletionToken}</code>{" "}
          <button className="btn btn--ghost" style={{ padding: "2px 8px" }} onClick={() => copy(shareDeletionToken, "token")}>
            {copied === "token" ? "copied ✓" : "copy"}
          </button>
        </div>
      )}
      <SocialRow url={shareUrl} title={doc.essay.title} />
    </div>
  );
}
