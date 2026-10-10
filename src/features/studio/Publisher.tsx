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
import { WEBHOOK_KEY, buildPayload } from "./webhook";
import { sendWebhook } from "./webhook.functions";
type Hook = { state: "idle" | "sending" | "ok" | "error"; msg?: string };
export function Publisher() {
  const s = useStudio();
  const [accounts, setAccounts] = useState(["Instagram", "TikTok"]),
    [mode, setMode] = useState<"now" | "later">("now"),
    [date, setDate] = useState(""),
    [time, setTime] = useState("13:00"),
    [open, setOpen] = useState(false),
    [stage, setStage] = useState(0),
    [url, setUrl] = useState(""),
    [savedUrl, setSavedUrl] = useState(""),
    [hook, setHook] = useState<Hook>({ state: "idle" }),
    [test, setTest] = useState<Hook>({ state: "idle" });
  useEffect(() => {
    const v = localStorage.getItem(WEBHOOK_KEY) ?? "";
    setUrl(v);
    setSavedUrl(v);
  }, []);
  const payloadFor = (scheduledAt: string | null) => {
    const st = useStudio.getState();
    return buildPayload({
      hook: st.hook,
      caption: st.caption,
      hashtags: st.hashtags,
      channels: accounts,
      scheduledAt,
      x: st.x,
      y: st.y,
      size: st.size,
      opacity: st.opacity,
      bannerText: st.bannerText,
    });
  };
  const call = async (target: string, payload: Record<string, unknown>): Promise<Hook> => {
    try {
      const r = await sendWebhook({ data: { url: target, payload } });
      return r.ok
        ? { state: "ok", msg: `Enviado a Make ✅ (${r.status})` }
        : { state: "error", msg: `Error ❌ ${r.status || ""} ${r.body}`.trim() };
    } catch (e) {
      return { state: "error", msg: `Error ❌ ${e instanceof Error ? e.message : "desconocido"}` };
    }
  };
  const save = () => {
    const v = url.trim();
    if (v && !/^https:\/\/.+/.test(v)) {
      toast.error("La URL debe comenzar con https://");
      return;
    }
    if (v) localStorage.setItem(WEBHOOK_KEY, v);
    else localStorage.removeItem(WEBHOOK_KEY);
    setSavedUrl(v);
    toast.success(v ? "Webhook guardado: publicación real activada" : "Webhook eliminado: modo demo");
  };
  const testConnection = async () => {
    if (!/^https:\/\/.+/.test(url.trim())) {
      toast.error("Ingresa una URL https:// válida");
      return;
    }
    setTest({ state: "sending", msg: "Enviando..." });
    const r = await call(url.trim(), { ...payloadFor(null), test: true });
    setTest(r);
    r.state === "ok" ? toast.success(r.msg) : toast.error(r.msg);
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
    if (savedUrl) {
      void sendReal();
      return;
    }
    runDemo();
  };
  const sendReal = async () => {
    setHook({ state: "sending", msg: "Enviando..." });
    setOpen(true);
    const r = await call(
      savedUrl,
      payloadFor(mode === "later" ? `${date}T${time}:00-03:00` : null),
    );
    setHook(r);
    if (r.state === "ok") {
      addPost();
      toast.success(r.msg);
    } else toast.error(r.msg);
  };
  const addPost = () => {
    const now = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const postDate = mode === "later" ? date : now.toISOString().slice(0, 10);
    const day = (new Date(`${postDate}T12:00:00Z`).getUTCDay() + 6) % 7;
    const state = useStudio.getState();
    state.update({
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
  const runDemo = () => {
    setHook({ state: "idle" });
    setOpen(true);
    setStage(0);
    // Demo mode (no webhook configured).
    let i = 0;

    const timer = setInterval(() => {
      i++;
      setStage(i);
      if (i === 3) {
        clearInterval(timer);
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
      <div className="webhook-config" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "0 0 14px" }}>
        <input
          aria-label="Webhook URL"
          type="url"
          placeholder="https://hook.make.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-input/30 border border-border rounded-md px-3 py-2 text-sm text-foreground"
          style={{ flex: "1 1 260px", minWidth: 0 }}
        />
        <Button variant="outline" size="sm" onClick={testConnection} disabled={test.state === "sending"}>
          {test.state === "sending" ? <LoaderCircle className="loading-spin" /> : <Check />}
          Probar conexión
        </Button>
        <Button size="sm" onClick={save}>Guardar</Button>
        {test.msg && (
          <small className={test.state === "error" ? "text-destructive" : "text-muted-foreground"} style={{ flexBasis: "100%" }}>
            {test.msg}
          </small>
        )}
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
        open={open && hook.state !== "idle"}
        onOpenChange={(value) => {
          if (hook.state !== "sending") setOpen(value);
        }}
      >
        <DialogContent className="publish-modal">
          <div className="publish-modal-icon">
            {hook.state === "sending" ? (
              <LoaderCircle className="loading-spin" />
            ) : hook.state === "ok" ? (
              <CircleCheck />
            ) : (
              <X />
            )}
          </div>
          <DialogTitle>
            {hook.state === "sending"
              ? "Enviando..."
              : hook.state === "ok"
                ? "Enviado a Make ✅"
                : "Error ❌"}
          </DialogTitle>
          <DialogDescription>
            Webhook real · {accounts.join(" + ")}
            <br />
            {hook.msg}
          </DialogDescription>
          {hook.state === "error" && (
            <Button onClick={() => void sendReal()}>Reintentar</Button>
          )}
          {hook.state === "ok" && (
            <Button onClick={() => setOpen(false)}>
              Listo, vamos por más
              <Check />
            </Button>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={open && hook.state === "idle"}
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
