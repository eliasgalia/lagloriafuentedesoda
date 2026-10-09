import { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  WandSparkles,
  ArrowUpRight,
  RefreshCw,
  Hash,
  AlignLeft,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStudio, generateCopy } from "./store";
import { Field } from "./Controls";
import { generateCopyAI } from "./copy.functions";
export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Copiado al portapapeles");
  } catch {
    toast.error("No se pudo copiar. Selecciona el texto manualmente.");
  }
}
export function CopyPanel() {
  const s = useStudio();
  const [loading, setLoading] = useState(false),
    [version, setVersion] = useState(0),
    [copied, setCopied] = useState("");
  const generate = async () => {
    setLoading(true);
    try {
      const r = await generateCopyAI({ data: { event: s.event, tone: s.tone } });
      if (r.ok) {
        s.update({ hook: r.hook, caption: r.caption, hashtags: r.hashtags });
        toast.success("3 ideas listas para tu próximo reel");
      } else {
        s.update(generateCopy(s.event, s.tone, version));
        setVersion((v) => v + 1);
        toast.error(`${r.error} Usamos una plantilla de respaldo.`);
      }
    } catch {
      toast.error("Sin conexión con la IA. Intenta otra vez.");
    } finally {
      setLoading(false);
    }
  };
  const copy = (name: string, value: string) => {
    copyText(value);
    setCopied(name);
    setTimeout(() => setCopied(""), 1800);
  };
  return (
    <aside className="copy-panel">
      <div className="section-top">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h2>Asistente creativo</h2>
        </div>
        <span className="ai-chip">AI</span>
      </div>
      <div className="copy-body">
        <div className="copy-intro">
          <span className="eyebrow">LA VOZ DE TU MARCA</span>
          <h3>
            Buen sabor.
            <br />
            Mejores palabras.
          </h3>
        </div>
        <Field label="¿Qué vamos a contar?">
          <select value={s.event} onChange={(e) => s.update({ event: e.target.value })}>
            {[
              "Hamburguesa Estrella",
              "Banquetería B2B",
              "Plato del Día",
              "Promo Fin de Semana",
              "Humor / Detrás de Cocina",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Tono de voz">
          <select value={s.tone} onChange={(e) => s.update({ tone: e.target.value })}>
            {[
              "Picada Chilena Tradicional",
              "Corporativo / Empresas",
              "Divertido & Cercano",
              "Gen Z / Picante",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Button className="generate-button" onClick={generate} disabled={loading}>
          {loading ? <RefreshCw className="loading-spin" /> : <WandSparkles />}
          {loading ? "Creando la magia…" : "Generar contenido"}
          <span>✦</span>
        </Button>
        <div className="generated-divider">
          <span>HECHO PARA LA GLORIA</span>
          <span className="simulation-label">Demo AI</span>
        </div>
        {(
          [
            { name: "Hook magnético", key: "hook", icon: Zap, value: s.hook },
            { name: "Caption", key: "caption", icon: AlignLeft, value: s.caption },
            { name: "Hashtags", key: "hashtags", icon: Hash, value: s.hashtags },
          ] as const
        ).map(({ name, key, icon: Icon, value }) => (
          <div className={`copy-result result-${key}`} key={key}>
            <div className="result-heading">
              <span>
                <Icon size={13} />
                {name}
                {key === "hook" && <small>3 seg</small>}
              </span>
              <Button
                variant="ghost"
                size="icon"
                title={`Copiar ${name}`}
                aria-label={`Copiar ${name}`}
                onClick={() => copy(key, value)}
              >
                {copied === key ? <Check /> : <Copy />}
              </Button>
            </div>
            <textarea
              aria-label={name}
              value={value}
              rows={key === "caption" ? 5 : key === "hashtags" ? 3 : 2}
              onChange={(e) => s.update({ [key]: e.target.value })}
            />
            {key === "hook" && (
              <Button
                variant="ghost"
                size="sm"
                className="apply-hook"
                onClick={() => {
                  s.update({ hookEnabled: true });
                  toast.success("Hook aplicado a los primeros 3 segundos");
                }}
              >
                Aplicar al video
                <ArrowUpRight />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          className="copy-all"
          onClick={() => copy("all", `${s.hook}\n\n${s.caption}\n\n${s.hashtags}`)}
        >
          {copied === "all" ? <Check /> : <Copy />}Copiar todo
        </Button>
      </div>
    </aside>
  );
}
