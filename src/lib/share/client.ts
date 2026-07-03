import type { AssessmentDoc } from "../schema/assessment";
import { forgetDeletionToken, rememberDeletionToken } from "../storage";

export interface ShareResult {
  slug: string;
  url: string;
  deletionToken: string;
}

export async function createShare(doc: AssessmentDoc): Promise<ShareResult> {
  const res = await fetch("/api/share", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-PL-Client": "1" },
    body: JSON.stringify(doc),
  });
  if (res.status === 429) throw new Error("Share rate limit reached — try again in an hour.");
  if (res.status === 413) throw new Error("This assessment is too large to share.");
  if (!res.ok) throw new Error(`Share failed: HTTP ${res.status}`);
  const { slug, deletionToken } = await res.json();
  rememberDeletionToken(slug, deletionToken);
  return { slug, url: `${location.origin}/s/${slug}`, deletionToken };
}

export async function getShare(slug: string): Promise<AssessmentDoc> {
  const res = await fetch(`/api/share/${encodeURIComponent(slug)}`);
  if (res.status === 404) throw new Error("This shared assessment no longer exists (deleted or expired).");
  if (!res.ok) throw new Error(`Could not load share: HTTP ${res.status}`);
  return res.json();
}

export async function deleteShare(slug: string, token: string): Promise<void> {
  const res = await fetch(`/api/share/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 403) throw new Error("Wrong deletion token.");
  if (!res.ok && res.status !== 404) throw new Error(`Delete failed: HTTP ${res.status}`);
  forgetDeletionToken(slug);
}
