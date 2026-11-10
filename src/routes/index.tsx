import { createFileRoute } from "@tanstack/react-router";
import { StudioApp } from "@/features/studio/StudioApp";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estudio de contenido para pymes | Galia Studio" },
      {
        name: "description",
        content:
          "Crea reels para tus clientes con sus logos, colores, textos y automatizaciones en Galia Studio.",
      },
      { property: "og:title", content: "Estudio de contenido para pymes | Galia Studio" },
      {
        property: "og:description",
        content: "El estudio creativo de Galia Digital para La Gloria y tus próximos clientes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <StudioApp />,
});
