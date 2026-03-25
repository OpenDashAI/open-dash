import { describe, it, expect, beforeEach } from "vitest";
import { ComponentRegistry } from "./ComponentRegistry";
import { AbstractComponent, ComponentMetadata, ComponentInput, ComponentOutput } from "./Component";

class MockComponent extends AbstractComponent {
  constructor(id: string, team: "opendash" | "virtual-media" = "opendash") {
    super();
    this._id = id;
    this._team = team;
  }

  private _id: string;
  private _team: "opendash" | "virtual-media";

  readonly metadata: ComponentMetadata = {
    get id() {
      return this._id;
    },
    name: `Mock ${this._id}`,
    description: "Mock component for testing",
    team: this._team,
    version: "1.0.0",
  };

  async initialize(): Promise<void> {}
  async execute(input: ComponentInput): Promise<ComponentOutput> {
    return input;
  }
  render(): null {
    return null;
  }
}

describe("ComponentRegistry", () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
  });

  it("registers a component", () => {
    const component = new MockComponent("test");
    registry.register(component);

    expect(registry.count()).toBe(1);
    expect(registry.has("test")).toBe(true);
  });

  it("retrieves a component by ID", () => {
    const component = new MockComponent("test");
    registry.register(component);

    const retrieved = registry.get("test");
    expect(retrieved).toBe(component);
  });

  it("returns undefined for non-existent component", () => {
    const retrieved = registry.get("non-existent");
    expect(retrieved).toBeUndefined();
  });

  it("gets all registered components", () => {
    const comp1 = new MockComponent("comp1");
    const comp2 = new MockComponent("comp2");

    registry.register(comp1);
    registry.register(comp2);

    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(comp1);
    expect(all).toContain(comp2);
  });

  it("gets metadata for all components", () => {
    const comp1 = new MockComponent("comp1");
    const comp2 = new MockComponent("comp2");

    registry.register(comp1);
    registry.register(comp2);

    const metadata = registry.getAllMetadata();
    expect(metadata).toHaveLength(2);
    expect(metadata[0].id).toBe("comp1");
    expect(metadata[1].id).toBe("comp2");
  });

  it("gets components by team", () => {
    const openDash = new MockComponent("od1", "opendash");
    const vmTeam = new MockComponent("vm1", "virtual-media");

    registry.register(openDash);
    registry.register(vmTeam);

    const openDashComps = registry.getByTeam("opendash");
    const vmComps = registry.getByTeam("virtual-media");

    expect(openDashComps).toHaveLength(1);
    expect(vmComps).toHaveLength(1);
  });

  it("unregisters a component", () => {
    const component = new MockComponent("test");
    registry.register(component);

    expect(registry.count()).toBe(1);

    registry.unregister("test");

    expect(registry.count()).toBe(0);
    expect(registry.has("test")).toBe(false);
  });

  it("clears all components", () => {
    registry.register(new MockComponent("comp1"));
    registry.register(new MockComponent("comp2"));

    expect(registry.count()).toBe(2);

    registry.clear();

    expect(registry.count()).toBe(0);
  });

  it("lists all component IDs", () => {
    registry.register(new MockComponent("comp1"));
    registry.register(new MockComponent("comp2"));
    registry.register(new MockComponent("comp3"));

    const list = registry.list();

    expect(list).toEqual(["comp1", "comp2", "comp3"]);
  });

  it("throws error on duplicate registration", () => {
    const component = new MockComponent("test");
    registry.register(component);

    expect(() => {
      registry.register(component);
    }).toThrow('Component with id "test" is already registered');
  });
});
