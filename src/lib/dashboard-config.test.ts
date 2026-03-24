import { describe, it, expect } from "vitest";
import {
	DashboardYamlSchema,
	parseDashboardYaml,
	validateDashboardYaml,
} from "./dashboard-config";

describe("DashboardYamlSchema", () => {
	it("should validate a minimal config", () => {
		const config = {
			brand: "test-brand",
			domain: "test.com",
			sources: [],
			widgets: [],
		};

		const result = DashboardYamlSchema.safeParse(config);
		expect(result.success).toBe(true);
	});

	it("should validate a full config with all fields", () => {
		const config = {
			brand: "llc-tax",
			domain: "llctax.com",
			description: "LLC tax platform",
			sources: [
				{
					id: "github-issues",
					config: {
						repo: "garywu/llc-tax",
						labels: ["bug", "feature"],
					},
				},
				{
					id: "stripe",
					config: {
						label: "llc-tax",
					},
				},
			],
			widgets: [
				{
					type: "issue_list",
					source: "github-issues",
					title: "Open Issues",
					config: {
						limit: 10,
					},
				},
				{
					type: "revenue",
					source: "stripe",
					title: "Revenue",
				},
			],
		};

		const result = DashboardYamlSchema.safeParse(config);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.brand).toBe("llc-tax");
			expect(result.data.sources).toHaveLength(2);
			expect(result.data.widgets).toHaveLength(2);
		}
	});

	it("should reject config missing required 'brand' field", () => {
		const config = {
			domain: "test.com",
			sources: [],
			widgets: [],
		};

		const result = DashboardYamlSchema.safeParse(config);
		expect(result.success).toBe(false);
	});

	it("should reject config missing required 'domain' field", () => {
		const config = {
			brand: "test",
			sources: [],
			widgets: [],
		};

		const result = DashboardYamlSchema.safeParse(config);
		expect(result.success).toBe(false);
	});

	it("should allow optional 'description' field", () => {
		const configWithDescription = {
			brand: "test",
			domain: "test.com",
			description: "Test brand",
			sources: [],
			widgets: [],
		};

		const result = DashboardYamlSchema.safeParse(configWithDescription);
		expect(result.success).toBe(true);
	});

	it("should allow empty sources and widgets arrays", () => {
		const config = {
			brand: "test",
			domain: "test.com",
			sources: [],
			widgets: [],
		};

		const result = DashboardYamlSchema.safeParse(config);
		expect(result.success).toBe(true);
	});

	it("should validate sources with arbitrary config", () => {
		const config = {
			brand: "test",
			domain: "test.com",
			sources: [
				{
					id: "custom-source",
					config: {
						anyKey: "anyValue",
						nested: { foo: "bar" },
						array: [1, 2, 3],
					},
				},
			],
			widgets: [],
		};

		const result = DashboardYamlSchema.safeParse(config);
		expect(result.success).toBe(true);
	});

	it("should validate widgets with optional fields", () => {
		const config = {
			brand: "test",
			domain: "test.com",
			sources: [],
			widgets: [
				{
					type: "issue_list",
				},
				{
					type: "revenue",
					source: "stripe",
				},
				{
					type: "traffic",
					source: "plausible",
					title: "Traffic",
					config: { period: "7d" },
				},
			],
		};

		const result = DashboardYamlSchema.safeParse(config);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.widgets).toHaveLength(3);
		}
	});
});

describe("parseDashboardYaml", () => {
	it("should parse valid config", () => {
		const config = {
			brand: "test",
			domain: "test.com",
			sources: [],
			widgets: [],
		};

		const result = parseDashboardYaml(config);
		expect(result.brand).toBe("test");
		expect(result.domain).toBe("test.com");
	});

	it("should throw on invalid config", () => {
		const config = {
			domain: "test.com",
			// missing 'brand'
			sources: [],
			widgets: [],
		};

		expect(() => parseDashboardYaml(config)).toThrow();
	});
});

describe("validateDashboardYaml", () => {
	it("should return success for valid config", () => {
		const config = {
			brand: "test",
			domain: "test.com",
			sources: [],
			widgets: [],
		};

		const result = validateDashboardYaml(config);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.brand).toBe("test");
		}
	});

	it("should return errors for invalid config", () => {
		const config = {
			domain: "test.com",
			// missing 'brand'
			sources: [],
			widgets: [],
		};

		const result = validateDashboardYaml(config);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors[0]).toContain("brand");
		}
	});

	it("should provide detailed error messages", () => {
		const config = {
			brand: "test",
			domain: "test.com",
			sources: [
				{
					id: "test",
					// config is optional, so this is fine
				},
			],
			widgets: [
				{
					type: "test",
					// all widget fields are optional
				},
			],
		};

		const result = validateDashboardYaml(config);
		expect(result.success).toBe(true);
	});
});
