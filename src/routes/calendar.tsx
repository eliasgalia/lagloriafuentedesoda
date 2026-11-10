import { createFileRoute } from "@tanstack/react-router";
import { StudioApp } from "@/features/studio/StudioApp";
export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendario de clientes | Galia Studio" },
      {
        name: "description",
        content:
          "Planifica el contenido de cada cliente. Revisa reels publicados, programados y borradores en Galia Studio.",
      },
      { property: "og:title", content: "Calendario de clientes | Galia Studio" },
      {
        property: "og:description",
        content:
          "El calendario de contenido creativo de tus clientes en Galia Digital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <StudioApp view="calendar" />,
});
