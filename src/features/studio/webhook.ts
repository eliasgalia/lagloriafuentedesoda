export const WEBHOOK_KEY = "galia_webhook_url";

export function logoPosition(x: number, y: number, size: number) {
  const cx = x + size / 2;
  const v = y < 50 ? "top" : "bottom";
  if (cx > 35 && cx < 65 && y > 25 && y < 65) return "center";
  return `${v}-${cx < 50 ? "left" : "right"}`;
}

export function buildPayload(opts: {
  hook: string;
  caption: string;
  hashtags: string;
  channels: string[];
  scheduledAt: string | null;
  x: number;
  y: number;
  size: number;
  opacity: number;
  bannerText: string;
}) {
  return {
    brand: "lagloriafuentedesoda",
    hook: opts.hook,
    caption: opts.caption,
    hashtags: opts.hashtags.split(/\s+/).filter((t) => t.startsWith("#")),
    channels: opts.channels.map((c) => c.toLowerCase()),
    scheduledAt: opts.scheduledAt,
    video: {
      filename: "la_gloria_reel.mp4",
      config: {
        logoPosition: logoPosition(opts.x, opts.y, opts.size),
        logoSize: opts.size,
        logoOpacity: opts.opacity,
        bannerText: opts.bannerText,
      },
    },
    source: "galia-studio-v1",
  };
}
