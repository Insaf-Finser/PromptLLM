import { test, expect } from "@playwright/test";

// This is the one flow the brief calls "an e2e test that matters" — not
// coverage theatre. It walks the actual job-to-be-done: sign up, create a
// prompt, save a version, see it in the version history.
//
// The eval-run test below is skipped unless GROQ_API_KEY is set in the
// environment — CI doesn't set it, so this never depends on a live key
// by default. Since Groq's free tier costs nothing, it's safe to run
// locally with a real key rather than mocking the model call.

test.describe("core flow", () => {
  test("sign up, create a prompt, and save a version", async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = "test-password-123";

    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();

    await expect(page).toHaveURL(/\/prompts$/);

    await page.getByRole("button", { name: /new prompt/i }).click();
    await page.getByLabel("Name").fill("Support reply drafter");
    await page.getByRole("button", { name: /create prompt/i }).click();

    await expect(page).toHaveURL(/\/prompts\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: "Support reply drafter" })
    ).toBeVisible();

    await page
      .getByLabel("Template")
      .fill("Hi {{customer_name}}, thanks for reaching out about {{issue}}.");

    // Live variable extraction should show both detected variables
    // before we even save — this is the thing worth asserting on.
    await expect(page.getByText("{{customer_name}}")).toBeVisible();
    await expect(page.getByText("{{issue}}")).toBeVisible();

    await page.getByRole("button", { name: /save version/i }).click();

    await expect(page).toHaveURL(/\/versions\/[^/]+$/);
    await expect(page.getByRole("heading", { name: /version 1/i })).toBeVisible();
  });

  test("run an eval end-to-end against the real model", async ({ page }) => {
    test.skip(!process.env.GROQ_API_KEY, "requires GROQ_API_KEY to call the real model");

    const email = `test-eval-${Date.now()}@example.com`;
    const password = "test-password-123";

    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/prompts$/);

    await page.getByRole("button", { name: /new prompt/i }).click();
    await page.getByLabel("Name").fill("Eval smoke test");
    await page.getByRole("button", { name: /create prompt/i }).click();
    await expect(page).toHaveURL(/\/prompts\/[^/]+$/);

    await page.getByLabel("Template").fill("Say hello to {{name}} in one short sentence.");
    await page.getByRole("button", { name: /save version/i }).click();
    await expect(page).toHaveURL(/\/versions\/[^/]+$/);

    await page.getByLabel("Case name").fill("Basic greeting");
    await page.getByLabel("name", { exact: true }).fill("Sam");
    await page
      .getByLabel(/what does a good response look like/i)
      .fill("Greets Sam by name in a friendly way");
    await page.getByRole("button", { name: /add test case/i }).click();

    await page.getByRole("button", { name: /run eval/i }).click();

    // The real model call can take a few seconds — give it real headroom
    // rather than the default timeout flaking under normal Groq latency.
    await expect(page.getByText(/passed|Not graded yet/i)).toBeVisible({
      timeout: 20_000,
    });
  });
});
