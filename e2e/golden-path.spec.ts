import { expect, test } from "@playwright/test";

test.describe("Public landing page", () => {
  test("shows the marketing content and auth links", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /mapped like a trail/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start learning" }),
    ).toBeVisible();
  });

  test("shows the DevOps and Cloud Engineering track cards", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Choose a track" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "DevOps" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Cloud Engineering" }),
    ).toBeVisible();
    const viewTrailLinks = page.getByRole("link", { name: /View trail/i });
    await expect(viewTrailLinks).toHaveCount(2);
  });
});

test.describe("Unauthenticated access", () => {
  test("redirects /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects /admin to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Signup and learner flow", () => {
  test("a new user can sign up and reach the dashboard", async ({ page }) => {
    const email = `learner-${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.getByLabel("Name").fill("E2E Learner");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("Passw0rd!");
    await page.getByRole("button", { name: /sign up/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /welcome, e2e learner/i }),
    ).toBeVisible();
  });
});

test.describe("Admin login and roadmap CRUD", () => {
  test("admin can log in, create a roadmap, and see it listed", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Password").fill("Admin123!");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "Roadmaps" }),
    ).toBeVisible();

    const slug = `e2e-roadmap-${Date.now()}`;
    await page.getByRole("link", { name: "New roadmap" }).click();
    await page.getByLabel("Title").fill("E2E Test Roadmap");
    await page.getByLabel("Slug").fill(slug);
    await page.getByRole("button", { name: /create roadmap/i }).click();

    await expect(page).toHaveURL(new RegExp(`/admin/roadmaps/\\d+`));
    await expect(page.getByLabel("Roadmap title")).toHaveValue(
      "E2E Test Roadmap",
    );

    await page.goto("/admin");
    await expect(page.getByText(slug)).toBeVisible();
  });
});

test.describe("Learner progress tracking", () => {
  test("learner can open the seeded roadmap and mark a topic complete", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("learner@example.com");
    await page.getByLabel("Password").fill("Learner123!");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("link", { name: /frontend basics/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/frontend-basics/);

    const htmlNode = page.getByText("Click to mark complete").first();
    await expect(htmlNode).toBeVisible();
    await page.getByRole("button", { name: /html/i }).first().click();

    await expect(page.getByText("✅ Completed").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
