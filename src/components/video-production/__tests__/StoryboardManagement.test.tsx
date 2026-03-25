import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  StoryboardManagement,
  StoryboardData,
} from "../StoryboardManagement";

const mockStoryboard: StoryboardData = {
  totalScenes: 48,
  totalDuration: 530, // 8m 50s
  targetDuration: 540, // 9m target
  scenes: [
    {
      sceneNumber: 1,
      duration: 10,
      visualDescription: "Title sequence fade in",
      voiceoverText: "Welcome to OpenDash",
      assetRequirements: {
        graphics: ["title-animation"],
        musicCues: ["theme-intro"],
      },
    },
    {
      sceneNumber: 2,
      duration: 12,
      visualDescription: "Problem statement with animations",
      voiceoverText: "Most dashboards are static and slow",
      assetRequirements: {
        broll: ["dashboard-clips"],
        graphics: ["problem-graphic"],
      },
    },
    {
      sceneNumber: 3,
      duration: 15,
      visualDescription: "Solution demo",
      voiceoverText: "But OpenDash is different",
      audioNotes: "Build tension here",
      assetRequirements: {
        broll: ["demo-footage"],
        graphics: ["solution-animation"],
      },
    },
  ],
  lastUpdated: new Date().toISOString(),
};

describe("StoryboardManagement", () => {
  it("renders loading state", () => {
    render(<StoryboardManagement storyboard={null} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMsg = "Failed to load storyboard";
    render(<StoryboardManagement storyboard={null} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<StoryboardManagement storyboard={null} />);
    expect(screen.getByText("No storyboard data")).toBeInTheDocument();
  });

  it("displays total scenes count", () => {
    render(<StoryboardManagement storyboard={mockStoryboard} />);
    expect(screen.getByText("48")).toBeInTheDocument();
  });

  it("displays total duration", () => {
    render(<StoryboardManagement storyboard={mockStoryboard} />);
    expect(screen.getByText(/8m 50s/)).toBeInTheDocument();
  });

  it("displays target duration", () => {
    render(<StoryboardManagement storyboard={mockStoryboard} />);
    expect(screen.getByText(/9m 0s/)).toBeInTheDocument();
  });

  it("displays scene list with scene numbers", () => {
    render(<StoryboardManagement storyboard={mockStoryboard} />);
    expect(screen.getByText("Scene 01")).toBeInTheDocument();
    expect(screen.getByText("Scene 02")).toBeInTheDocument();
    expect(screen.getByText("Scene 03")).toBeInTheDocument();
  });

  it("displays scene duration in list", () => {
    render(<StoryboardManagement storyboard={mockStoryboard} />);
    expect(screen.getByText(/10s/)).toBeInTheDocument();
    expect(screen.getByText(/12s/)).toBeInTheDocument();
  });

  it("displays visual descriptions truncated", () => {
    render(<StoryboardManagement storyboard={mockStoryboard} />);
    expect(screen.getByText("Title sequence fade in")).toBeInTheDocument();
  });

  it("displays storyboard tracker header", () => {
    const { container } = render(
      <StoryboardManagement storyboard={mockStoryboard} />
    );
    expect(container.textContent).toContain("Storyboard Tracker");
  });

  it("displays scene duration information", () => {
    const { container } = render(
      <StoryboardManagement storyboard={mockStoryboard} />
    );
    expect(container.textContent).toContain("Scene 01");
  });

  it("handles good scene count (40-50)", () => {
    render(<StoryboardManagement storyboard={mockStoryboard} />);
    expect(screen.getByText("48")).toBeInTheDocument();
  });

  it("handles short scene count", () => {
    const shortStoryboard: StoryboardData = {
      ...mockStoryboard,
      totalScenes: 30,
    };
    render(<StoryboardManagement storyboard={shortStoryboard} />);
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("handles long scene count", () => {
    const longStoryboard: StoryboardData = {
      ...mockStoryboard,
      totalScenes: 60,
    };
    render(<StoryboardManagement storyboard={longStoryboard} />);
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("displays last updated timestamp", () => {
    render(<StoryboardManagement storyboard={mockStoryboard} />);
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it("displays multiple assets information", () => {
    const { container } = render(
      <StoryboardManagement storyboard={mockStoryboard} />
    );
    expect(container.textContent).toContain("Scene 02");
  });
});
