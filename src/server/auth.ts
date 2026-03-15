/**
 * Simple single-user auth for OpenDash control plane.
 * Uses a shared secret (AUTH_SECRET) validated via cookie.
 *
 * Flow:
 * 1. User visits any page → redirected to /login if no valid session
 * 2. POST /login with password → sets signed session cookie
 * 3. All requests check cookie before proceeding
 */

const COOKIE_NAME = "opendash_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Create a signed session token from the secret */
export async function createSessionToken(secret: string): Promise<string> {
	const data = new TextEncoder().encode(`opendash:${secret}:${Date.now()}`);
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, data);
	const b64Data = btoa(String.fromCharCode(...new Uint8Array(data)));
	const b64Sig = btoa(String.fromCharCode(...new Uint8Array(sig)));
	return `${b64Data}.${b64Sig}`;
}

/** Verify a session token is validly signed */
export async function verifySessionToken(
	token: string,
	secret: string,
): Promise<boolean> {
	try {
		const [b64Data, b64Sig] = token.split(".");
		if (!b64Data || !b64Sig) return false;

		const data = Uint8Array.from(atob(b64Data), (c) => c.charCodeAt(0));
		const sig = Uint8Array.from(atob(b64Sig), (c) => c.charCodeAt(0));

		const key = await crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["verify"],
		);

		return await crypto.subtle.verify("HMAC", key, sig, data);
	} catch {
		return false;
	}
}

/** Extract session cookie from request */
export function getSessionCookie(request: Request): string | null {
	const cookies = request.headers.get("Cookie") ?? "";
	const match = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
	return match?.[1] ?? null;
}

/** Build Set-Cookie header for session */
export function buildSessionCookie(token: string, secure: boolean): string {
	const parts = [
		`${COOKIE_NAME}=${token}`,
		`Path=/`,
		`HttpOnly`,
		`SameSite=Lax`,
		`Max-Age=${COOKIE_MAX_AGE}`,
	];
	if (secure) parts.push("Secure");
	return parts.join("; ");
}

/** Build Set-Cookie header to clear session */
export function buildClearCookie(secure: boolean): string {
	const parts = [
		`${COOKIE_NAME}=`,
		`Path=/`,
		`HttpOnly`,
		`SameSite=Lax`,
		`Max-Age=0`,
	];
	if (secure) parts.push("Secure");
	return parts.join("; ");
}

/** Login page HTML */
export function loginPage(error?: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OpenDash — Login</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0e14; color: #c4cad4; font-family: ui-monospace, monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .card { background: #12161e; border: 1px solid #1e2430; border-radius: 8px; padding: 2rem; width: 320px; }
  h1 { color: #e6eaf0; font-size: 1.2rem; margin-bottom: 1.5rem; letter-spacing: 0.1em; }
  label { display: block; font-size: 0.75rem; color: #6b7280; margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em; }
  input { width: 100%; padding: 0.6rem 0.8rem; background: #0a0e14; border: 1px solid #1e2430; border-radius: 4px; color: #e6eaf0; font-family: inherit; font-size: 0.9rem; outline: none; }
  input:focus { border-color: #3b82f6; }
  button { width: 100%; padding: 0.6rem; margin-top: 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; font-family: inherit; font-size: 0.85rem; cursor: pointer; letter-spacing: 0.05em; }
  button:hover { background: #2563eb; }
  .error { color: #ef4444; font-size: 0.8rem; margin-top: 0.8rem; }
  .dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; margin-right: 8px; }
</style>
</head>
<body>
<div class="card">
  <h1><span class="dot"></span>OPENDASH</h1>
  <form method="POST" action="/login">
    <label for="password">Access Key</label>
    <input type="password" id="password" name="password" autocomplete="current-password" autofocus required>
    <button type="submit">Authenticate</button>
  </form>
  ${error ? `<div class="error">${error}</div>` : ""}
</div>
</body>
</html>`;
}
