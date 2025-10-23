// Lightweight fetch wrapper with retry/backoff and no-store cache
export async function httpFetch(path, options = {}, retries = 2) {
  const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { cache: 'no-store', ...options });
    if (!res.ok && [502, 503, 504, 429].includes(res.status) && retries > 0) {
      await new Promise((r) => setTimeout(r, 500 * (3 - retries)));
      return httpFetch(path, options, retries - 1);
    }
    return res;
  } catch (e) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500 * (3 - retries)));
      return httpFetch(path, options, retries - 1);
    }
    throw e;
  }
}
