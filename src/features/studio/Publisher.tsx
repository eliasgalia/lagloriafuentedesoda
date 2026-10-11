import { useState } from "react";
import {
  Instagram,
  Send,
  CalendarClock,
  Check,
  X,
  LoaderCircle,
  CircleCheck,
  Music2,
  Facebook,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { brandConfig } from "./brandConfig";
import { useStudio } from "./store";
import { useEffect } from "react";
import { WEBHOOK_KEY, buildPayload, isValidWebhook, sendWebhook } from "./webhook";
export function Publisher({
  fileName = "la_gloria_reel.mp4",
  source = brandConfig.demoVideo,
}: {
  fileName?: string;
  source?: string;
}) {
  const s = useStudio();
  const [accounts, setAccounts] = useState(["Instagram", "TikTok"]),
    [mode, setMode] = useState<"now" | "later">("now"),
    [date, setDate] = useState(""),
    [time, setTime] = useState("13:00"),
    [open, setOpen] = useState(false),
    [stage, setStage] = useState(0);
  const [hookUrl, setHookUrl] = useState(""),
    [savedUrl, setSavedUrl] = useState(""),
    [testing, setTesting] = useState(false),
    [wh, setWh] = useState<"idle" | "sending" | "ok" | "error">("idle"),
    [whMsg, setWhMsg] = useState("");
  useEffect(() => {
    const v = localStorage.getItem(WEBHOOK_KEY) ?? "";
    setHookUrl(v);
    setSavedUrl(v);
  }, []);
  const saveUrl = () => {
    const v = hookUrl.trim();
    if (v && !isValidWebhook(v)) {
      toast.error("La URL debe empezar con https://");
      return;
    }
    if (v) localStorage.setItem(WEBHOOK_KEY, v);
    else localStorage.removeItem(WEBHOOK_KEY);
    setSavedUrl(v);
    toast.success(v ? "Webhook guardado" : "Webhook eliminado · modo demo");
  };
  const testUrl = async () => {
    const v = hookUrl.trim();
    if (!isValidWebhook(v)) {
      toast.error("Ingresa una URL https:// válida");
      return;
    }
    setTesting(true);
    try {
      const code = await sendWebhook(v, { source: "galia-studio-v1", test: true });
      toast.success(`Conexión OK (${code})`);
    } catch (e) {
      toast.error(`Error ❌ ${e instanceof Error ? e.message : ""}`);
    } finally {
      setTesting(false);
    }
  };
  const addPost = () => {
    const now = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const postDate = mode === "later" ? date : now.toISOString().slice(0, 10);
    const day = (new Date(`${postDate}T12:00:00Z`).getUTCDay() + 6) % 7;
    const state = useStudio.getState();
    s.update({
      points: state.points + 5,
      posts: [
        {
          id: crypto.randomUUID(),
          title: state.hook.replace(/\n/g, " "),
          status: mode === "later" ? "scheduled" : "published",
          day,
          date: postDate,
          time: mode === "later" ? time : now.toISOString().slice(11, 16),
          image: "burger",
          views: "—",
          likes: 0,
          comments: 0,
          channels: accounts,
        },
        ...state.posts,
      ],
    });
  };
  const sendReal = async () => {
    setWh("sending");
    setWhMsg("Renderizando video con logo… 0%");
    const st = useStudio.getState();
    try {
      const { renderBrandedVideo } = await import("./renderer");
      const { blob, ext } = await renderBrandedVideo(source, brandConfig.logo, st, (p) =>
        setWhMsg(`Renderizando video con logo… ${p}%`),
      );
      setWhMsg("Subiendo video a la nube…");
      const { createUploadSlot, getVideoUrl } = await import("./upload.functions");
      const { supabase } = await import("@/integrations/supabase/client");
      const slot = await createUploadSlot({ data: { ext } });
      const up = await supabase.storage
        .from("renders")
        .uploadToSignedUrl(slot.path, slot.token, blob, { contentType: blob.type });
      if (up.error) throw new Error(`Subida falló: ${up.error.message}`);
      const { url: videoUrl } = await getVideoUrl({ data: { path: slot.path } });
      setWhMsg("Enviando a Make…");
      const payload = buildPayload({
        hook: st.hook,
        caption: st.caption,
        hashtags: st.hashtags,
        channels: accounts,
        mode,
        date,
        time,
        fileName: slot.path.split("/").pop() ?? fileName,
        x: st.x,
        y: st.y,
        size: st.size,
        opacity: st.opacity,
        bannerText: st.bannerText,
      });
      const code = await sendWebhook(savedUrl, {
        ...payload,
        video: { ...payload.video, url: videoUrl, mimeType: blob.type },
        videoUrl,
      });
      setWh("ok");
      setWhMsg(`Respuesta ${code}`);
      addPost();
      toast.success(`Enviado a Make ✅ (${code}) · +5 pts Galia`);
    } catch (e) {
      setWh("error");
      setWhMsg(e instanceof Error ? e.message : "Error desconocido");
    }
  };
  const publish = () => {
    if (!accounts.length) {
      toast.error("Selecciona al menos un canal");
      return;
    }
    if (
      mode === "later" &&
      (!date || new Date(`${date}T${time}:00-03:00`).getTime() <= Date.now())
    ) {
      toast.error("Elige una fecha y hora futura");
      return;
    }
    setOpen(true);
    if (savedUrl) {
      setStage(3);
      sendReal();
      return;
    }
    setWh("idle");
    setStage(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setStage(i);
      if (i === 3) {
        clearInterval(timer);
        addPost();
        toast.success(
          mode === "later"
            ? `¡Programado en ${accounts.join(" y ")}! +5 pts Galia (demo)`
            : `¡Publicado en ${accounts.join(" y ")}! +5 pts Galia (demo)`,
        );
      }
    }, 900);
  };

  return (
    <section className="publisher">
      <div className="section-top">
        <div className="flex items-center gap-2">
          <Send size={15} />
          <h2>Un video. Más alcance.</h2>
        </div>
        <span className="simulation-label">
          {savedUrl ? "Webhook real activo" : "Publicación simulada"}
        </span>
      </div>
      <div className="publisher-content">
        <div className="channel-options">
          {[
            { name: "Instagram", handle: brandConfig.handles.instagram, icon: Instagram },
            { name: "TikTok", handle: brandConfig.handles.tiktok, icon: Music2 },
            { name: "Facebook", handle: "Página La Gloria", icon: Facebook },
          ].map(({ name, handle, icon: Icon }) => (
            <label
              className={`channel-option ${accounts.includes(name) ? "channel-checked" : ""} ${name === "Facebook" ? "channel-pending" : ""}`}
              key={name}
            >
              <input
                type="checkbox"
                disabled={name === "Facebook"}
                checked={accounts.includes(name)}
                onChange={(e) =>
                  setAccounts(
                    e.target.checked ? [...accounts, name] : accounts.filter((a) => a !== name),
                  )
                }
              />
              <Icon size={19} />
              <span>
                <b>{name}</b>
                <small>{handle}</small>
              </span>
              <span
                className={`channel-status ${name === "Facebook" ? "pending" : "connected"}`}
                title={name === "Facebook" ? "Pendiente" : "Conectado (demo)"}
              />
            </label>
          ))}
        </div>
        <div className="publish-actions">
          <div className="schedule-modes">
            <Button
              variant="ghost"
              size="sm"
              className={mode === "now" ? "active" : ""}
              onClick={() => setMode("now")}
            >
              <Send />
              Publicar ahora
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={mode === "later" ? "active" : ""}
              onClick={() => setMode("later")}
            >
              <CalendarClock />
              Programar
            </Button>
          </div>
          {mode === "later" && (
            <div className="schedule-inputs">
              <input
                aria-label="Fecha de publicación"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                aria-label="Hora de publicación"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          )}
          <span className="timezone">
            Santiago, Chile <span>UTC −03:00</span>
          </span>
          <Button className="publish-button" onClick={publish} disabled={open && stage < 3}>
            {mode === "later" ? <CalendarClock /> : <Send />}
            {mode === "later" ? "Programar contenido" : "Publicar contenido"}
            <ArrowRight />
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="text-xs font-semibold text-muted-foreground">
          Webhook Make / n8n {savedUrl ? "· real" : "· modo demo"}
        </span>
        <input
          aria-label="Webhook URL"
          type="url"
          placeholder="https://hook.make.com/..."
          value={hookUrl}
          onChange={(e) => setHookUrl(e.target.value)}
          className="h-9 min-w-[260px] flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
        <Button variant="outline" size="sm" onClick={testUrl} disabled={testing}>
          {testing ? <LoaderCircle className="loading-spin" /> : <Send />}
          Probar conexión
        </Button>
        <Button size="sm" onClick={saveUrl}>
          <Check />
          Guardar
        </Button>
      </div>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (savedUrl ? wh !== "sending" : stage === 3) setOpen(value);
        }}
      >
        {savedUrl && wh !== "idle" ? (
          <DialogContent className="publish-modal">
            <div className="publish-modal-icon">
              {wh === "ok" ? (
                <CircleCheck />
              ) : wh === "error" ? (
                <X />
              ) : (
                <LoaderCircle className="loading-spin" />
              )}
            </div>
            <DialogTitle>
              {wh === "ok" ? "Enviado a Make ✅" : wh === "error" ? "Error ❌" : "Enviando…"}
            </DialogTitle>
            <DialogDescription>
              Webhook real · {accounts.join(" + ")}
              <br />
              {whMsg || (mode === "later" ? `Programado ${date} ${time} (−03:00)` : "Publicar ahora")}
            </DialogDescription>
            {wh === "error" && (
              <Button onClick={sendReal}>
                Reintentar
                <ArrowRight />
              </Button>
            )}
            {wh === "ok" && (
              <Button onClick={() => setOpen(false)}>
                Listo, vamos por más
                <Check />
              </Button>
            )}
          </DialogContent>
        ) : (
        <DialogContent className="publish-modal">
          <div className="publish-modal-icon">
            {stage === 3 ? <CircleCheck /> : <LoaderCircle className="loading-spin" />}
          </div>
          <DialogTitle>
            {stage === 3
              ? mode === "later"
                ? "¡Todo programado!"
                : "¡Contenido publicado!"
              : "Tu próxima gloria está en camino"}
          </DialogTitle>
          <DialogDescription>
            Simulación MVP · {accounts.join(" + ")}
            <br />
            No se publica en cuentas reales.
          </DialogDescription>
          <progress max={3} value={stage} />
          <div className="publish-stages">
            {[
              "Subiendo video",
              "Renderizando marca de agua",
              mode === "later" ? "Programando contenido" : "Publicando contenido",
            ].map((label, i) => (
              <div className={stage > i ? "done" : ""} key={label}>
                {stage > i ? (
                  <Check size={16} />
                ) : stage === i ? (
                  <LoaderCircle size={16} className="loading-spin" />
                ) : (
                  <span className="stage-dot" />
                )}
                {label}
              </div>
            ))}
          </div>
          {stage === 3 && (
            <Button onClick={() => setOpen(false)}>
              Listo, vamos por más
              <Check />
            </Button>
          )}
        </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
