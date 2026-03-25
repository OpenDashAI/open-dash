import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ExportManager,
  ExportManagerData,
} from "../ExportManager";

const mockManager: ExportManagerData = {
  overallStatus: "uploaded",
  files: [
    {
      format: "ProRes 4K",
      resolution: "4K (3840x2160)",
      fileSize: "2.4GB",
      status: "ready",
    },
    {
      format: "H.264 1080p",
      resolution: "1080p (1920x1080)",
      fileSize: "450MB",
      status: "uploaded",
    },
    {
      format: "H.264 720p",
      resolution: "720p (1280x720)",
      fileSize: "180MB",
      status: "uploaded",
    },
  ],
  masterFile: {
    size: "2.4GB",
    codec: "ProRes 422 HQ",
    ready: true,
  },
  youtubeData: {
    title: "OpenDash Component Architecture Explainer",
    description:
      "Learn how OpenDash components work and why they're sticky...",
    status: "live",
    videoId: "abc123def456",
    url: "https://youtube.com/watch?v=abc123def456",
    uploadProgress: 100,
  },
  lastUpdated: new Date().toISOString(),
};

describe("ExportManager", () => {
  it("renders loading state", () => {
    render(<ExportManager manager={null} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMsg = "Failed to load export status";
    render(<ExportManager manager={null} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("displays overall status", () => {
    render(<ExportManager manager={mockManager} />);
    expect(screen.getByText("Uploaded")).toBeInTheDocument();
  });

  it("displays master file info", () => {
    render(<ExportManager manager={mockManager} />);
    expect(screen.getByText("2.4GB")).toBeInTheDocument();
    expect(screen.getByText("ProRes 422 HQ")).toBeInTheDocument();
  });

  it("displays export progress", () => {
    render(<ExportManager manager={mockManager} />);
    expect(screen.getByText(/Formats Exported/)).toBeInTheDocument();
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("lists all file formats", () => {
    render(<ExportManager manager={mockManager} />);
    expect(screen.getByText("ProRes 4K")).toBeInTheDocument();
    expect(screen.getByText("H.264 1080p")).toBeInTheDocument();
    expect(screen.getByText("H.264 720p")).toBeInTheDocument();
  });

  it("displays YouTube video status", () => {
    render(<ExportManager manager={mockManager} />);
    expect(screen.getByText(/YouTube/)).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("displays YouTube video URL", () => {
    render(<ExportManager manager={mockManager} />);
    expect(screen.getByText(/youtube.com/)).toBeInTheDocument();
  });

  it("displays last updated timestamp", () => {
    render(<ExportManager manager={mockManager} />);
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it("handles pending status", () => {
    const pendingManager: ExportManagerData = {
      ...mockManager,
      overallStatus: "pending",
    };
    render(<ExportManager manager={pendingManager} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("handles exporting status", () => {
    const exportingManager: ExportManagerData = {
      ...mockManager,
      overallStatus: "exporting",
    };
    render(<ExportManager manager={exportingManager} />);
    expect(screen.getByText("Exporting...")).toBeInTheDocument();
  });

  it("displays upload progress when uploading", () => {
    const uploadingManager: ExportManagerData = {
      ...mockManager,
      youtubeData: {
        ...mockManager.youtubeData!,
        status: "pending",
        uploadProgress: 65,
      },
    };
    render(<ExportManager manager={uploadingManager} />);
    expect(screen.getByText("65%")).toBeInTheDocument();
  });
});
