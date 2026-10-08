import logo from "@/assets/la-gloria-logo.png.asset.json";
import demo from "@/assets/la-gloria-demo.mp4.asset.json";
import compatibleDemo from "@/assets/la-gloria-demo.webm.asset.json";
import burger from "@/assets/burger-editorial.jpg";
import griddle from "@/assets/griddle-editorial.jpg";

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
