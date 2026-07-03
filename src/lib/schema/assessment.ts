import { z } from "zod";

export const SCHEMA_VERSION = 1;

export const PLATFORM_IDS = ["hn", "reddit", "bluesky", "mastodon"] as const;
export type PlatformId = (typeof PLATFORM_IDS)[number];

const md = (max: number) => z.string().min(1).max(max);

export const essaySectionSchema = z
  .object({
    heading: md(200),
    markdown: md(20_000),
  })
  .strict();

export const emojiSummarySchema = z
  .object({
    emoji: z.string().min(1).max(16),
    caption: md(120),
  })
  .strict();

export const traitSchema = z
  .object({
    name: md(60),
    score: z.number().min(0).max(100),
    evidence: md(500),
  })
  .strict();

export const quoteSchema = z
  .object({
    text: md(1_000),
    date: z.string().max(30).optional(),
    url: z.string().url().max(500).optional(),
    context: z.string().max(300).optional(),
  })
  .strict();

export const assessmentDocSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    metadata: z
      .object({
        platform: z.enum(PLATFORM_IDS),
        username: z.string().min(1).max(120),
        generatedAt: z.string().max(40),
        dateRange: z.object({ from: z.string().max(40), to: z.string().max(40) }).strict(),
        counts: z
          .object({
            comments: z.number().int().min(0),
            posts: z.number().int().min(0),
            analyzedItems: z.number().int().min(0),
            skippedChunks: z.number().int().min(0),
          })
          .strict(),
        analysis: z
          .object({
            depth: z.enum(["quick", "standard", "deep", "fable", "ultra"]),
            provider: z.string().max(40),
            models: z.record(z.string().max(120)),
            tokens: z.object({ input: z.number().min(0), output: z.number().min(0) }).strict(),
            estimatedCostUsd: z.number().min(0),
          })
          .strict(),
      })
      .strict(),

    // ---- LLM-generated ----
    essay: z
      .object({
        title: md(200),
        tldr: md(2_000),
        sections: z.array(essaySectionSchema).min(1).max(10),
      })
      .strict(),
    emojiSummary: z.array(emojiSummarySchema).length(5),
    traits: z.array(traitSchema).min(3).max(12),
    topFives: z
      .object({
        topics: z.array(z.object({ label: md(80), note: md(300) }).strict()).max(5),
        characteristicQuotes: z
          .array(
            z
              .object({
                text: md(1_000),
                date: z.string().max(30).optional(),
                url: z.string().url().max(500).optional(),
                note: md(300),
              })
              .strict(),
          )
          .max(5),
        strongestOpinions: z
          .array(
            z
              .object({
                opinion: md(300),
                confidence: z.enum(["mild", "firm", "hill-to-die-on"]),
                evidence: md(500),
              })
              .strict(),
          )
          .max(5),
      })
      .strict(),
    quotes: z.array(quoteSchema).max(40),
    topicDistribution: z
      .array(z.object({ topic: md(60), weight: z.number().min(0).max(1) }).strict())
      .min(1)
      .max(12),

    // ---- computed locally, deterministic (never LLM) ----
    activityByMonth: z
      .array(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/), count: z.number().int().min(0) }).strict())
      .max(600),
    wordCloud: z
      .array(z.object({ term: z.string().min(1).max(40), weight: z.number().min(0).max(1) }).strict())
      .max(120),
  })
  .strict();

export type AssessmentDoc = z.infer<typeof assessmentDocSchema>;
export type EssaySection = z.infer<typeof essaySectionSchema>;
export type Trait = z.infer<typeof traitSchema>;
export type Quote = z.infer<typeof quoteSchema>;
