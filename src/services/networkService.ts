const ONLINE_CHECK_URL = "https://clients3.google.com/generate_204";
const CHECK_TIMEOUT_MS = 4000;

export async function isDeviceOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const response = await fetch(ONLINE_CHECK_URL, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
