/** Shared GitHub API fetch with required headers */
export function githubFetch(url: string, token: string): Promise<Response> {
	return fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"User-Agent": "OpenDash/1.0",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});
}
