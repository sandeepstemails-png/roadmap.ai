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

test.describe("Theme toggle", () => {
  test("switching to dark mode persists across reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: /toggle theme/i }).click();
    await page.getByRole("menuitem", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Restore light mode so other tests see the default look.
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await page.getByRole("menuitem", { name: "Light" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
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

  test("learner can open the DevOps timeline and mark a topic complete", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("learner@example.com");
    await page.getByLabel("Password").fill("Learner123!");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("link", { name: /devops/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/devops/);

    for (const step of [
      "Linux",
      "Networking",
      "Git",
      "Docker",
      "Jenkins",
      "Kubernetes",
      "Terraform",
    ]) {
      await expect(
        page.getByRole("heading", { name: step }),
      ).toBeVisible();
    }

    // Toggling flips whatever state Linux is already in (progress persists
    // in the DB across runs), so read the starting label instead of
    // assuming it — this test just needs to prove the toggle + reload
    // round-trip works, in either direction.
    await page.getByRole("button", { name: "Linux details" }).click();
    const toggleButton = page.getByRole("button", {
      name: /mark complete|✅ completed/i,
    });
    const wasCompleted = /completed/i.test(
      (await toggleButton.textContent()) ?? "",
    );
    await toggleButton.click();

    const expectedLabel = wasCompleted ? /mark complete/i : /✅ completed/i;
    await expect(page.getByRole("button", { name: expectedLabel })).toBeVisible(
      { timeout: 10_000 },
    );

    await page.reload();
    await page.getByRole("button", { name: "Linux details" }).click();
    await expect(
      page.getByRole("button", { name: expectedLabel }),
    ).toBeVisible();

    // Restore the original state so repeated local runs stay stable.
    await page.getByRole("button", { name: expectedLabel }).click();
  });

  test("node info button shows TrainWithShubham resources", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("learner@example.com");
    await page.getByLabel("Password").fill("Learner123!");
    await page.getByRole("button", { name: /log in/i }).click();

    await page.getByRole("link", { name: /devops/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/devops/);

    await page
      .getByRole("button", { name: "Learning resources for Linux" })
      .click();

    await expect(
      page.getByRole("link", { name: /TrainWithShubham \(YouTube\)/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /trainwithshubham\.com/i }),
    ).toBeVisible();
  });
});

test.describe("Dashboard job-readiness", () => {
  test("shows completion percentage and readiness levels per roadmap", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("learner@example.com");
    await page.getByLabel("Password").fill("Learner123!");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    const devopsCard = page
      .getByRole("link", { name: /devops/i })
      .filter({ hasText: "Job-ready" });
    await expect(devopsCard.getByText(/\d+%/).first()).toBeVisible();
    await expect(devopsCard.getByText(/Job-ready: Fresher \(40%\)/)).toBeVisible();
    await expect(
      devopsCard.getByText(/Job-ready: Intermediate \(70%\)/),
    ).toBeVisible();
    await expect(devopsCard.getByText(/Job-ready: Expert \(100%\)/)).toBeVisible();
  });
});
