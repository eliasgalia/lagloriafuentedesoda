import { createServerFn } from "@tanstack/react-start";

// Issues a one-time signed upload slot in the private "renders" bucket.
export const createUploadSlot = createServerFn({ method: "POST" })
  .inputValidator((d: { ext: string }) => ({ ext: d.ext === "mp4" ? "mp4" : "webm" }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `reels/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${data.ext}`;
    const { data: slot, error } = await supabaseAdmin.storage
      .from("renders")
      .createSignedUploadUrl(path);
    if (error || !slot) throw new Error(error?.message ?? "No se pudo preparar la subida");
    return { path, token: slot.token };
  });

// Returns a 7-day download link Make/n8n can fetch.
export const getVideoUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { path: string }) => {
    if (!/^reels\/[\d-]+\/[0-9a-f-]{36}\.(mp4|webm)$/.test(d.path)) throw new Error("Ruta inválida");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: s, error } = await supabaseAdmin.storage
      .from("renders")
      .createSignedUrl(data.path, 60 * 60 * 24 * 7);
    if (error || !s) throw new Error(error?.message ?? "No se pudo crear el enlace");
    return { url: s.signedUrl };
  });
