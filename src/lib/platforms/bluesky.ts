import type { PlatformAdapter, RawItem } from "./types";
import { fetchJson, PlatformError } from "./types";

const API = "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed";

export const blueskyAdapter: PlatformAdapter = {
  id: "bluesky",
  label: "Bluesky",
  placeholder: "handle (e.g. jay.bsky.team)",
  requiresAuth: false,

  parseHandle(input) {
    let handle = input.trim().replace(/^@/, "").toLowerCase();
    if (handle.length > 0 && !handle.includes(".")) handle = `${handle}.bsky.social`;
    if (!/^[a-z0-9.-]{4,253}$/.test(handle) || !handle.includes("."))
      return { error: "Enter a full Bluesky handle like name.bsky.social." };
    return { handle };
  },

  async fetchHistory(handle, opts) {
    const items: RawItem[] = [];
    let cursor: string | undefined;
    for (;;) {
      const params = new URLSearchParams({ actor: handle, limit: "100", filter: "posts_with_replies" });
      if (cursor) params.set("cursor", cursor);
      const data = await fetchJson(`${API}?${params}`, { signal: opts.signal }, "Bluesky");
      const feed: any[] = data.feed ?? [];
      for (const entry of feed) {
        if (entry.reason) continue; // skip reposts
        const post = entry.post;
        const text: string = post?.record?.text ?? "";
        if (!text) continue;
        const isReply = Boolean(post.record?.reply);
        const rkey = String(post.uri ?? "").split("/").pop() ?? "";
        items.push({
          id: post.uri,
          kind: isReply ? "comment" : "post",
          text,
          createdAt: Date.parse(post.record?.createdAt ?? post.indexedAt ?? 0),
          url: rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : undefined,
          score: post.likeCount ?? undefined,
        });
      }
      opts.onProgress(items.length, false);
      cursor = data.cursor;
      if (!cursor || feed.length === 0 || items.length >= opts.maxItems) break;
    }
    if (items.length === 0) {
      throw new PlatformError(`No public posts found for "${handle}".`, "Check the handle on bsky.app.");
    }
    items.sort((a, b) => a.createdAt - b.createdAt);
    const sliced = items.slice(-opts.maxItems);
    opts.onProgress(sliced.length, true);
    return sliced;
  },
};
