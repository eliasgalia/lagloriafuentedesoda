import logo from "@/assets/la-gloria-logo.png.asset.json";
import demo from "@/assets/la-gloria-demo.mp4.asset.json";
import compatibleDemo from "@/assets/la-gloria-demo.webm.asset.json";
import burger from "@/assets/burger-editorial.jpg";
import griddle from "@/assets/griddle-editorial.jpg";

export type ClientBrand = {
  id: string;
  name: string;
  logo: string;
  location: string;
  description: string;
  colors: { primary: string; agency: string; gold: string };
  handles: { instagram: string; tiktok: string; facebook: string };
  webhookUrl: string;
};

// White-label entry point: replace this configuration for the next agency client.
export const brandConfig = {
  agency: "Galia Studio",
  name: "La Gloria",
  fullName: "Fuente de Soda & Banquetería La Gloria",
  location: "Barrio Franklin, Santiago",
  since: "2020",
  logo: logo.url,
  colors: { primary: "#ff4500", agency: "#10b981", gold: "#d4af37" },
  handles: {
    instagram: "@lagloriafuentedesoda",
    tiktok: "@lagloria_franklin",
    facebook: "La Gloria",
  },
  demoVideo: compatibleDemo.url,
  originalVideo: demo.url,
  poster: burger,
  griddle,
};

export const defaultClient: ClientBrand = {
  id: "lagloriafuentedesoda",
  name: brandConfig.name,
  logo: brandConfig.logo,
  location: brandConfig.location,
  description: "Fuente de soda chilena tradicional de sándwiches gigantes y hamburguesas, desde 2020",
  colors: brandConfig.colors,
  handles: brandConfig.handles,
  webhookUrl: "",
};

export function resolveBrand(client: ClientBrand) {
  const isGloria = client.id === defaultClient.id;
  return {
    ...brandConfig,
    ...client,
    fullName: client.name,
    demoVideo: isGloria ? brandConfig.demoVideo : "",
    poster: isGloria ? brandConfig.poster : client.logo,
    griddle: isGloria ? brandConfig.griddle : client.logo,
  };
}

export function brandContext(client: ClientBrand) {
  return `${client.name}. ${client.description}. Ubicación: ${client.location || "no especificada"}. Instagram: ${client.handles.instagram || "no especificado"}.`;
}
