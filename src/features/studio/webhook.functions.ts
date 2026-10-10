import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Server-side relay avoids browser CORS limits of Make.com / n8n webhooks.
export const sendWebhook = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        url: z
          .string()
          .url()
          .refine((u) => u.startsWith("https://"), "La URL debe comenzar con https://"),
        payload: z.record(z.string(), z.unknown()),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const res = await fetch(data.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.payload),
      });
      const body = (await res.text()).slice(0, 300);
      return { ok: res.ok, status: res.status, body };
    } catch (e) {
      return { ok: false, status: 0, body: e instanceof Error ? e.message : "Error de red" };
    }
  });
