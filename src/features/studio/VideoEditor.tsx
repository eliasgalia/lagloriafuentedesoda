import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Upload,
  Film,
  ImagePlus,
  RotateCcw,
  Scan,
  Type,
  Stamp,
  Check,
  Move,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { brandConfig } from "./brandConfig";
import { useStudio } from "./store";
import { Range, Toggle, Field } from "./Controls";
const time = (v: number) =>
  `${Math.floor(v / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(v % 60)
    .toString()
    .padStart(2, "0")}`;
type Props = { src: string; fileName: string; onVideo: (url: string, name: string) => void };
export function VideoEditor({ src, fileName, onVideo }: Props) {
  const s = useStudio();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const logoNode = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false),
    [muted, setMuted] = useState(true),
    [volume, setVolume] = useState(0.7),
    [current, setCurrent] = useState(0),
    [duration, setDuration] = useState(15),
    [tab, setTab] = useState<"logo" | "text">("logo"),
    [dragOver, setDragOver] = useState(false),
    [progress, setProgress] = useState<number | null>(null),
    [canvasSize, setCanvasSize] = useState({ width: 260, height: 462 }),
    [customLogo, setCustomLogo] = useState<string | null>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry)
        setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
  }, [src]);
  useEffect(
    () => () => {
      if (customLogo) URL.revokeObjectURL(customLogo);
    },
    [customLogo],
  );
  const togglePlay = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused)
      el.play().catch(() => toast.error("No se puede reproducir este formato. Prueba con un MP4."));
    else el.pause();
  };
  const upload = (file: File) => {
    if (!/\.(mp4|mov)$/i.test(file.name)) {
      toast.error("Sube un video MP4 o MOV.");
      return;
    }
    if (file.size > 300 * 1024 * 1024) {
      toast.error("El video debe pesar menos de 300 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = url;
    probe.onloadedmetadata = () => {
      if (!Number.isFinite(probe.duration) || probe.duration > 60) {
        toast.error("Tu clip debe durar 60 segundos o menos.");
        URL.revokeObjectURL(url);
        return;
      }
      setProgress(0);
      let p = 0;
      const timer = setInterval(() => {
        p += 25;
        setProgress(p);
        if (p >= 100) {
          clearInterval(timer);
          onVideo(url, file.name);
          setProgress(null);
          toast.success("Video listo para editar");
        }
      }, 100);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("No se pudo abrir el video. Prueba con un MP4 H.264.");
    };
  };
  const preset = (name: string) => {
    const right = 95 - s.size;
    const bottom = 95 - (s.size * canvasSize.width) / canvasSize.height;
    const pos: Record<string, { x: number; y: number }> = {
      tl: { x: 5, y: 5 },
      tr: { x: right, y: 5 },
      bl: { x: 5, y: bottom },
      br: { x: right, y: bottom },
      center: {
        x: (100 - s.size) / 2,
        y: (100 - (s.size * canvasSize.width) / canvasSize.height) / 2,
      },
    };
    const value = pos[name];
    if (value) s.update(value);
  };
  const resize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const start = e.clientX,
      original = s.size;
    const move = (event: PointerEvent) =>
      s.update({
        size: Math.min(
          45,
          Math.max(10, original + ((event.clientX - start) / canvasSize.width) * 100),
        ),
      });
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };
  return (
    <section className="editor-workbench">
      <div className="section-top">
        <div className="flex items-center gap-2">
          <Scan size={16} />
          <h2>Editor de video</h2>
        </div>
        <span className="subtle-chip">
          9:16 <span>·</span> 1080 × 1920
        </span>
      </div>
      <div className="editor-body">
        <div className="preview-column">
          <div className="phone" ref={canvas}>
            <video
              ref={video}
              src={src}
              poster={brandConfig.poster}
              playsInline
              muted={muted}
              loop
              onClick={togglePlay}
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            <div className="phone-island" />
            <div className="reel-top">
              <span>Reels</span>
              <MoreHorizontal size={19} />
            </div>
            {s.watermark && (
              <Draggable
                nodeRef={logoNode}
                bounds="parent"
                position={{ x: (s.x / 100) * canvasSize.width, y: (s.y / 100) * canvasSize.height }}
                cancel=".resize-handle"
                onStop={(_, data) =>
                  s.update({
                    x: (data.x / canvasSize.width) * 100,
                    y: (data.y / canvasSize.height) * 100,
                  })
                }
              >
                <div
                  ref={logoNode}
                  className="draggable-logo"
                  style={{ width: `${s.size}%` }}
                  aria-label="Logo arrastrable"
                >
                  <img
                    src={customLogo ?? brandConfig.logo}
                    alt="La Gloria, desde 2020"
                    draggable={false}
                    style={{ opacity: s.opacity / 100, transform: `rotate(${s.rotation}deg)` }}
                  />
                  <div className="resize-handle" onPointerDown={resize} title="Cambiar tamaño" />
                </div>
              </Draggable>
            )}
            {s.hookEnabled && current < 3 && (
              <div key={s.hook} className="video-hook" style={{ fontSize: s.fontSize * 1.3 }}>
                {s.hook}
              </div>
            )}
            <div className="reel-actions">
              <Heart />
              <small>846</small>
              <MessageCircle />
              <small>52</small>
              <Send />
              <MoreHorizontal />
            </div>
            {s.banner && (
              <div
                className={`video-banner ${s.bannerStyle === "amber" ? "banner-amber" : "banner-dark"} ${s.textColor === "dark" ? "banner-text-dark" : ""}`}
                style={{ fontSize: s.fontSize * 0.6 }}
              >
                {s.bannerText}
              </div>
            )}
            <div className="reel-account">
              <img src={brandConfig.logo} alt="" />
              <b>lagloriafuentedesoda</b>
              <span>Seguir</span>
            </div>
            <div className="reel-caption">
              El sabor de Franklin, en grande. 🍔🔥
              <br />
              <span>♫ Sonido original · La Gloria</span>
            </div>
            {!playing && (
              <Button
                variant="ghost"
                size="icon"
                className="canvas-play"
                aria-label="Reproducir vista previa"
                onClick={togglePlay}
              >
                <Play fill="currentColor" />
              </Button>
            )}
          </div>
          <div className="player-controls">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                aria-label={playing ? "Pausar" : "Reproducir"}
              >
                {playing ? <Pause /> : <Play fill="currentColor" />}
              </Button>
              <span className="timecode">
                {time(current)} <span>/ {time(duration)}</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMuted(!muted)}
                aria-label={muted ? "Activar sonido" : "Silenciar"}
              >
                {muted ? <VolumeX /> : <Volume2 />}
              </Button>
            </div>
            <input
              aria-label="Posición del video"
              type="range"
              min="0"
              max={duration || 15}
              value={current}
              step="0.05"
              onChange={(e) => {
                if (video.current) {
                  video.current.currentTime = Number(e.target.value);
                  setCurrent(Number(e.target.value));
                }
              }}
            />
            <label className="volume-control">
              <Volume2 size={12} />
              <input
                aria-label="Volumen"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setVolume(value);
                  setMuted(value === 0);
                  if (video.current) video.current.volume = value;
                }}
              />
            </label>
          </div>
          <span className="preview-label">
            <span className="live-dot" /> Vista previa de Instagram Reels
          </span>
        </div>
        <div className="overlay-controls">
          <div className="control-tabs">
            <Button
              variant="ghost"
              className={tab === "logo" ? "selected" : ""}
              onClick={() => setTab("logo")}
            >
              <Stamp />
              Marca de agua
            </Button>
            <Button
              variant="ghost"
              className={tab === "text" ? "selected" : ""}
              onClick={() => setTab("text")}
            >
              <Type />
              Texto
            </Button>
          </div>
          {tab === "logo" ? (
            <div className="controls-content">
              <div className="control-heading">
                <h3>Logo de marca</h3>
                <Toggle
                  label="Activar marca de agua"
                  checked={s.watermark}
                  onChange={(v) => s.update({ watermark: v })}
                />
              </div>
              <div className="logo-upload">
                <div className="logo-thumbnail">
                  <img src={customLogo ?? brandConfig.logo} alt="Logo La Gloria" />
                </div>
                <div>
                  <b>{customLogo ? "Logo personalizado" : "La Gloria"}</b>
                  <span>PNG · Fondo transparente</span>
                  <Button variant="ghost" size="sm" onClick={() => logoInput.current?.click()}>
                    <ImagePlus />
                    Cambiar logo
                  </Button>
                </div>
                <input
                  type="file"
                  ref={logoInput}
                  accept="image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCustomLogo(URL.createObjectURL(file));
                  }}
                />
              </div>
              <Field label="Posición">
                <div className="position-presets">
                  {(["tl", "tr", "bl", "br", "center"] as const).map((p, i) => (
                    <Button
                      key={p}
                      variant="outline"
                      size="icon"
                      title={
                        [
                          "Arriba izquierda",
                          "Arriba derecha",
                          "Abajo izquierda",
                          "Abajo derecha",
                          "Centro",
                        ][i]
                      }
                      aria-label={
                        [
                          "Arriba izquierda",
                          "Arriba derecha",
                          "Abajo izquierda",
                          "Abajo derecha",
                          "Centro",
                        ][i]
                      }
                      onClick={() => preset(p)}
                    >
                      <span className={`position-icon position-${p}`}>
                        <i />
                      </span>
                    </Button>
                  ))}
                </div>
              </Field>
              <Range
                label="Tamaño"
                value={s.size}
                min={10}
                max={45}
                suffix="%"
                onChange={(v) => s.update({ size: v })}
              />
              <Range
                label="Opacidad"
                value={s.opacity}
                min={15}
                max={100}
                suffix="%"
                onChange={(v) => s.update({ opacity: v })}
              />
              <Range
                label="Rotación"
                value={s.rotation}
                min={-15}
                max={15}
                suffix="°"
                onChange={(v) => s.update({ rotation: v })}
              />
              <div className="drag-note">
                <Move size={14} />
                <span>Posición libre en el video</span>
                <Maximize2 size={13} />
              </div>
              <Button
                variant="ghost"
                className="reset-control"
                size="sm"
                onClick={() => s.update({ size: 25, opacity: 90, rotation: 0, x: 5, y: 5 })}
              >
                <RotateCcw />
                Restablecer ajustes
              </Button>
              <div className="quick-banner">
                <div className="control-heading">
                  <h3>Banner inferior</h3>
                  <Toggle
                    label="Activar banner inferior"
                    checked={s.banner}
                    onChange={(v) => s.update({ banner: v })}
                  />
                </div>
                <input
                  aria-label="Texto del banner"
                  value={s.bannerText}
                  onChange={(e) => s.update({ bannerText: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="controls-content">
              <div className="control-heading">
                <h3>Hook de apertura</h3>
                <Toggle
                  label="Activar hook"
                  checked={s.hookEnabled}
                  onChange={(v) => s.update({ hookEnabled: v })}
                />
              </div>
              <span className="tiny-muted">Primeros 3 segundos</span>
              <textarea
                aria-label="Texto del hook"
                rows={3}
                value={s.hook}
                onChange={(e) => s.update({ hook: e.target.value })}
              />
              <Range
                label="Tamaño de texto"
                min={14}
                max={30}
                value={s.fontSize}
                suffix=" px"
                onChange={(v) => s.update({ fontSize: v })}
              />
              <div className="control-heading">
                <h3>Banner inferior</h3>
                <Toggle
                  label="Mostrar banner"
                  checked={s.banner}
                  onChange={(v) => s.update({ banner: v })}
                />
              </div>
              <textarea
                aria-label="Banner inferior"
                value={s.bannerText}
                onChange={(e) => s.update({ bannerText: e.target.value })}
              />
              <select
                aria-label="Frase para banner"
                value=""
                onChange={(e) => s.update({ bannerText: e.target.value })}
              >
                <option value="" disabled>
                  Frases de La Gloria
                </option>
                <option>📍 Barrio Franklin, Santiago</option>
                <option>🔥 Sándwiches Gigantes Desde 2020</option>
              </select>
              <Field label="Fondo del banner">
                <div className="swatch-row">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Fondo negro"
                    onClick={() => s.update({ bannerStyle: "dark" })}
                    className="swatch-dark"
                  >
                    {s.bannerStyle === "dark" && <Check />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Fondo ámbar"
                    onClick={() => s.update({ bannerStyle: "amber" })}
                    className="swatch-amber"
                  >
                    {s.bannerStyle === "amber" && <Check />}
                  </Button>
                </div>
              </Field>
              <Field label="Color del texto">
                <select
                  value={s.textColor}
                  onChange={(e) => s.update({ textColor: e.target.value as "light" | "dark" })}
                >
                  <option value="light">Blanco</option>
                  <option value="dark">Negro</option>
                </select>
              </Field>
            </div>
          )}
        </div>
      </div>
      <div
        className={`upload-strip ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) upload(file);
        }}
      >
        <img src={brandConfig.poster} alt="Clip de hamburguesa" />
        <div>
          <b>{fileName}</b>
          <span>
            <Film size={12} />
            {time(duration)} <span>·</span> MP4 <span>·</span>{" "}
            {src === brandConfig.demoVideo ? "Demo ilustrativo" : "Video original"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
          <Upload />
          Subir video
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".mp4,.mov,video/mp4,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        {progress !== null && <progress max="100" value={progress} className="upload-progress" />}
      </div>
    </section>
  );
}
