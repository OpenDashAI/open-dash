import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AssetTracker,
  AssetTrackerData,
} from "../AssetTracker";

const mockTracker: AssetTrackerData = {
  assets: [
    {
      id: "broll-1",
      name: "K8s cluster demo",
      type: "broll",
      status: "ready",
    },
    {
      id: "graphics-1",
      name: "Architecture diagram animation",
      type: "graphics",
      status: "ready",
    },
    {
      id: "voiceover",
      name: "Main voiceover track",
      type: "voiceover",
      status: "ready",
    },
    {
      id: "music",
      name: "Background music",
      type: "music",
      status: "ready",
    },
  ],
  counts: {
    broll: { needed: 0, filming: 0, uploading: 0, ready: 24 },
    graphics: { needed: 2, designed: 0, animated: 18, ready: 18 },
    voiceover: { needed: 0, recorded: 1, editing: 0, ready: 1 },
    music: { needed: 0, selected: 0, licensed: 1, ready: 1 },
  },
  overallProgress: 85,
  lastUpdated: new Date().toISOString(),
};

describe("AssetTracker", () => {
  it("renders loading state", () => {
    render(<AssetTracker tracker={null} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMsg = "Failed to load assets";
    render(<AssetTracker tracker={null} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<AssetTracker tracker={null} />);
    expect(screen.getByText("No asset data")).toBeInTheDocument();
  });

  it("displays overall progress", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("displays B-roll status", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getByText(/B-Roll/)).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("displays graphics status", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getByText(/Graphics/)).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });

  it("displays voiceover status", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getByText(/Voiceover/)).toBeInTheDocument();
  });

  it("displays music status", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getByText(/Music/)).toBeInTheDocument();
  });

  it("shows ready count for B-roll", () => {
    render(<AssetTracker tracker={mockTracker} />);
    const readyElements = screen.getAllByText("Ready");
    expect(readyElements.length).toBeGreaterThan(0);
  });

  it("shows needed count when present", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getByText("2")).toBeInTheDocument(); // 2 graphics needed
  });

  it("displays last updated timestamp", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it("handles high progress correctly", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("handles low progress correctly", () => {
    const lowProgress: AssetTrackerData = {
      ...mockTracker,
      overallProgress: 30,
    };
    render(<AssetTracker tracker={lowProgress} />);
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("displays individual asset statuses", () => {
    render(<AssetTracker tracker={mockTracker} />);
    expect(screen.getAllByText("Ready")).toBeTruthy();
  });

  it("handles incomplete assets", () => {
    const incompleteTracker: AssetTrackerData = {
      ...mockTracker,
      counts: {
        ...mockTracker.counts,
        broll: { needed: 6, filming: 2, uploading: 1, ready: 24 },
      },
    };
    render(<AssetTracker tracker={incompleteTracker} />);
    expect(screen.getByText("6")).toBeInTheDocument(); // needed count
  });
});
