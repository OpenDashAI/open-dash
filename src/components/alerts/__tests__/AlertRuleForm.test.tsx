/**
 * Alert Rule Form Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertRuleForm } from "../AlertRuleForm";

vi.mock("@/routes/api/alerts", () => ({
	createAlertRuleFn: vi.fn(),
	updateAlertRuleFn: vi.fn(),
}));

describe("AlertRuleForm", () => {
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

	it("renders form fields", () => {
		renderWithProvider(
			<AlertRuleForm datasourceId="github" datasourceName="GitHub" />
		);

		expect(screen.getByDisplayValue("GitHub")).toBeInTheDocument();
		expect(screen.getByDisplayValue("High Latency")).toBeInTheDocument();
		expect(screen.getByText("Notification Channels")).toBeInTheDocument();
	});

	it("displays rule type descriptions", () => {
		renderWithProvider(
			<AlertRuleForm datasourceId="api" datasourceName="API" />
		);

		expect(
			screen.getByText(/Alert when response time exceeds/)
		).toBeInTheDocument();
	});

	it("allows changing rule type", async () => {
		renderWithProvider(
			<AlertRuleForm datasourceId="api" />
		);

		const select = screen.getByDisplayValue("High Latency");
		fireEvent.change(select, { target: { value: "error_rate" } });

		await waitFor(() => {
			expect(
				screen.getByText(/Alert when error rate exceeds/)
			).toBeInTheDocument();
		});
	});

	it("allows selecting notification channels", () => {
		renderWithProvider(
			<AlertRuleForm datasourceId="api" />
		);

		const emailCheckbox = screen.getByRole("checkbox", { name: /email/i });
		const slackCheckbox = screen.getByRole("checkbox", { name: /slack/i });

		fireEvent.click(emailCheckbox);
		fireEvent.click(slackCheckbox);

		expect(emailCheckbox).toBeChecked();
		expect(slackCheckbox).toBeChecked();
	});

	it("sets threshold value", () => {
		renderWithProvider(
			<AlertRuleForm datasourceId="api" />
		);

		const thresholdInput = screen.getByPlaceholderText("e.g., 5000");
		expect((thresholdInput as HTMLInputElement).value).toBe("5000");
	});

	it("shows submit button for creating new rules", () => {
		renderWithProvider(
			<AlertRuleForm datasourceId="api" />
		);

		const submitButton = screen.getByRole("button", { name: /Create Rule/i });
		expect(submitButton).toBeInTheDocument();
		expect(submitButton).not.toBeDisabled();
	});

	it("pre-fills existing rule data", () => {
		const existingRule = {
			id: "rule-1",
			datasourceId: "github",
			ruleType: "error_rate" as const,
			threshold: 0.5,
			alertChannels: ["email", "slack"],
			enabled: true,
			cooldownSeconds: 7200,
		};

		renderWithProvider(
			<AlertRuleForm
				datasourceId="github"
				existingRule={existingRule}
			/>
		);

		expect(screen.getByDisplayValue("High Error Rate")).toBeInTheDocument();
		expect((screen.getByPlaceholderText("3600") as HTMLInputElement).value).toBe("7200");
	});
});
