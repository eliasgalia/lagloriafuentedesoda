import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { defaultClient, resolveBrand, type ClientBrand } from "./brandConfig";
export type Post = {
  id: string;
  title: string;
  status: "published" | "scheduled" | "draft";
  day: number;
  date?: string;
  time: string;
  image: "burger" | "griddle";
  views: string;
  likes: number;
  comments: number;
  channels: string[];
};
export const initialPosts: Post[] = [
  {
    id: "1",
    title: "La gigante de Franklin 🍔",
    status: "published",
    day: 0,
    time: "13:00",
    image: "burger",
    views: "12,4 mil",
    likes: 846,
    comments: 52,
    channels: ["Instagram", "TikTok"],
  },
  {
    id: "2",
    title: "El sonido de la gloria 🔥",
    status: "published",
    day: 1,
    time: "19:30",
    image: "griddle",
    views: "8,2 mil",
    likes: 512,
    comments: 31,
    channels: ["Instagram"],
  },
  {
    id: "3",
    title: "Una pausa con sabor a barrio",
    status: "published",
    day: 2,
    time: "12:00",
    image: "burger",
    views: "6,8 mil",
    likes: 403,
    comments: 24,
    channels: ["TikTok"],
  },
  {
    id: "4",
    title: "Banquetería para tu equipo",
    status: "scheduled",
    day: 4,
    time: "11:00",
    image: "griddle",
    views: "—",
    likes: 0,
    comments: 0,
    channels: ["Instagram"],
  },
  {
    id: "5",
    title: "Viernes de sándwich gigante",
    status: "scheduled",
    day: 4,
    time: "18:00",
    image: "burger",
    views: "—",
    likes: 0,
    comments: 0,
    channels: ["Instagram", "TikTok"],
  },
  {
    id: "6",
    title: "Detrás de la plancha",
    status: "draft",
    day: 5,
    time: "14:00",
    image: "griddle",
    views: "—",
    likes: 0,
    comments: 0,
    channels: ["Instagram"],
  },
];
type Settings = {
  channels: string[];
  watermark: boolean;
  size: number;
  opacity: number;
  rotation: number;
  x: number;
  y: number;
  banner: boolean;
  bannerText: string;
  bannerStyle: "dark" | "amber";
  textColor: "light" | "dark";
  fontSize: number;
  hookEnabled: boolean;
  hook: string;
  caption: string;
  hashtags: string;
  event: string;
  tone: string;
  posts: Post[];
  points: number;
};
const defaults: Settings = {
  channels: ["Instagram", "TikTok"],
  watermark: true,
  size: 25,
  opacity: 90,
  rotation: 0,
  x: 5,
  y: 5,
  banner: true,
  bannerText: "📍 Barrio Franklin, Santiago",
  bannerStyle: "dark",
  textColor: "light",
  fontSize: 18,
  hookEnabled: false,
  hook: "NO ES UNA HAMBURGUESA.\nES LA GLORIA.",
  caption:
    "En Franklin las cosas se hacen en grande. 🍔🔥\nPan doradito, carne a la plancha y sabor de barrio.\nDespués del Persa Bio Bio, tu parada es La Gloria.\n¿Con quién compartirías esta gigante? 👇\nEscríbenos por WhatsApp desde nuestro Instagram.",
  hashtags:
    "#ComidaChilena #BarrioFranklin #FuenteDeSoda\n#LaGloriaFranklin #SandwichGigante #GaliaDigital",
  event: "Hamburguesa Estrella",
  tone: "Picada Chilena Tradicional",
  posts: initialPosts,
  points: 120,
};
// MVP persistence is local only. Future: authenticated storage adapter and Supabase uploads.
export function clientDefaults(client: ClientBrand): Settings {
  if (client.id === defaultClient.id) return { ...defaults };
  return { ...defaults, posts: [], points: 0, channels: [],
    hook: "", caption: "", hashtags: "", hookEnabled: false,
    bannerText: client.location ? `📍 ${client.location}` : client.name,
    event: "Producto destacado", tone: "Divertido & Cercano" };
}

function settingsSnapshot(state: Settings): Settings {
  return Object.fromEntries(Object.keys(defaults).map((key) => [key, state[key as keyof Settings]])) as Settings;
}

type StudioState = Settings & {
  clients: ClientBrand[];
  activeClientId: string;
  clientSettings: Record<string, Settings>;
  busy: boolean;
  update: (value: Partial<Settings>, clientId?: string) => void;
  setBusy: (busy: boolean) => void;
  saveClient: (client: ClientBrand) => void;
  switchClient: (id: string) => void;
  migrateWebhook: () => void;
};

