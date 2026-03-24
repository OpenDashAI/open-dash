import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-slate-950">
			<div className="w-full max-w-md">
				<div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-slate-100 mb-2">
							OpenDash
						</h1>
						<p className="text-slate-400">
							See all your projects in 5 minutes
						</p>
					</div>

					{/* Clerk sign-in widget will be mounted here via JS SDK */}
					<div id="clerk-widget" className="flex items-center justify-center py-12">
						<div className="text-center">
							<p className="text-slate-400 mb-4">
								Loading sign-in widget...
							</p>
							<p className="text-sm text-slate-500">
								If this doesn't load, please enable JavaScript
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Clerk JS SDK */}
			<script
				async
				crossOrigin="anonymous"
				src="https://cdn.clerk.com/clerk.js"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: `
        window.onload = function() {
          if (window.Clerk) {
            Clerk.mountSignIn(document.getElementById('clerk-widget'), {
              appearance: {
                baseTheme: 'dark',
                variables: {
                  colorPrimary: '#3b82f6',
                  colorBackground: '#0f172a',
                  colorText: '#f1f5f9',
                  colorInputBackground: '#1e293b',
                  colorInputBorder: '#334155',
                  borderRadius: '0.5rem',
                }
              },
              afterSignInUrl: '/',
              afterSignUpUrl: '/onboarding',
            });
          }
        };
      `,
				}}
			/>
		</div>
	);
}
