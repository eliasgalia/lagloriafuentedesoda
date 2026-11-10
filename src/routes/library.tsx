import { createFileRoute } from "@tanstack/react-router";
import { StudioApp } from "@/features/studio/StudioApp";
export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Biblioteca de clientes | Galia Studio" },
      {
        name: "description",
        content:
          "Organiza clips, reels y videos de cada cliente de Galia Digital y revisa sus resultados de demostración.",
      },
      { property: "og:title", content: "Biblioteca de clientes | Galia Studio" },
      {
        property: "og:description",
        content: "El archivo creativo de cada marca en Galia Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <StudioApp view="library" />,
});