export const useStudio = create<StudioState>()(
  persist((set, get) => ({ ...defaults,
    clients: [defaultClient], activeClientId: defaultClient.id, clientSettings: {}, busy: false,
    setBusy: (busy) => set({ busy }),
    update: (value, clientId) => {
      const state = get();
      if (!clientId || clientId === state.activeClientId) set(value);
      else {
        const client = state.clients.find((c) => c.id === clientId);
        if (client) set({ clientSettings: { ...state.clientSettings, [clientId]: {
          ...(state.clientSettings[clientId] ?? clientDefaults(client)), ...value,
        } } });
      }
    },
    saveClient: (client) => {
      if (get().busy) return;
      set((state) => ({ clients: state.clients.some((c) => c.id === client.id)
        ? state.clients.map((c) => c.id === client.id ? client : c)
        : [...state.clients, client] }));
    },
    switchClient: (id) => {
      const state = get();
      const client = state.clients.find((c) => c.id === id);
      if (!client || state.busy || id === state.activeClientId) return;
      set({ ...clientDefaults(client), ...state.clientSettings[id], activeClientId: id,
        clientSettings: { ...state.clientSettings, [state.activeClientId]: settingsSnapshot(state) } });
    },
    migrateWebhook: () => {
      const legacy = localStorage.getItem("galia_webhook_url");
      const client = get().clients.find((c) => c.id === defaultClient.id);
      if (legacy && client && !client.webhookUrl) get().saveClient({ ...client, webhookUrl: legacy });
      if (legacy) localStorage.removeItem("galia_webhook_url");
    },
  }), {
    name: "galia-la-gloria-v1",
    storage: createJSONStorage(() => localStorage),
    skipHydration: true,
    partialize: ({ busy: _busy, ...state }) => state,
  }),
);
export function useBrand() {
  const client = useStudio((state) => state.clients.find((c) => c.id === state.activeClientId) ?? defaultClient);
  return resolveBrand(client);
}
export function generateCopy(event: string, tone: string, version: number) {
  const hooks: Record<string, string[]> = {
    "Hamburguesa Estrella": [
      "NO ES UNA HAMBURGUESA.\nES LA GLORIA.",
      "¿ESTA GIGANTE\nLA PIDE HASTA EL CHEF?",
    ],
    "Banquetería B2B": [
      "TU EQUIPO MERECE\nUN ALMUERZO CON GLORIA.",
      "LA REUNIÓN ES MEJOR\nCON SABOR A FRANKLIN.",
    ],
    "Plato del Día": ["HOY SE COME\nCOMO EN EL BARRIO.", "EL ANTOJO DEL DÍA\nTIENE NOMBRE."],
    "Promo Fin de Semana": [
      "EL FINDE SE VIENE\nEN FORMATO GIGANTE.",
      "TU FINDE NECESITA\nUN POCO DE GLORIA.",
    ],
    "Humor / Detrás de Cocina": [
      "AQUÍ LA PLANCHA\nNO DESCANSA.",
      "POV: EL CHEF\nTE CACHÓ MIRANDO.",
    ],
  };
  const intros: Record<string, string> = {
    "Picada Chilena Tradicional": "¡Pase no más, caserito! En Franklin se come con ganas. 🍔",
    "Corporativo / Empresas": "Lleva el sabor de La Gloria a tu próximo encuentro de equipo. 🤝",
    "Divertido & Cercano": "El hambre llamó… y le dijimos que viniera a La Gloria. 🤤",
    "Gen Z / Picante": "Sin filtro, sin miedo y con extra de sabor. Esta es tu señal. 🔥",
  };
  const details =
    event === "Banquetería B2B"
      ? "Banquetería con sabor casero para empresas y eventos."
      : event === "Plato del Día"
        ? "Tu pausa de hoy: comida hecha con cariño, directo de la plancha."
        : event === "Humor / Detrás de Cocina"
          ? "Un vistazo a la cocina donde nacen los gigantes del barrio."
          : event === "Promo Fin de Semana"
            ? "Este finde ven con tu gente y comparte tu sándwich favorito."
            : "Pan doradito, carne a la plancha y una hamburguesa gigante de verdad.";
  return {
    hook: hooks[event]?.[version % 2] ?? defaults.hook,
    caption: `${intros[tone] ?? intros["Picada Chilena Tradicional"]}\n${details}\nDel Persa Bio Bio a tu mesa: puro Barrio Franklin, Santiago. 📍\nEtiqueta a quien siempre tiene hambre. 👇\nPide o cotiza por WhatsApp desde nuestro Instagram.`,
    hashtags: defaults.hashtags,
  };
}
