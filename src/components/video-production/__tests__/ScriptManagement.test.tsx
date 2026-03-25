import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ScriptManagement,
  ScriptData,
} from "../ScriptManagement";

const mockScript: ScriptData = {
  status: "draft",
  totalWordCount: 2045,
  targetWordCount: 2000,
  readingTimeMinutes: 8.5,
  sections: [
    { name: "hook", wordCount: 250, status: "ready" },
    { name: "problem", wordCount: 450, status: "ready" },
    { name: "solution", wordCount: 900, status: "draft" },
    { name: "power", wordCount: 300, status: "draft" },
    { name: "cta", wordCount: 145, status: "draft" },
  ],
  principles: {
    visualNarrative: true,
    emotionalHooks: true,
    pacing: true,
    clarity: false,
    cta: true,
  },
  lastUpdated: new Date().toISOString(),
};

describe("ScriptManagement", () => {
  it("renders loading state", () => {
    render(<ScriptManagement script={null} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMsg = "Failed to load script";
    render(<ScriptManagement script={null} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<ScriptManagement script={null} />);
    expect(screen.getByText("No script data")).toBeInTheDocument();
  });

  it("displays script status", () => {
    render(<ScriptManagement script={mockScript} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("displays word count", () => {
    render(<ScriptManagement script={mockScript} />);
    expect(screen.getByText(/2045/)).toBeInTheDocument();
    expect(screen.getByText(/2000/)).toBeInTheDocument();
  });

  it("displays reading time", () => {
    render(<ScriptManagement script={mockScript} />);
    const readingTime = screen.getByText(/Reading Time/);
    expect(readingTime).toBeInTheDocument();
  });

  it("displays all sections with word counts", () => {
    const { container } = render(<ScriptManagement script={mockScript} />);
    expect(container.textContent).toContain("hook");
    expect(container.textContent).toContain("problem");
    expect(container.textContent).toContain("solution");
    expect(container.textContent).toContain("power");
  });

  it("displays principles checklist", () => {
    render(<ScriptManagement script={mockScript} />);
    expect(screen.getByText(/Principles Checklist/)).toBeInTheDocument();
    // 4 out of 5 principles fulfilled = 80%
    expect(screen.getByText("4 / 5")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("shows approved status", () => {
    const approvedScript: ScriptData = {
      ...mockScript,
      status: "approved",
    };
    render(<ScriptManagement script={approvedScript} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("shows review status", () => {
    const reviewScript: ScriptData = {
      ...mockScript,
      status: "review",
    };
    render(<ScriptManagement script={reviewScript} />);
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("handles word count at target", () => {
    const atTarget: ScriptData = {
      ...mockScript,
      totalWordCount: 2000,
    };
    render(<ScriptManagement script={atTarget} />);
    expect(screen.getByText("2000")).toBeInTheDocument();
  });

  it("handles word count too short", () => {
    const tooShort: ScriptData = {
      ...mockScript,
      totalWordCount: 1500,
    };
    render(<ScriptManagement script={tooShort} />);
    expect(screen.getByText("1500")).toBeInTheDocument();
  });

  it("handles word count too long", () => {
    const tooLong: ScriptData = {
      ...mockScript,
      totalWordCount: 2500,
    };
    render(<ScriptManagement script={tooLong} />);
    expect(screen.getByText("2500")).toBeInTheDocument();
  });

  it("displays last updated timestamp", () => {
    render(<ScriptManagement script={mockScript} />);
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it("displays all principles in checklist", () => {
    const { container } = render(<ScriptManagement script={mockScript} />);
    expect(container.textContent).toContain("visual");
    expect(container.textContent).toContain("emotional");
    expect(container.textContent).toContain("pacing");
    expect(container.textContent).toContain("clarity");
    expect(container.textContent).toContain("Principles Checklist");
  });
});
