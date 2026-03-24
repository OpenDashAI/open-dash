interface HealthBadgeProps {
	score: number;
}

function getHealthColor(score: number): string {
	if (score >= 80) return "var(--hud-success)";
	if (score >= 60) return "var(--hud-warning)";
	return "var(--hud-error)";
}

function getHealthLabel(score: number): string {
	if (score >= 80) return "Healthy";
	if (score >= 60) return "Degraded";
	return "Critical";
}

export function HealthBadge({ score }: HealthBadgeProps) {
	const color = getHealthColor(score);

	return (
		<div
			className="health-badge"
			style={{
				color: color,
				borderColor: color,
				backgroundColor: `${color}15`,
			}}
		>
			<div className="health-dot" style={{ backgroundColor: color }} />
			{score}%
		</div>
	);
}

export { getHealthColor, getHealthLabel };
