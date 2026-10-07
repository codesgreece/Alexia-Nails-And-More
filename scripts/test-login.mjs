import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("console", (msg) => console.log("CONSOLE", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("PAGEERROR", err.message));
page.on("response", (res) => {
  const u = res.url();
  if (u.includes("/api/auth") || u.includes("/admin")) {
    console.log("RESP", res.status(), u.slice(0, 120));
  }
});

console.log("Opening", `${BASE}/admin/login`);
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: "/tmp/login-before.png", fullPage: true });
console.log("URL after load", page.url());

await page.fill('input[name="email"]', "admin@alexianails.gr");
await page.fill('input[name="password"]', "AlexiaAdmin2026!");
await page.click('button[type="submit"]');
console.log("Clicked submit");

for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(500);
  console.log(`t=${(i + 1) * 0.5}s url=${page.url()}`);
  if (page.url().includes("/admin") && !page.url().includes("/login")) break;
}

await page.screenshot({ path: "/tmp/login-after.png", fullPage: true });
const bodyText = await page.locator("body").innerText();
console.log("Final URL", page.url());
console.log("Body snippet:", bodyText.slice(0, 800));
await browser.close();
