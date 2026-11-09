import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WIDTHS = [375, 768, 1280] as const;

/** Scroll the whole page once so lazily-activated UI (observers, sticky steps) has run. */
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const width of WIDTHS) {
  test.describe(`viewport ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("has no horizontal overflow", async ({ page }) => {
      await page.goto("/");
      await scrollThrough(page);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test("has no axe WCAG A/AA violations", async ({ page }) => {
      await page.goto("/");
      await scrollThrough(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const summary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
      }));
      expect(results.passes.length, "axe must have evaluated rules").toBeGreaterThan(15);
      expect(summary).toEqual([]);
    });
  });
}

test.describe("keyboard and assistive technology", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("skip link is the first stop and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("main");
  });

  test("page has one h1 and the section outline is ordered", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    const levels = await page.$$eval("h1,h2,h3,h4,h5,h6", (hs) => hs.map((h) => Number(h.tagName[1])));
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1], `heading order at index ${i}`).toBeLessThanOrEqual(1);
    }
    // Previews use non-heading elements, so no h4+ should exist at all.
    expect(levels.filter((l) => l > 3)).toEqual([]);
  });

  test("use cases are presented as examples rather than customer claims", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#use-cases");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(4);
    await expect(section).toContainText("not customer stories");
  });

  test("the artifact concept explains source references", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#artifact");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("heading", { level: 2 })).toContainText("Knowledge Artifact");
    await expect(section).toContainText("Source reference");
    await expect(section).toContainText("not available yet");
  });

  test("memory clips are described as a planned concept", async ({ page }) => {
    await page.goto("/");
    const clips = page.locator("#memory-clips");
    await clips.scrollIntoViewIfNeeded();
    await expect(clips.getByText("PLANNED CONCEPT")).toBeVisible();
    await expect(clips).toContainText("Memory clips are not available yet");
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("opens, closes with Escape, restores focus, and closes after navigating", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /^(Open|Close) menu$/ });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "How it works" }).first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.getByRole("link", { name: "Use cases" }).first().click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(/#use-cases$/);
  });
});

test.describe("touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("the waitlist does not imply that signup is live", async ({ page }) => {
    await page.goto("/");
    const waitlist = page.locator("#waitlist");
    await waitlist.scrollIntoViewIfNeeded();
    await expect(waitlist).toContainText("No email is collected on this page today");
    await expect(waitlist.getByRole("button", { name: /Join the early access list/ })).toHaveCount(0);
  });
});

test.describe("motion preferences", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("animations run when motion is allowed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const name = await page.locator("h1").evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe("rise");
  });

  test("reduced motion removes entrance animation and transitions, content stays visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const styles = await page.evaluate(() => {
      const h1 = document.querySelector("h1")!;
      const card = document.querySelector(".flow-card")!;
      const taglineWord = document.querySelector(".tagline-reveal [data-tagline-word]")!;
      return {
        h1Animation: getComputedStyle(h1).animationName,
        cardAnimation: getComputedStyle(card).animationName,
        cardOpacity: getComputedStyle(card).opacity,
        taglineTransition: parseFloat(getComputedStyle(taglineWord).transitionDuration),
        running: document.getAnimations().filter((a) => a.playState === "running").length,
      };
    });
    expect(styles.h1Animation).toBe("none");
    expect(styles.cardAnimation).toBe("none");
    expect(styles.cardOpacity).toBe("1");
    expect(styles.taglineTransition).toBeLessThan(0.001);
    expect(styles.running).toBe(0);
  });
});

test.describe("server-rendered content", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });

  test("the product flow and roadmap are visible without JavaScript", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500); // let the CSS entrance finish
    const firstCard = page.locator(".flow-card").first();
    await expect(firstCard).toBeVisible();
    expect(await firstCard.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");

    await expect(page.locator("#workflow")).toContainText("not available in the current prototype");
    await expect(page.locator("#later")).toContainText("None of these capabilities are available today");
  });
});

test.describe("SEO, metadata and hardening", () => {
  test("head metadata, JSON-LD and honest copy", async ({ page, request }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/PodFlow/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /cited knowledge/);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);

    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    expect(jsonLd["@type"]).toBe("SoftwareApplication");
    for (const forbidden of ["offers", "aggregateRating", "review", "price"]) {
      expect(jsonLd).not.toHaveProperty(forbidden);
    }

    // Footer must not carry a build note.
    await expect(page.locator("footer")).not.toContainText("will appear here");

    // Raw HTML (what a crawler sees) contains the honest product status.
    const html = await (await request.get("/")).text();
    expect(html).toContain("Memory clips are not available yet");
    expect(html).toContain("not available today");

    expect(consoleErrors, "console errors (includes CSP violations)").toEqual([]);
  });

  test("security headers are set", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("share image, icons and robots resolve", async ({ request }) => {
    for (const path of ["/opengraph-image", "/twitter-image", "/icon", "/apple-icon"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toContain("image/png");
    }
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Allow: /");
  });

  test("unknown routes get the branded 404", async ({ page }) => {
    const response = await page.goto("/definitely-not-a-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("not part of PodFlow yet");
    await expect(page.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/");
  });
});
