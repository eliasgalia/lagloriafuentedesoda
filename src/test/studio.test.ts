import { describe, expect, it } from "vitest";
import { generateCopy, initialPosts, useStudio } from "@/features/studio/store";

describe("La Gloria content engine", () => {
  it("generates contextual copy for every event and tone", () => {
    for (const event of [
      "Hamburguesa Estrella",
      "Banquetería B2B",
      "Plato del Día",
      "Promo Fin de Semana",
      "Humor / Detrás de Cocina",
    ]) {
      for (const tone of [
        "Picada Chilena Tradicional",
        "Corporativo / Empresas",
        "Divertido & Cercano",
        "Gen Z / Picante",
      ]) {
        const result = generateCopy(event, tone, 0);
        expect(result.hook.length).toBeGreaterThan(10);
        expect(result.caption.split("\n")).toHaveLength(5);
        expect(result.caption).toContain("WhatsApp");
        expect(result.hashtags).toContain("#LaGloriaFranklin");
      }
    }
  });
  it("offers fresh variations and safe fallback copy", () => {
    expect(generateCopy("Hamburguesa Estrella", "Picada Chilena Tradicional", 0).hook).not.toBe(
      generateCopy("Hamburguesa Estrella", "Picada Chilena Tradicional", 1).hook,
    );
    expect(generateCopy("unknown", "unknown", 0).hook).toBeTruthy();
  });
  it("starts with six posts across all content states", () => {
    expect(initialPosts).toHaveLength(6);
    expect(new Set(initialPosts.map((p) => p.status)).size).toBe(3);
  });
  it("updates overlay settings without discarding other state", () => {
    const caption = useStudio.getState().caption;
    useStudio.getState().update({ size: 35, x: 20, y: 30 });
    expect(useStudio.getState().size).toBe(35);
    expect(useStudio.getState().caption).toBe(caption);
  });
});
