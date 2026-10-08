import { createFileRoute } from "@tanstack/react-router";
import { StudioApp } from "@/features/studio/StudioApp";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Gloria Content Studio | Galia Studio" },
      {
        name: "description",
        content:
          "Crea reels de La Gloria con tu sello: video, logo, textos y planificación en un solo estudio creativo.",
      },
      { property: "og:title", content: "La Gloria Content Studio | Galia Studio" },
      {
        property: "og:description",
        content: "Del Barrio Franklin al feed. El estudio creativo de Fuente de Soda La Gloria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <StudioApp />,
});
