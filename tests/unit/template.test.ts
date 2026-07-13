import { describe, it, expect } from "vitest";
import { extractVariableNames } from "@/lib/validators";
import { interpolateTemplate, findMissingVariables } from "@/lib/template";

describe("extractVariableNames", () => {
  it("extracts a single variable", () => {
    expect(extractVariableNames("Hi {{name}}")).toEqual(["name"]);
  });

  it("extracts multiple distinct variables in order of first appearance", () => {
    expect(extractVariableNames("{{a}} and {{b}} and {{a}}")).toEqual(["a", "b"]);
  });

  it("returns an empty array when there are no variables", () => {
    expect(extractVariableNames("Just plain text.")).toEqual([]);
  });

  it("tolerates internal whitespace inside the braces", () => {
    expect(extractVariableNames("{{  spaced_out  }}")).toEqual(["spaced_out"]);
  });

  it("ignores malformed braces (single brace, unclosed)", () => {
    expect(extractVariableNames("{name} and {{unclosed")).toEqual([]);
  });
});

describe("interpolateTemplate", () => {
  it("fills in a single variable", () => {
    expect(interpolateTemplate("Hi {{name}}", { name: "Alex" })).toBe("Hi Alex");
  });

  it("fills in multiple occurrences of the same variable", () => {
    expect(
      interpolateTemplate("{{name}}, are you {{name}}?", { name: "Sam" })
    ).toBe("Sam, are you Sam?");
  });

  it("leaves a placeholder untouched if no value is provided — boundary case", () => {
    expect(interpolateTemplate("Hi {{name}}", {})).toBe("Hi {{name}}");
  });

  it("handles an empty-string value distinctly from a missing one", () => {
    expect(interpolateTemplate("Hi {{name}}!", { name: "" })).toBe("Hi !");
  });

  it("does not touch text with no placeholders", () => {
    expect(interpolateTemplate("no placeholders here", { name: "Alex" })).toBe(
      "no placeholders here"
    );
  });
});

describe("findMissingVariables", () => {
  it("returns declared variables that have no matching value", () => {
    expect(findMissingVariables(["a", "b"], { a: "1" })).toEqual(["b"]);
  });

  it("returns an empty array when every variable is covered", () => {
    expect(findMissingVariables(["a", "b"], { a: "1", b: "2" })).toEqual([]);
  });

  it("returns an empty array when there are no declared variables — most likely trivial-pass failure mode", () => {
    expect(findMissingVariables([], {})).toEqual([]);
  });
});
