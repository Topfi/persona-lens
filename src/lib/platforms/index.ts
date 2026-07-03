import type { PlatformAdapter } from "./types";
import { hnAdapter } from "./hn";
import { redditAdapter } from "./reddit";
import { blueskyAdapter } from "./bluesky";
import { mastodonAdapter } from "./mastodon";

export const platforms: PlatformAdapter[] = [hnAdapter, redditAdapter, blueskyAdapter, mastodonAdapter];

export function getPlatform(id: string): PlatformAdapter {
  const p = platforms.find((a) => a.id === id);
  if (!p) throw new Error(`Unknown platform: ${id}`);
  return p;
}
