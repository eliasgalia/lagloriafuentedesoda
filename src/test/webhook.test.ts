import { describe, it, expect } from "vitest";
import { buildPayload } from "@/features/studio/webhook";

const base = {
  hook: "H",
  caption: "C",
  hashtags: "#A #B\n#C",
  channels: ["Instagram", "TikTok"],
  date: "2026-10-12",
  time: "13:00",
  fileName: "v.mp4",
  x: 80,
  y: 80,
  size: 25,
  opacity: 90,
  bannerText: "b",
};

describe("webhook payload", () => {
  it("now sends null scheduledAt", () => {
    expect(buildPayload({ ...base, mode: "now" }).scheduledAt).toBeNull();
  });
  it("later uses Chile -03:00", () => {
    expect(buildPayload({ ...base, mode: "later" }).scheduledAt).toBe("2026-10-12T13:00:00-03:00");
  });
  it("lowercases channels and splits hashtags", () => {
    const p = buildPayload({ ...base, mode: "now" });
    expect(p.channels).toEqual(["instagram", "tiktok"]);
    expect(p.hashtags).toEqual(["#A", "#B", "#C"]);
    expect(p.video.config.logoPosition).toBe("bottom-right");
    expect(p.source).toBe("galia-studio-v1");
  });
});
