import { createServerFn } from "@tanstack/react-start";

export const generateCopyAI = createServerFn({ method: "POST" })
  .inputValidator((input: { event: string; tone: string }) => ({
    event: String(input.event).slice(0, 80),
    tone: String(input.tone).slice(0, 80),
  }))
  .handler(async ({ data }) => {
    const { generateAiCopy, CopyError } = await import("./copy.server");
    try {
      return { ok: true as const, ...(await generateAiCopy(data.event, data.tone)) };
    } catch (e) {
      console.error("AI copy failed", e);
      const msg = e instanceof CopyError ? e.message : "No se pudo generar el contenido. Intenta otra vez.";
      return { ok: false as const, error: msg };
    }
  });
