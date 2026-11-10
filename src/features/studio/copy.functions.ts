import { createServerFn } from "@tanstack/react-start";

export const generateCopyAI = createServerFn({ method: "POST" })
  .inputValidator((input: { event: string; tone: string; brandContext?: string; isGloria?: boolean }) => ({
    event: String(input.event).slice(0, 80),
    tone: String(input.tone).slice(0, 80),
    brandContext: input.brandContext ? String(input.brandContext).slice(0, 1000) : undefined,
    isGloria: input.isGloria ?? true,
  }))
  .handler(async ({ data }) => {
    const { generateAiCopy, CopyError } = await import("./copy.server");
    try {
      return { ok: true as const, ...(await generateAiCopy(data.event, data.tone, data.brandContext, data.isGloria)) };
    } catch (e) {
      console.error("AI copy failed", e);
      const msg = e instanceof CopyError ? e.message : "No se pudo generar el contenido. Intenta otra vez.";
      return { ok: false as const, error: msg };
    }
  });
