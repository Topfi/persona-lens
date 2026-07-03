import type { RawItem } from "../platforms/types";
import { estimateTokens } from "../providers/pricing";

export interface Chunk {
  index: number;
  text: string;
  itemCount: number;
  estTokens: number;
  dateFrom: string;
  dateTo: string;
}

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function formatItem(item: RawItem): string {
  const date = isoDate(item.createdAt);
  const ctx = item.context ? ` | re: ${item.context.slice(0, 120)}` : "";
  return `--- ${date} [${item.kind}]${ctx}\n${item.text}\n`;
}

/**
 * Pack chronologically ordered items into contiguous chunks of roughly
 * `targetTokens` (estimated at ~4 chars/token). A single oversized item
 * becomes its own chunk, truncated to the target.
 */
export function chunkItems(items: RawItem[], targetTokens: number): Chunk[] {
  if (targetTokens <= 0) throw new Error("targetTokens must be positive");
  const sorted = [...items].sort((a, b) => a.createdAt - b.createdAt);
  const chunks: Chunk[] = [];
  let buf: string[] = [];
  let bufTokens = 0;
  let bufCount = 0;
  let bufFrom = "";
  let bufTo = "";

  const flush = () => {
    if (bufCount === 0) return;
    chunks.push({
      index: chunks.length,
      text: buf.join("\n"),
      itemCount: bufCount,
      estTokens: bufTokens,
      dateFrom: bufFrom,
      dateTo: bufTo,
    });
    buf = [];
    bufTokens = 0;
    bufCount = 0;
  };

  for (const item of sorted) {
    let formatted = formatItem(item);
    let tokens = estimateTokens(formatted);
    if (tokens > targetTokens) {
      formatted = formatted.slice(0, targetTokens * 4);
      tokens = targetTokens;
    }
    if (bufCount > 0 && bufTokens + tokens > targetTokens) flush();
    if (bufCount === 0) bufFrom = isoDate(item.createdAt);
    buf.push(formatted);
    bufTokens += tokens;
    bufCount += 1;
    bufTo = isoDate(item.createdAt);
  }
  flush();
  return chunks;
}
