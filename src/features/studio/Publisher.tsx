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
export function Publisher({ fileName = "la_gloria_reel.mp4" }: { fileName?: string }) {
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
    setWhMsg("");
    const st = useStudio.getState();
    try {
      const code = await sendWebhook(
        savedUrl,
        buildPayload({
          hook: st.hook,
          caption: st.caption,
          hashtags: st.hashtags,
          channels: accounts,
          mode,
          date,
          time,
          fileName,
          x: st.x,
          y: st.y,
          size: st.size,
          opacity: st.opacity,
          bannerText: st.bannerText,
        }),
      );
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
        <span className="simulation-label">Publicación simulada</span>
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
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (stage === 3) setOpen(value);
        }}
      >
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
      </Dialog>
    </section>
  );
}
