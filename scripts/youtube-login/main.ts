import { connect, launch } from "@astral/astral";
import { join } from "@std/path";

const YOUTUBE_URL = "https://www.youtube.com";
// When logged in, the avatar button with id "avatar-btn" exists in the top bar
const LOGIN_STATUS_SELECTOR = "#avatar-btn";

async function resolveChromeProfileDirectoryByName(
  userDataDir: string,
  displayName: string,
): Promise<string | null> {
  const localStatePath = join(userDataDir, "Local State");
  try {
    const text = await Deno.readTextFile(localStatePath);
    const state = JSON.parse(text) as unknown;
    const profile =
      state && typeof state === "object" && (state as Record<string, unknown>)["profile"];
    const infoCache =
      profile && typeof profile === "object" && (profile as Record<string, unknown>)["info_cache"];
    if (infoCache && typeof infoCache === "object") {
      for (const [dirName, info] of Object.entries(infoCache as Record<string, unknown>)) {
        if (info && typeof info === "object" && (info as Record<string, unknown>)["name"] === displayName) {
          return dirName;
        }
      }
    }
  } catch (_) {
    // Ignore if Local State doesn't exist or is unreadable
  }
  return null;
}

async function buildChromeProfileArgs(
  profileDisplayName: string,
  overrideUserDataDir?: string,
  includeProfileDirectory: boolean = true,
): Promise<string[]> {
  const homeDir = Deno.env.get("HOME");
  if (!homeDir) return [];
  const userDataDir = overrideUserDataDir ?? (Deno.env.get("CHROME_USER_DATA_DIR") ??
    join(homeDir, "Library", "Application Support", "Google", "Chrome"));
  const args = [`--user-data-dir=${userDataDir}`];
  if (includeProfileDirectory) {
    const resolved = await resolveChromeProfileDirectoryByName(userDataDir, profileDisplayName);
    if (resolved) args.push(`--profile-directory=${resolved}`);
  }
  return args;
}

async function main(): Promise<void> {
  const userHomeDir = Deno.env.get("HOME");
  if (!userHomeDir) {
    throw new Error("HOME environment variable is not set");
  }
  const youtubeHomeDir = join(userHomeDir, ".youtube");
  await Deno.mkdir(youtubeHomeDir, { recursive: true });
  const cookiePath = join(youtubeHomeDir, "cookies.json");
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

  const launchOptions = {
    headless: false,
    path: Deno.env.get("CHROME_PATH") ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    // args: await buildChromeProfileArgs("sparkpilot"),
  } as const;

  // Prefer connecting to an already-running Chrome when CHROME_ENDPOINT is set
  const endpoint = Deno.env.get("CHROME_ENDPOINT");
  let browser;
  const launchWithFallback = async () => {
    try {
      return await launch(launchOptions);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const refused = message.includes("refused to boot") || message.includes("existing browser session");
      if (refused) {
        // Fallback: launch a separate ephemeral user data dir and rely on cookie capture
        const homeDir = Deno.env.get("HOME");
        if (!homeDir) throw err;
        const fallbackDir = join(homeDir, ".chrome-astral-youtube-sparkpilot");
        await Deno.mkdir(fallbackDir, { recursive: true });
        const fallbackArgs = await buildChromeProfileArgs("sparkpilot", fallbackDir, false);
        return await launch({
          headless: false,
          path: launchOptions.path,
          args: fallbackArgs,
        });
      }
      throw err;
    }
  };

  if (endpoint) {
    try {
      browser = await connect({ endpoint });
    } catch (_) {
      // Endpoint not reachable; fall back to launching our own instance
      browser = await launchWithFallback();
    }
  } else {
    browser = await launchWithFallback();
  }

  try {
    const page = await browser.newPage();

    if (Array.isArray(cookies) && cookies.length > 0) {
      await page.setCookies(cookies as unknown as Parameters<typeof page.setCookies>[0]);
    }

    await page.goto(YOUTUBE_URL);
    // Give the page a short moment to settle and then persist cookies regardless of login detection
    try {
      await page.waitForNetworkIdle({ idleTime: 1000 });
    } catch (_) {
      // ignore; proceed to read cookies anyway
    }

    // Best-effort login detection (non-blocking)
    const loginWaitMs = 15000;
    const start = Date.now();
    let isLoggedIn = !!(await page.$(LOGIN_STATUS_SELECTOR));
    while (!isLoggedIn && Date.now() - start < loginWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const el = await page.$(LOGIN_STATUS_SELECTOR);
      isLoggedIn = !!el;
    }

    const freshCookies = await page.cookies(YOUTUBE_URL);
    await Deno.writeTextFile(cookiePath, JSON.stringify(freshCookies, null, 2));
    console.log("Logged in.");
  } finally {
    if (endpoint) {
      await browser.disconnect();
    } else {
      await browser.close();
    }
    Deno.exit(0);
  }
}

if (import.meta.main) {
  await main().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
}


