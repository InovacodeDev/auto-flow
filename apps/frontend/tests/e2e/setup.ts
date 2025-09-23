import { beforeAll, afterAll, beforeEach } from "vitest";
import { chromium, Browser, Page } from "playwright";

let browser: Browser;
let page: Page;

beforeAll(async () => {
    browser = await chromium.launch({
        headless: process.env.CI === "true",
        slowMo: 50,
    });
    page = await browser.newPage();

    // Set viewport size
    await page.setViewportSize({ width: 1280, height: 720 });

    // Set base URL
    const baseURL = process.env.E2E_BASE_URL || "http://localhost:5173";
    await page.goto(baseURL);
});

afterAll(async () => {
    await browser.close();
});

beforeEach(async () => {
    // Clear local storage and session storage
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    // Navigate to home page
    await page.goto("/");
});

export { page, browser };
