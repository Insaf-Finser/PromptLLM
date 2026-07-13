import { describe, it, expect } from "vitest";
import {
  createPromptSchema,
  createVersionSchema,
  createTestCaseSchema,
  signupSchema,
} from "@/lib/validators";

describe("createPromptSchema", () => {
  it("accepts a name with no description", () => {
    const result = createPromptSchema.safeParse({ name: "My prompt" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name — boundary case", () => {
    const result = createPromptSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("createVersionSchema", () => {
  it("rejects a model outside the supported list — most likely failure mode: typo'd model string", () => {
    const result = createVersionSchema.safeParse({
      promptId: "123e4567-e89b-12d3-a456-426614174000",
      templateText: "Hi {{name}}",
      model: "gpt-4o",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty template", () => {
    const result = createVersionSchema.safeParse({
      promptId: "123e4567-e89b-12d3-a456-426614174000",
      templateText: "",
      model: "llama-3.3-70b-versatile",
    });
    expect(result.success).toBe(false);
  });
});

describe("createTestCaseSchema", () => {
  it("requires expectedCriteria — an ungraded-by-design test case is not allowed", () => {
    const result = createTestCaseSchema.safeParse({
      promptId: "123e4567-e89b-12d3-a456-426614174000",
      name: "Case 1",
      variableValues: { name: "Alex" },
      expectedCriteria: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("rejects a password under 8 characters — boundary case", () => {
    const result = signupSchema.safeParse({
      email: "a@example.com",
      password: "short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({
      email: "not-an-email",
      password: "longenoughpassword",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid signup payload", () => {
    const result = signupSchema.safeParse({
      email: "a@example.com",
      password: "longenoughpassword",
    });
    expect(result.success).toBe(true);
  });
});
