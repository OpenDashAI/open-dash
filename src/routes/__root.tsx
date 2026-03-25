import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { createSecurityContext, GlobalSecurityContext } from '../server/global-middleware'

export const Route = createRootRoute({
	beforeLoad: async ({ context, location }) => {
		// Create security context for this request
		const { context: security, shouldBlock } = createSecurityContext(
			new Request(location.href, {
				method: 'GET',
				headers: context?.request?.headers || new Headers(),
			})
		)

		// Block if auth/rate-limit failed
		if (shouldBlock) {
			throw shouldBlock
		}

		// Make security context available to all routes
		return { security }
	},
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ title: 'OpenDash' },
		],
		links: [
			{ rel: 'stylesheet', href: appCss },
			{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
			{
				rel: 'stylesheet',
				href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
			},
		],
	}),
	shellComponent: RootDocument,
})

function RootDocument({ children, context }: { children: React.ReactNode; context?: { security?: GlobalSecurityContext } }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	)
}
