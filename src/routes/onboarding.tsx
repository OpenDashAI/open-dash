import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingPage,
});

function OnboardingPage() {
	useEffect(() => {
		// On mount, complete onboarding and redirect
		const completeOnboarding = async () => {
			try {
				// Call server function to create/update user and send welcome email
				const response = await fetch("/api/onboarding", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				});

				if (response.ok) {
					// Redirect to home after brief delay
					setTimeout(() => {
						window.location.href = "/";
					}, 1500);
				} else {
					// If onboarding fails, still redirect to home
					// (user will be created on next API call)
					setTimeout(() => {
						window.location.href = "/";
					}, 2000);
				}
			} catch (err) {
				console.error("Onboarding error:", err);
				// Fallback: redirect anyway
				setTimeout(() => {
					window.location.href = "/";
				}, 2000);
			}
		};

		completeOnboarding();
	}, []);

	return (
		<div className="flex items-center justify-center min-h-screen bg-slate-950">
			<div className="text-center">
				<div className="mb-6">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-4">
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				</div>
				<h1 className="text-2xl font-bold text-slate-100 mb-2">
					Welcome to OpenDash!
				</h1>
				<p className="text-slate-400 mb-8">
					Setting up your account...
				</p>
				<div className="flex gap-2 justify-center">
					<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
					<div
						className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
						style={{ animationDelay: "0.1s" }}
					/>
					<div
						className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
						style={{ animationDelay: "0.2s" }}
					/>
				</div>
				<p className="text-xs text-slate-500 mt-8">
					You'll be redirected in a moment...
				</p>
			</div>
		</div>
	);
}
