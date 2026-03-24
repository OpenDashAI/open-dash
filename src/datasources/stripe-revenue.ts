import type { BriefingItem } from "../lib/briefing";
import type { DataSource, DataSourceConfig } from "../lib/datasource";

/**
 * Stripe Revenue data source.
 * Shows daily revenue delta and alerts on significant changes.
 * Stub — requires STRIPE_SECRET_KEY.
 */
export const stripeRevenueSource: DataSource = {
	id: "stripe-revenue",
	name: "Stripe Revenue",
	icon: "$",
	description: "Daily revenue from Stripe across all accounts",
	requiresConfig: true,

	async fetch(config: DataSourceConfig): Promise<BriefingItem[]> {
		const stripeKey = config.env.STRIPE_SECRET_KEY;
		if (!stripeKey) {
			// No Stripe configured — show a prompt to connect
			return [
				{
					id: "stripe-not-connected",
					priority: "low",
					category: "revenue",
					title: "Daily revenue: $0",
					detail:
						"Target: $333/day ($10K/mo). Connect Stripe to track real revenue.",
					time: new Date().toISOString(),
				},
			];
		}

		try {
			// Get brand-specific label filter
			const brandConfig = config.brandConfig as { label?: string } | undefined;
			const label = brandConfig?.label;

			// Fetch today's balance transactions
			const now = new Date();
			const todayStart = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
			);
			const res = await fetch(
				`https://api.stripe.com/v1/balance_transactions?created[gte]=${Math.floor(todayStart.getTime() / 1000)}&limit=100`,
				{
					headers: {
						Authorization: `Bearer ${stripeKey}`,
					},
				},
			);

			if (!res.ok) return [];

			const data = (await res.json()) as {
				data: Array<{
					id: string;
					amount: number;
					currency: string;
					created: number;
					type: string;
				}>;
			};

			const totalCents = data.data
				.filter((t) => t.type === "charge" || t.type === "payment")
				.reduce((sum, t) => sum + t.amount, 0);

			const totalDollars = totalCents / 100;
			const target = 333;
			const pct = Math.round((totalDollars / target) * 100);

			const title = label
				? `[${label}] Daily revenue: $${totalDollars.toFixed(0)}`
				: `Daily revenue: $${totalDollars.toFixed(0)}`;

			return [
				{
					id: "stripe-daily-revenue",
					priority: totalDollars > 0 ? "normal" : "low",
					category: "revenue",
					title,
					detail: `${pct}% of $${target}/day target`,
					time: new Date().toISOString(),
					isNew: totalDollars > 0,
				},
			];
		} catch {
			return [];
		}
	},
};
