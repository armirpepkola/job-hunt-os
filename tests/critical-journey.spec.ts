import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

test("Critical User Journey: Log in and create a Kanban card", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/login");

  await page
    .getByRole("textbox", { name: "Email" })
    .fill(process.env.PLAYWRIGHT_TEST_EMAIL!);
  await page
    .getByRole("textbox", { name: "Password" })
    .fill(process.env.PLAYWRIGHT_TEST_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();

  const addButton = page.locator('button:has-text("Manual Add")');
  await expect(addButton).toBeVisible({ timeout: 10000 });

  const uniqueId = Date.now().toString().slice(-6);
  const testCompanyName = `Playwright Corp ${uniqueId}`;

  await page.fill('input[placeholder*="Company"]', testCompanyName);
  await page.fill('input[placeholder*="Role"]', "E2E Software Engineer");
  await addButton.click();

  const newCard = page.locator(`text=${testCompanyName}`);
  await expect(newCard).toBeVisible({ timeout: 10000 });
});
