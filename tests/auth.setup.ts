import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("body")).toContainText(
    "Empower Achievements with Verifiable Certificates & Badges"
  );
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Email Address" })
    .fill("ubahyusuf484@gmail.com");
  // .fill(process.env.TEST_EMAIL!);
  await page
    .getByRole("textbox", { name: "Enter Password" })
    .fill("Bilal@ubah484");
  // .fill(process.env.TEST_PASSWORD!);
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("combobox").click();
  await page.getByText("integration_workspace").click();
  await page.getByRole("button", { name: "Select" }).click();

  await page.context().storageState({ path: authFile });
});
