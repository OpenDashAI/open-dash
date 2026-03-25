import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  CompositionTracker,
  CompositionTrackerData,
} from "../CompositionTracker";

const mockTracker: CompositionTrackerData = {
  totalScenes: 48,
  completedScenes: 32,
  inProgressScene: 34,
  tasks: [
    {
      sceneNumber: 1,
      status: "completed",
      progress: 100,
      completedAt: new Date().toISOString(),
    },
    {
      sceneNumber: 34,
      status: "in-progress",
      progress: 45,
      startedAt: new Date().toISOString(),
    },
    {
      sceneNumber: 35,
      status: "queued",
      progress: 0,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

describe("CompositionTracker", () => {
  it("renders loading state", () => {
    render(<CompositionTracker tracker={null} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMsg = "Failed to load composition";
    render(<CompositionTracker tracker={null} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("displays scene completion progress", () => {
    render(<CompositionTracker tracker={mockTracker} />);
    expect(screen.getByText(/Scenes Completed/)).toBeInTheDocument();
    expect(screen.getByText(/32/)).toBeInTheDocument();
    expect(screen.getByText(/48/)).toBeInTheDocument();
  });

  it("displays current in-progress scene", () => {
    render(<CompositionTracker tracker={mockTracker} />);
    expect(screen.getByText("Currently In Progress")).toBeInTheDocument();
    expect(screen.getByText("Scene 34")).toBeInTheDocument();
  });

  it("displays overall progress percentage", () => {
    render(<CompositionTracker tracker={mockTracker} />);
    expect(screen.getByText(/Overall Progress/)).toBeInTheDocument();
  });

  it("shows task status counts", () => {
    const { container } = render(<CompositionTracker tracker={mockTracker} />);
    expect(container.textContent).toContain("Completed");
    expect(container.textContent).toContain("Queued");
  });

  it("displays last updated timestamp", () => {
    render(<CompositionTracker tracker={mockTracker} />);
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it("handles no in-progress scene", () => {
    const trackerNoProgress: CompositionTrackerData = {
      ...mockTracker,
      inProgressScene: undefined,
    };
    render(<CompositionTracker tracker={trackerNoProgress} />);
    expect(
      screen.queryByText("Currently In Progress")
    ).not.toBeInTheDocument();
  });
});
