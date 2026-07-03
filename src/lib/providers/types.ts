export interface ModelInfo {
  id: string;
  label: string;
  ctxWindow: number;
  /** USD per million input tokens; undefined = unknown */
  inPerMtok?: number;
  outPerMtok?: number;
}

export interface CompletionRequest {
  system: string;
  user: string;
  /** When set, the model must return JSON matching this schema. */
  jsonSchema?: { name: string; schema: Record<string, unknown> };
  maxTokens: number;
  onDelta?: (text: string) => void;
  signal: AbortSignal;
}

export interface CompletionResult {
  text: string;
  json?: unknown;
  usage: { inputTokens: number; outputTokens: number };
}

export interface LLMProvider {
  id: "anthropic" | "openrouter";
  label: string;
  keyPlaceholder: string;
  keyHost: string;
  listModels(): Promise<ModelInfo[]>;
  complete(model: string, req: CompletionRequest): Promise<CompletionResult>;
  validateKey(): Promise<{ ok: boolean; error?: string }>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
  get retryable(): boolean {
    return this.status === 429 || this.status === 529 || (this.status !== undefined && this.status >= 500);
  }
}
