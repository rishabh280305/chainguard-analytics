import { expect, test } from "@playwright/test";

test("loads a genuine recent Ethereum transaction", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ENTER CASE DESK" }).click();
  await page.getByRole("button", { name: "LATEST SAMPLE" }).click();
  await expect(page.getByText(/point-in-time RPC observation/)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/ethereum-rpc\.publicnode\.com/)).toBeVisible();
});
