import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { brandSnapshot } from "./brandPrompt";

export type AiCopy = { hook: string; caption: string; hashtags: string };

export class CopyError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function generateAiCopy(event: string, tone: string): Promise<AiCopy> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new CopyError("La IA no está configurada.", 401);
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      if (res.status === 402) throw new CopyError("Se acabaron los créditos de IA del workspace.", 402);
      if (res.status === 429) throw new CopyError("Demasiadas solicitudes. Intenta en un minuto.", 429);
      return res;
    },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: `Eres el copywriter de redes sociales de ${brandSnapshot}. Escribes en español chileno para Reels/TikTok. Responde SOLO con JSON válido: {"hook": string, "caption": string, "hashtags": string}. hook: máximo 60 caracteres, en MAYÚSCULAS, magnético, con signos ¿?! o emoji. caption: 4-5 líneas separadas por \\n, con emojis, referencias locales (Barrio Franklin, Santiago) y cierre con CTA a pedir por WhatsApp. hashtags: 6-8 hashtags separados por espacio, incluye siempre #LaGloriaFranklin #BarrioFranklin #GaliaDigital. No inventes precios ni teléfonos.`,
    prompt: `Tipo de contenido: ${event}. Tono de voz: ${tone}. Crea una versión nueva y original.`,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new CopyError("La IA no devolvió contenido. Intenta otra vez.", 502);
  const parsed = JSON.parse(match[0]) as Partial<AiCopy>;
  if (!parsed.hook || !parsed.caption || !parsed.hashtags)
    throw new CopyError("Respuesta incompleta de la IA.", 502);
  return { hook: parsed.hook.trim(), caption: parsed.caption.trim(), hashtags: parsed.hashtags.trim() };
}
