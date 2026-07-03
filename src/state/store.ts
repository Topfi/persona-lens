import { create } from "zustand";
import type { AssessmentDoc, PlatformId } from "../lib/schema/assessment";
import type { PipelineProgress } from "../lib/pipeline/orchestrator";
import type { Depth } from "../lib/pipeline/prompts";

export type ProviderId = "anthropic" | "openrouter";

interface AppState {
  // setup
  providerId: ProviderId;
  platformId: PlatformId;
  handleInput: string;
  depth: Depth;
  modelOverrides: Partial<Record<"reader" | "analyst" | "synthesis", string>>;
  maxItems: number;

  // run state
  stage: "setup" | "fetching" | "estimate" | "running" | "done" | "error";
  fetchedCount: number;
  chosenModels: { reader: string; analyst: string; synthesis: string } | null;
  progress: PipelineProgress | null;
  error: string | null;
  errorHint: string | null;
  result: AssessmentDoc | null;
  abortController: AbortController | null;

  // share
  shareUrl: string | null;
  shareDeletionToken: string | null;

  set: (partial: Partial<AppState>) => void;
  reset: () => void;
}

const initial = {
  providerId: "anthropic" as ProviderId,
  platformId: "hn" as PlatformId,
  handleInput: "",
  depth: "standard" as Depth,
  modelOverrides: {},
  maxItems: 3000,
  stage: "setup" as const,
  fetchedCount: 0,
  chosenModels: null,
  progress: null,
  error: null,
  errorHint: null,
  result: null,
  abortController: null,
  shareUrl: null,
  shareDeletionToken: null,
};

export const useStore = create<AppState>((set) => ({
  ...initial,
  set: (partial) => set(partial),
  reset: () =>
    set((s) => {
      s.abortController?.abort();
      return { ...initial, providerId: s.providerId, platformId: s.platformId, depth: s.depth };
    }),
}));
