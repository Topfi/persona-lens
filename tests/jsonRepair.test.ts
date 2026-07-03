import { describe, expect, it } from "vitest";
import { repairJson } from "../src/lib/pipeline/jsonRepair";

describe("repairJson", () => {
  it("parses clean JSON", () => {
    expect(repairJson('{"a": 1}')).toEqual({ a: 1 });
  });

  it("strips code fences", () => {
    expect(repairJson('```json\n{"a": [1, 2]}\n```')).toEqual({ a: [1, 2] });
  });

  it("skips prose preamble", () => {
    expect(repairJson('Here is the analysis you asked for:\n{"ok": true} Hope that helps!')).toEqual({ ok: true });
  });

  it("fixes trailing commas", () => {
    expect(repairJson('{"a": 1, "b": [1, 2,],}')).toEqual({ a: 1, b: [1, 2] });
  });

  it("returns null for hopeless input", () => {
    expect(repairJson("I cannot answer that.")).toBeNull();
    expect(repairJson("")).toBeNull();
  });
});
