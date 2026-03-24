export function ConfigNotFound() {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
				color: "var(--hud-text-muted)",
			}}
		>
			<div style={{ textAlign: "center" }}>
				<div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>⚠️</div>
				<div>Brand configuration not found</div>
			</div>
		</div>
	);
}
