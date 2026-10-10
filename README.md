# La Gloria Studio

Build a modern, production-ready SaaS MVP called "Galia Studio - La Gloria Content Engine"

**CONTEXT:**
This is the first product of an agency platform (galiadigital.cl). First client is "Fuente de Soda La Gloria, Franklin - Desde 2020", a traditional Chilean sandwich shop in Barrio Franklin, Santiago, famous for giant burgers and sandwiches. Instagram: @lagloriafuentedesoda. The app must be white-label ready for future clients like Newcast, Rayo Taxi, Panadería.

**GOAL:** A super app to turn raw phone videos into publish-ready Reels/TikToks in 60 seconds.

### 1. TECH STACK & DESIGN SYSTEM
- Stack: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Lucide Icons + Zustand for state.
- Drag & Drop: Use @dnd-kit or react-draggable for logo positioning.
- Theme: Dark executive mode inspired by la-gloria.html: Background #070709 / #0f172a / #1e293b, Primary #ff4500 (La Gloria fire), Emerald #10b981 (Galia), Gold #d4af37 / Amber #f59e0b for accents. Zinc #18181b for cards.
- Typography: Fraunces for headings, DM Sans for body (load from Google Fonts).
- Layout: Desktop app shell with collapsible sidebar (Studio, Media Library, Calendar), top bar with brand, and toast notifications (sonner).
- Quality: Clean, typed code ready to export to GitHub. No backend needed for MVP (use localStorage + mock data).

### 2. CORE MODULES - MVP SCOPE

#### A. Video Studio & Canvas Editor (Main View - 70% width)
- **Media Upload:** Drag-and-drop zone for MP4/MOV (max 60s), show upload progress bar + thumbnail. Auto-load a demo video if none uploaded.
- **9:16 Preview Player:** HTML5 video player framed as iPhone 14 Pro with Instagram Reels UI (like, comment icons ghosted). Must have: play/pause on click, mute toggle, scrub bar with time tracker (00:03 / 00:15), volume.
- **Watermark / Logo Overlay (CRITICAL):**
    - Toggle ON/OFF watermark.
    - Preset positions: Top-Left, Top-Right, Bottom-Left, Bottom-Right, Center-WaterMark.
    - FREE DRAG: Logo must be draggable directly on canvas with mouse/touch + resizable via corner handle.
    - Sliders: Size (10% to 45% of video width), Opacity (15% to 100%), Rotation (-15 to 15 deg).
    - Use the uploaded La Gloria PNG as default. White version with drop-shadow for legibility.
- **Text & Banner Overlays:**
    - Lower-third banner toggle: Input field + style presets (e.g., "📍 Barrio Franklin, Santiago", "🔥 Sándwiches Gigantes Desde 2020").
    - Hook text overlay (first 3 seconds): Big bold text centered, with animation in.
    - Controls for font size, background color (black/amber), text color.

#### B. AI Caption & Hook Generator (Right Panel - 30%)
- Context Selector: Event Type (Banquetería B2B, Plato del Día, Promo Fin de Semana, Humor / Detrás de Cocina, Hamburguesa Estrella)
- Tone Selector: Picada Chilena Tradicional (Franklin), Corporativo/Empresas, Divertido & Cercano, Gen Z / Picante.
- Generate Copy button:
    - On click, generate 3 sections with mock logic (no real API needed for MVP):
        1. **Magnetic Hook (3s overlay text):** e.g., "¿ESTA HAMBURGUESA LA PIDE HASTA EL CHEF?!"
        2. **Main Caption:** 4-5 lines with line breaks, emojis, local refs (Persa Bio Bio, Franklin, Santiago), CTA to WhatsApp.
        3. **Hashtags:** #ComidaChilena #BarrioFranklin #FuenteDeSoda #LaGloriaFranklin #SandwichGigante #GaliaDigital
    - One-click Copy buttons for each section + Copy All.

#### C. Multi-Channel Publisher & Scheduler (Bottom Panel)
- Toggles for accounts with status:
    - [x] Instagram @lagloriafuentedesoda — Connected (green dot)
    - [x] TikTok @lagloria_franklin — Connected
    - [ ] Facebook Page La Gloria — Pending
- Scheduling: "Post Now" vs "Schedule for Later" (date + time picker with Chile timezone -03:00).
- On Publish, show realistic modal: Progress bar (Uploading -> Rendering watermark -> Publishing) and success toast: "¡Publicado en Instagram y TikTok! +5 pts Galia"
- Future hook: Comment "// TODO: Connect to Make.com webhook for FFmpeg render"

#### D. Content Calendar & Media Library
- Calendar view (week view) with status tags: Published (green), Scheduled (amber), Draft (gray).
- Media Library grid: Show raw clips + exported branded videos with preview on hover. Include mock data for 6 posts of La Gloria (hamburguesa con salsa cayendo, plancha chisporroteando).
- Engagement stats preview (mock): Views, Likes, Comments.

### 3. SAMPLE DATA & POLISH
- Pre-load the attached La Gloria logo and a sample vertical video so canvas works instantly.
- Include realistic mock posts in Media Library for "Fuente de Soda & Banquetería La Gloria".
- Add Export button: "Descargar Video con Logo" — for MVP, just download the original video (simulate render), but show toast "Render real con FFmpeg se activará en Cloud Run".
- Mobile responsive but prioritize desktop/tablet.
- Add Galia Digital watermark in footer: "Powered by Galia Digital - #NOHAYEXCUSA"

### 4. ARCHITECTURE FOR FUTURE SCALE (Comment in code)
- Leave structure ready to add Supabase for storage, Make.com webhook for real FFmpeg render, and Meta Graph API for real publishing.
- Make brand config (logo, colors, handles) come from a single `brandConfig.ts` file so next client only changes that file.

Build it as a functional, beautiful, production-ready MVP. No lorem ipsum.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://snappy-social-vids.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eabd105e-cbb8-4bfc-b125-d4ec9d8abc0c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
