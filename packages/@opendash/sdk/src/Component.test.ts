import { describe, it, expect } from "vitest";
import {
  AbstractComponent,
  Component,
  ComponentConfig,
  ComponentInput,
  ComponentMetadata,
  ComponentOutput,
} from "./Component";

class TestComponent extends AbstractComponent {
  readonly metadata: ComponentMetadata = {
    id: "test",
    name: "Test Component",
    description: "A test component",
    team: "opendash",
    version: "1.0.0",
  };

  async initialize(config: ComponentConfig): Promise<void> {
    // No-op for testing
  }

  async execute(input: ComponentInput): Promise<ComponentOutput> {
    return { success: true, input };
  }

  render(data: unknown): React.ReactNode | null {
    return null;
  }
}

describe("Component Interface", () => {
  it("implements Component interface", () => {
    const component = new TestComponent();

    expect(component).toBeDefined();
    expect(component.metadata).toBeDefined();
    expect(component.metadata.id).toBe("test");
    expect(component.validate).toBeDefined();
    expect(component.initialize).toBeDefined();
    expect(component.execute).toBeDefined();
    expect(component.render).toBeDefined();
  });

  it("validates configuration", () => {
    const component = new TestComponent();
    const config: ComponentConfig = { key: "value" };

    expect(component.validate(config)).toBe(true);
  });

  it("executes with input", async () => {
    const component = new TestComponent();
    await component.initialize({});

    const input: ComponentInput = { data: "test" };
    const output = await component.execute(input);

    expect(output).toBeDefined();
    expect(output.success).toBe(true);
    expect(output.input).toEqual(input);
  });

  it("renders component", () => {
    const component = new TestComponent();
    const rendered = component.render({});

    expect(rendered).toBeNull();
  });

  it("tears down component", async () => {
    const component = new TestComponent();

    await expect(component.teardown?.()).resolves.toBeUndefined();
  });
});
