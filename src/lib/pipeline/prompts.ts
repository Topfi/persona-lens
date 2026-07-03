export type Depth = "quick" | "standard" | "deep" | "fable" | "ultra";

/** JSON Schemas kept structured-outputs-friendly:
 *  objects use additionalProperties:false + required; no length constraints. */

type Schema = Record<string, unknown>;
const str: Schema = { type: "string" };
const arr = (items: Schema): Schema => ({ type: "array", items });
const obj = (properties: Record<string, Schema>): Schema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const READER_SCHEMA = {
  name: "reader_evidence",
  schema: obj({
    interests: arr(str),
    expertiseSignals: arr(str),
    toneStyle: arr(str),
    valuesOpinions: arr(str),
    personalFacts: arr(str),
    notableQuotes: arr(obj({ text: str, date: str, why: str })),
    topicTallies: arr(obj({ topic: str, count: { type: "integer" } })),
  }),
};

export function readerPrompt(platform: string, username: string, chunkText: string, dateFrom: string, dateTo: string): { system: string; user: string } {
  return {
    system: `You are an evidence extractor in a profile-analysis pipeline. You read a chronological slice of a person's public ${platform} history and extract structured evidence about who they are. Be specific, cite dates from the items, quote verbatim where telling. Extract only what the text supports — no speculation beyond clearly-flagged inference. Return via the required JSON schema.`,
    user: `Below is a slice (${dateFrom} to ${dateTo}) of public posts/comments by "${username}". Each item starts with "--- <date> [kind]".

Extract:
- interests: topics they engage with (note recurrence)
- expertiseSignals: evidence of genuine knowledge, with specifics
- toneStyle: writing style, argumentation habits, humor
- valuesOpinions: recurring opinions, values, worldview signals
- personalFacts: self-disclosed biographical facts (location, work, tools, age hints)
- notableQuotes: up to 5 short verbatim quotes that capture the person (with date and why)
- topicTallies: rough counts of items per topic area (5-10 topics)

ITEMS:
${chunkText}`,
  };
}

export const ANALYST_LENSES = [
  {
    key: "technical",
    title: "Technical & expertise profile",
    instruction:
      "Determine: domains of genuine depth vs casual interest, likely profession, tools/platforms used, and how their focus evolved over time. Note confidence levels and evidence disagreements.",
  },
  {
    key: "personality",
    title: "Personality & communication style",
    instruction:
      "Characterize: how they argue and engage, epistemic habits (hedging, sourcing, self-correction), humor, temperament, handling of disagreement, endearing and grating quirks. Use the best verbatim quotes as evidence.",
  },
  {
    key: "values",
    title: "Values & worldview",
    instruction:
      "Characterize: recurring positions and convictions, what they care about morally/politically, biographical anchors, and internal tensions. Distinguish strong recurring convictions from one-off takes.",
  },
] as const;

export function analystPrompt(lens: (typeof ANALYST_LENSES)[number], platform: string, username: string, dossier: string): { system: string; user: string } {
  return {
    system: `You are an analyst in a profile-analysis pipeline, assessing the ${lens.title.toUpperCase()} of ${platform} user "${username}" from structured evidence compiled by parallel readers who each read a slice of the full history. Write a dense, well-organized analysis (500-800 words) in markdown. Cite dates and verbatim quotes from the dossier. Be evidence-bound and note uncertainty honestly.`,
    user: `${lens.instruction}\n\nEVIDENCE DOSSIER (JSON, one entry per chronological slice):\n${dossier}`,
  };
}

export const SYNTHESIS_SCHEMA = {
  name: "assessment",
  schema: obj({
    essay: obj({
      title: str,
      tldr: str,
      sections: arr(obj({ heading: str, markdown: str })),
    }),
    emojiSummary: arr(obj({ emoji: str, caption: str })),
    traits: arr(obj({ name: str, score: { type: "integer" }, evidence: str })),
    topFives: obj({
      topics: arr(obj({ label: str, note: str })),
      characteristicQuotes: arr(obj({ text: str, date: str, note: str })),
      strongestOpinions: arr(
        obj({
          opinion: str,
          confidence: { type: "string", enum: ["mild", "firm", "hill-to-die-on"] },
          evidence: str,
        }),
      ),
    }),
    quotes: arr(obj({ text: str, date: str, context: str })),
    topicDistribution: arr(obj({ topic: str, weight: { type: "number" } })),
  }),
};

export function synthesisPrompt(
  platform: string,
  username: string,
  material: string,
): { system: string; user: string } {
  return {
    system: `You are the final synthesizer in a profile-analysis pipeline. Produce a single assessment document about ${platform} user "${username}" from the analysis material provided. Write with warmth, wit and precision — the reader is most likely the person themselves, so be honest but kind; playful roasting of quirks is welcome, cruelty is not. Everything must be grounded in the evidence; quotes must be verbatim from the material.

Output requirements (JSON via the required schema):
- essay.title: a memorable characterization (not "Assessment of X")
- essay.tldr: 2-4 sentence summary a stranger could enjoy
- essay.sections: 4-6 sections of flowing markdown (who they are, expertise, how they communicate, what they believe, net impression). Use *italics* for quotes, **bold** for emphasis.
- emojiSummary: exactly 5 emoji, each with a caption under 100 chars
- traits: 6-8 trait meters, score 0-100, each with one-line evidence
- topFives: up to 5 topics, 5 characteristic quotes (verbatim + why), 5 strongest opinions with confidence level
- quotes: 5-15 additional verbatim quotes for callouts
- topicDistribution: 5-9 topics with weights summing to ~1.0, grounded in the reader topic tallies`,
    user: material,
  };
}

export function quickSynthesisUser(platform: string, username: string, corpus: string): string {
  return `Analyze the following public ${platform} history of "${username}" directly (single-pass mode). First mentally extract the evidence, then produce the assessment document.

HISTORY:
${corpus}`;
}
