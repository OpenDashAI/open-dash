import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  QualityChecker,
  QualityCheckerData,
} from "../QualityChecker";

const mockChecker: QualityCheckerData = {
  overallStatus: "passing",
  checks: [
    {
      name: "Word count (2000±300)",
      category: "script",
      passed: true,
      automated: true,
      details: "2045 words",
    },
    {
      name: "Reading time (8-12 min)",
      category: "script",
      passed: true,
      automated: true,
      details: "8m 50s",
    },
    {
      name: "Scene count (40-50)",
      category: "storyboard",
      passed: true,
      automated: true,
      details: "48 scenes",
    },
    {
      name: "Total duration match",
      category: "storyboard",
      passed: true,
      automated: true,
      details: "8m 50s vs 9m target",
    },
    {
      name: "All assets collected",
      category: "assets",
      passed: true,
      automated: false,
      details: "Manual verification",
    },
  ],
  passedCount: 5,
  totalCount: 5,
  blocksExport: false,
  lastUpdated: new Date().toISOString(),
};

describe("QualityChecker", () => {
  it("renders loading state", () => {
    render(<QualityChecker checker={null} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMsg = "Failed to load quality checks";
    render(<QualityChecker checker={null} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("displays overall status", () => {
    render(<QualityChecker checker={mockChecker} />);
    expect(screen.getByText("Passing")).toBeInTheDocument();
  });

  it("displays passed check count", () => {
    render(<QualityChecker checker={mockChecker} />);
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
  });

  it("displays all checks when passing", () => {
    render(<QualityChecker checker={mockChecker} />);
    expect(screen.getByText(/Categories/)).toBeInTheDocument();
  });

  it("shows blocked export warning when needed", () => {
    const blockedChecker: QualityCheckerData = {
      ...mockChecker,
      blocksExport: true,
    };
    render(<QualityChecker checker={blockedChecker} />);
    expect(screen.getByText(/Blocks Export/)).toBeInTheDocument();
  });

  it("displays last updated timestamp", () => {
    render(<QualityChecker checker={mockChecker} />);
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it("handles failing status", () => {
    const failingChecker: QualityCheckerData = {
      ...mockChecker,
      overallStatus: "failing",
      passedCount: 3,
      checks: [
        ...mockChecker.checks.slice(0, 3),
        {
          name: "Audio levels balanced",
          category: "composition",
          passed: false,
          automated: false,
          severity: "critical",
          details: "Some scenes too quiet",
        },
      ],
    };
    render(<QualityChecker checker={failingChecker} />);
    expect(screen.getByText("Failing")).toBeInTheDocument();
  });
});
