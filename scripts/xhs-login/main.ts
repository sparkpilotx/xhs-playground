import { launch } from "@astral/astral";
import { join } from "@std/path";

const XIAOHONGSHU_URL = "https://www.xiaohongshu.com/explore";
const LOGIN_STATUS_SELECTOR = ".main-container .user .link-wrapper .channel";
// const QRCODE_SELECTOR = ".login-container .qrcode-img"; // unused currently

async function main(): Promise<void> {
  const userHomeDir = Deno.env.get("HOME");
  if (!userHomeDir) {
    throw new Error("HOME environment variable is not set");
  }
  const xhsHomeDir = join(userHomeDir, ".xiaohongshu");
  await Deno.mkdir(xhsHomeDir, { recursive: true });
  const cookiePath = join(xhsHomeDir, "cookies.json");
  console.log(cookiePath);

  // Try to read existing cookies if any
  let cookies: unknown = [];
  try {
    const cookieData = await Deno.readTextFile(cookiePath);
    cookies = JSON.parse(cookieData);
    if (!Array.isArray(cookies)) cookies = [];
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      // No cookie file yet; proceed without cookies
      cookies = [];
    } else {
      throw err;
    }
  }

  const browser = await launch({
    headless: false,
  });

  try {
    const page = await browser.newPage();

    if (Array.isArray(cookies) && cookies.length > 0) {
      await page.setCookies(cookies as unknown as Parameters<typeof page.setCookies>[0]);
    }

    await page.goto(XIAOHONGSHU_URL);

    // Fast check once loaded
    let isLoggedIn = !!(await page.$(LOGIN_STATUS_SELECTOR));

    if (!isLoggedIn) {
      // Poll with timeout (max ~60s)
      const timeoutMs = 60_000;
      const intervalMs = 500;
      const start = Date.now();
      while (!isLoggedIn && Date.now() - start < timeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        const el = await page.$(LOGIN_STATUS_SELECTOR);
        isLoggedIn = !!el;
      }
    }

    if (!isLoggedIn) {
      throw new Error("Login not detected within timeout");
    }

    // Persist fresh cookies
    const freshCookies = await page.cookies();
    await Deno.writeTextFile(cookiePath, JSON.stringify(freshCookies, null, 2));

    console.log("Logged in.");
  } finally {
    await browser.close();
  }
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  await main().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
}
