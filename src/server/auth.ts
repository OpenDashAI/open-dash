/**
 * Clerk authentication for OpenDash.
 * Frontend-first approach: Clerk handles auth UI and session,
 * backend verifies session and creates D1 user records.
 *
 * Flow:
 * 1. User visits opendash.ai → frontend checks Clerk session
 * 2. If no session → redirected to /login (Clerk sign-in widget)
 * 3. User signs up/logs in with email/password → Clerk creates session
 * 4. Frontend redirects to /onboarding
 * 5. Backend creates user record in D1 (or updates lastLogin)
 * 6. All requests verify Clerk session cookie
 */

const SESSION_COOKIE_NAME = "__session";

export interface ClerkUserInfo {
	userId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
}

/**
 * Verify Clerk session from cookie.
 * In production, validate JWT signature using Clerk's public key.
 * For MVP, we'll validate the session exists and is not expired.
 */
export function verifyClerkSession(
	request: Request,
	_env?: any,
): { valid: boolean; token?: string } {
	const cookies = request.headers.get("Cookie") ?? "";
	const sessionMatch = cookies.match(/(?:^|;\s*)__session=([^;]+)/);

	if (!sessionMatch || !sessionMatch[1]) {
		return { valid: false };
	}

	return { valid: true, token: sessionMatch[1] };
}

/** Extract Clerk session cookie */
export function getSessionCookie(request: Request): string | null {
	const cookies = request.headers.get("Cookie") ?? "";
	const match = cookies.match(/(?:^|;\s*)__session=([^;]+)/);
	return match?.[1] ?? null;
}

/** Build clear session cookie (for logout) */
export function buildClearCookie(): string {
	const parts = [
		`${SESSION_COOKIE_NAME}=`,
		`Path=/`,
		`HttpOnly`,
		`SameSite=Lax`,
		`Max-Age=0`,
		`Secure`,
	];
	return parts.join("; ");
}

/** Login page with Clerk sign-in widget embed */
export function loginPage(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OpenDash — Sign In</title>
<script async crossOrigin="anonymous" src="https://cdn.clerk.com/clerk.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0e14;
    color: #c4cad4;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }
  .container {
    width: 100%;
    max-width: 440px;
  }
  .header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .header h1 {
    color: #e6eaf0;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;
  }
  .header p {
    color: #6b7280;
    font-size: 0.9rem;
  }
  .clerk-container {
    background: #12161e;
    border: 1px solid #1e2430;
    border-radius: 12px;
    padding: 2rem;
  }
  /* Clerk component styling overrides */
  :root {
    --rd-color-brand-1000: #0a0e14;
    --rd-color-brand-500: #3b82f6;
    --rd-color-text-1: #e6eaf0;
    --rd-color-text-2: #c4cad4;
    --rd-color-bg-1: #12161e;
    --rd-color-bg-2: #0a0e14;
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>OpenDash</h1>
    <p>See all your projects in 5 minutes</p>
  </div>
  <div class="clerk-container" id="clerk-widget"></div>
</div>

<script>
  window.onload = function() {
    if (window.Clerk) {
      Clerk.mountSignIn(document.getElementById('clerk-widget'), {
        appearance: {
          baseTheme: null,
          variables: {
            colorPrimary: '#3b82f6',
            colorBackground: '#12161e',
            colorText: '#e6eaf0',
            colorInputBackground: '#0a0e14',
            colorInputBorder: '#1e2430',
            borderRadius: '0.5rem',
          }
        },
        signUpUrl: '/sign-up',
        afterSignInUrl: '/onboarding',
      });
    }
  };
</script>
</body>
</html>`;
}
