import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Settings2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { isValidWebhook } from "./webhook";
import { useBrand, useStudio } from "./store";
import type { ClientBrand } from "./brandConfig";

export function ClientSwitcher({ collapsed }: { collapsed: boolean }) {
  const s = useStudio();
  const brand = useBrand();
  const [draft, setDraft] = useState<ClientBrand | null>(null);
  const [reading, setReading] = useState(false);
  const edit = (client?: ClientBrand) => setDraft(client ? structuredClone(client) : {
    id: crypto.randomUUID(), name: "", logo: "", location: "", description: "",
    colors: { ...brand.colors }, handles: { instagram: "", tiktok: "", facebook: "" }, webhookUrl: "",
  });
  const save = () => {
    if (!draft || s.busy) return;
    if (!draft.name.trim() || !draft.logo) { toast.error("Agrega el nombre y el logo del cliente"); return; }
    if (draft.webhookUrl.trim() && !isValidWebhook(draft.webhookUrl.trim())) { toast.error("El webhook debe comenzar con https://"); return; }
    try {
      s.saveClient({ ...draft, name: draft.name.trim(), webhookUrl: draft.webhookUrl.trim() });
      s.switchClient(draft.id);
      setDraft(null);
      toast.success("Cliente guardado");
    } catch { toast.error("No hay espacio disponible en este navegador. Prueba con un logo más pequeño."); }
  };
  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="brand-switch" disabled={s.busy} aria-label={`Cambiar cliente: ${brand.name}`}>
          <img src={brand.logo} alt={brand.name} />
          {!collapsed && <><span><b>{brand.name}</b><small>{brand.location || "Galia Digital"}</small></span><ChevronsUpDown size={14} /></>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="client-menu">
        {s.clients.map((client) => <DropdownMenuItem key={client.id} onSelect={() => s.switchClient(client.id)}>
          <img src={client.logo} alt="" /><span>{client.name}</span>{client.id === brand.id && <Check className="ml-auto" />}
        </DropdownMenuItem>)}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => edit(s.clients.find((c) => c.id === brand.id))}><Settings2 /> Configurar cliente</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => edit()}><Plus /> Nuevo cliente</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Dialog open={!!draft} onOpenChange={(open) => { if (!open) setDraft(null); }}>
      <DialogContent className="client-dialog">
        <DialogTitle>{s.clients.some((c) => c.id === draft?.id) ? "Configurar cliente" : "Nuevo cliente"}</DialogTitle>
        <DialogDescription>Galia Digital · {draft?.name || "Identidad de marca"}</DialogDescription>
        {draft && <form className="client-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <div className="client-logo-field">
            {draft.logo ? <img src={draft.logo} alt="Logo del cliente" /> : <Upload />}
            <label>Logo<input aria-label="Logo del cliente" type="file" accept="image/png,image/jpeg,image/webp" disabled={reading} onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { toast.error("Usa un logo PNG, JPG o WebP"); return; }
              if (file.size > 1024 * 1024) { toast.error("Usa un logo de menos de 1 MB"); return; }
              const id = draft.id;
              setReading(true);
              const reader = new FileReader();
              reader.onload = () => {
                const logo = reader.result;
                if (typeof logo === "string") setDraft((current) => current?.id === id ? { ...current, logo } : current);
                setReading(false);
              };
              reader.onerror = () => { setReading(false); toast.error("No se pudo abrir el logo"); };
              reader.readAsDataURL(file);
            }} /></label>
          </div>
          <label>Nombre de pyme<input aria-label="Nombre de pyme" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
          <label>Ubicación<input aria-label="Ubicación del cliente" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></label>
          <label>Descripción de la marca<textarea aria-label="Descripción de la marca" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
          <fieldset className="client-palette"><legend>Paleta</legend>{(["primary", "agency", "gold"] as const).map((key, i) => <label key={key}>
            {["Principal", "Secundario", "Acento"][i]}<input type="color" aria-label={`Color ${["principal", "secundario", "acento"][i]}`} value={draft.colors[key]} onChange={(e) => setDraft({ ...draft, colors: { ...draft.colors, [key]: e.target.value } })} />
          </label>)}</fieldset>
          <div className="client-handles">{(["instagram", "tiktok", "facebook"] as const).map((key) => <label key={key}>{key === "facebook" ? "Página Facebook" : key === "instagram" ? "Instagram" : "TikTok"}
            <input aria-label={`Cuenta ${key}`} value={draft.handles[key]} onChange={(e) => setDraft({ ...draft, handles: { ...draft.handles, [key]: e.target.value } })} />
          </label>)}</div>
          <label>Webhook Make / n8n<input aria-label="Webhook del cliente" type="url" placeholder="https://hook.make.com/..." value={draft.webhookUrl} onChange={(e) => setDraft({ ...draft, webhookUrl: e.target.value })} /></label>
          <Button type="submit" disabled={reading || s.busy}><Check />Guardar cliente</Button>
        </form>}
      </DialogContent>
    </Dialog>
  </>;
}