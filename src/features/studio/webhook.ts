export const WEBHOOK_KEY = "galia_webhook_url";

export type PayloadInput = {
  hook: string;
  caption: string;
  hashtags: string;
  channels: string[];
  mode: "now" | "later";
  date: string;
  time: string;
  fileName: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  bannerText: string;
};

export function logoPosition(x: number, y: number) {
  if (x > 35 && x < 55 && y > 35 && y < 55) return "center";
  return `${y < 50 ? "top" : "bottom"}-${x < 50 ? "left" : "right"}`;
}

export function buildPayload(i: PayloadInput) {
  return {
    brand: "lagloriafuentedesoda",
    hook: i.hook,
    caption: i.caption,
    hashtags: i.hashtags.split(/\s+/).filter((h) => h.startsWith("#")),
    channels: i.channels.map((c) => c.toLowerCase()),
    scheduledAt: i.mode === "later" ? `${i.date}T${i.time}:00-03:00` : null,
    video: {
      filename: i.fileName,
      config: {
        logoPosition: logoPosition(i.x, i.y),
        logoSize: i.size,
        logoOpacity: i.opacity,
        bannerText: i.bannerText,
      },
    },
    source: "galia-studio-v1",
  };
}

export function isValidWebhook(url: string) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export async function sendWebhook(url: string, body: unknown) {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("No se pudo conectar (red o CORS bloqueado).");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${text ? ` · ${text.slice(0, 120)}` : ""}`);
  }
  return res.status;
}
