/**
 * BraveSearch API Client
 * Integrates with BraveSearch.com API for SERP tracking
 *
 * Tracks keyword rankings for competitors across search results.
 * Rate limit: ~100 API calls/month on free tier, higher on paid plans
 */

export interface BraveSearchResult {
	title: string;
	url: string;
	description: string;
}

export interface BraveSearchResponse {
	results: BraveSearchResult[];
	query: {
		original: string;
	};
}

export class BraveSearchClient {
	private apiKey: string;
	private baseUrl = "https://api.search.brave.com/res/v1/web/search";

	constructor(apiKey: string) {
		if (!apiKey) {
			throw new Error("BraveSearch API key is required");
		}
		this.apiKey = apiKey;
	}

	/**
	 * Search for a query and get top 10 results
	 * Returns domain rankings for competitors
	 */
	async search(query: string): Promise<BraveSearchResponse> {
		const params = new URLSearchParams({
			q: query,
			count: "10",
		});

		const response = await fetch(`${this.baseUrl}?${params}`, {
			method: "GET",
			headers: {
				"X-Subscription-Token": this.apiKey,
				"Accept": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(
				`BraveSearch API error: ${response.status} ${response.statusText}`
			);
		}

		return (await response.json()) as BraveSearchResponse;
	}

	/**
	 * Get ranking position for a domain in search results
	 * Returns 0 if not found in top 10
	 */
	async getCompetitorRank(
		keyword: string,
		domain: string
	): Promise<{ rank: number; domain: string; keyword: string }> {
		const query = `${keyword}`;

		try {
			const results = await this.search(query);

			// Find first match for this domain
			const rank = results.results.findIndex((r) =>
				r.url.toLowerCase().includes(domain.toLowerCase())
			);

			return {
				rank: rank >= 0 ? rank + 1 : 0, // 1-indexed, 0 if not found
				domain,
				keyword,
			};
		} catch (error) {
			console.error(
				`Error checking rank for ${domain} on "${keyword}":`,
				error
			);
			throw error;
		}
	}

	/**
	 * Check ranking for multiple competitors on a single keyword
	 */
	async checkKeywordCompetitors(
		keyword: string,
		competitors: string[]
	): Promise<
		Array<{
			domain: string;
			rank: number;
		}>
	> {
		const results = await this.search(keyword);
		const compRanks: Array<{ domain: string; rank: number }> = [];

		for (const domain of competitors) {
			const rank = results.results.findIndex((r) =>
				r.url.toLowerCase().includes(domain.toLowerCase())
			);
			compRanks.push({
				domain,
				rank: rank >= 0 ? rank + 1 : 0,
			});
		}

		return compRanks;
	}
}
