import type { ModelInfo } from "./types";

export const ANTHROPIC_MODELS: ModelInfo[] = [
  { id: "claude-fable-5", label: "Claude Fable 5 ★ (frontier)", ctxWindow: 1_000_000, inPerMtok: 10, outPerMtok: 50 },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8 (best quality)", ctxWindow: 1_000_000, inPerMtok: 5, outPerMtok: 25 },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5 (balanced)", ctxWindow: 1_000_000, inPerMtok: 3, outPerMtok: 15 },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 (fast & cheap)", ctxWindow: 200_000, inPerMtok: 1, outPerMtok: 5 },
];

export const OPENROUTER_SUGGESTED: ModelInfo[] = [
  { id: "anthropic/claude-sonnet-5", label: "Claude Sonnet 5", ctxWindow: 1_000_000, inPerMtok: 3, outPerMtok: 15 },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5", ctxWindow: 200_000, inPerMtok: 1, outPerMtok: 5 },
  { id: "openai/gpt-5.2", label: "GPT-5.2", ctxWindow: 400_000 },
  { id: "google/gemini-3-flash", label: "Gemini 3 Flash", ctxWindow: 1_000_000 },
  { id: "deepseek/deepseek-v4", label: "DeepSeek V4", ctxWindow: 160_000 },
];

/** Rough token estimate: ~4 characters per token for English prose. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function costUsd(model: ModelInfo | undefined, inputTokens: number, outputTokens: number): number | undefined {
  if (!model?.inPerMtok || !model?.outPerMtok) return undefined;
  return (inputTokens * model.inPerMtok + outputTokens * model.outPerMtok) / 1_000_000;
}
