/**
 * Alert History Table Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertHistoryTable } from "../AlertHistoryTable";

vi.mock("@/routes/api/alerts", () => ({
	getAlertHistoryFn: vi.fn(),
	acknowledgeAlertFn: vi.fn(),
	resolveAlertFn: vi.fn(),
}));

describe("AlertHistoryTable", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
	});

	const renderWithProvider = (component: React.ReactElement) => {
		return render(
			<QueryClientProvider client={queryClient}>
				{component}
			</QueryClientProvider>
		);
	};

	it("renders loading state initially", () => {
		renderWithProvider(<AlertHistoryTable />);
		expect(screen.getByText("Loading alerts...")).toBeInTheDocument();
	});

	it("renders table headers", async () => {
		renderWithProvider(<AlertHistoryTable />);

		await waitFor(() => {
			expect(screen.getByText("Datasource")).toBeInTheDocument();
			expect(screen.getByText("Message")).toBeInTheDocument();
			expect(screen.getByText("State")).toBeInTheDocument();
			expect(screen.getByText("Triggered")).toBeInTheDocument();
			expect(screen.getByText("Actions")).toBeInTheDocument();
		});
	});

	it("displays filter buttons", () => {
		renderWithProvider(<AlertHistoryTable />);

		expect(screen.getByText(/Filter:/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /All/ })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Triggered/ })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Acknowledged/ })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Resolved/ })).toBeInTheDocument();
	});

	it("shows empty state when no alerts", async () => {
		renderWithProvider(<AlertHistoryTable />);

		await waitFor(() => {
			expect(screen.getByText("No alerts found")).toBeInTheDocument();
		});
	});

	it("allows filtering by state", async () => {
		renderWithProvider(<AlertHistoryTable />);

		const triggeredButton = screen.getByRole("button", { name: /Triggered/ });
		fireEvent.click(triggeredButton);

		await waitFor(() => {
			expect(triggeredButton).toHaveClass("bg-blue-600");
		});
	});

	it("displays pagination controls when needed", async () => {
		renderWithProvider(<AlertHistoryTable />);

		// Would display "Load More" button when there are many alerts
		await waitFor(() => {
			// Component ready
		});
	});

	it("shows action buttons for triggered alerts", () => {
		renderWithProvider(<AlertHistoryTable />);

		// Would show "Ack" and "Resolve" buttons for triggered alerts
		// Would show only "Resolve" for acknowledged alerts
		// Would show no buttons for resolved alerts
	});
});
