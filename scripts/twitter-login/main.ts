import { launch } from "@astral/astral";
import { join } from "@std/path";

const TWITTER_URL = "https://x.com/home";
const LOGIN_STATUS_SELECTOR = '[data-testid="AppTabBar_Profile_Link"]';

async function main(): Promise<void> {
  const userHomeDir = Deno.env.get("HOME");
  if (!userHomeDir) {
    throw new Error("HOME environment variable is not set");
  }
  const twitterHomeDir = join(userHomeDir, ".twitter");
  await Deno.mkdir(twitterHomeDir, { recursive: true });
  const cookiePath = join(twitterHomeDir, "cookies.json");
  console.log(cookiePath);

  let cookies: unknown = [];
  try {
    const cookieData = await Deno.readTextFile(cookiePath);
    cookies = JSON.parse(cookieData);
    if (!Array.isArray(cookies)) cookies = [];
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      cookies = [];
    } else {
      throw err;
    }
  }

  const browser = await launch({
    headless: false,
    // path: Deno.env.get("CHROME_PATH") ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });

  try {
    const page = await browser.newPage();

    if (Array.isArray(cookies) && cookies.length > 0) {
      await page.setCookies(cookies as unknown as Parameters<typeof page.setCookies>[0]);
    }

    await page.goto(TWITTER_URL);

    let isLoggedIn = !!(await page.$(LOGIN_STATUS_SELECTOR));
    if (!isLoggedIn) {
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

    const freshCookies = await page.cookies();
    await Deno.writeTextFile(cookiePath, JSON.stringify(freshCookies, null, 2));
    console.log("Logged in.");
  } finally {
    await browser.close();
  }
}

if (import.meta.main) {
  await main().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
}


