import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Clapperboard,
  Library,
  CalendarDays,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
  Download,
  ChevronDown,
  Sparkles,
  Check,
  CircleHelp,
  X,
  Zap,
  Command,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { brandConfig } from "./brandConfig";
import { useStudio, useBrand } from "./store";
import { ClientSwitcher } from "./ClientSwitcher";
import { VideoEditor } from "./VideoEditor";
import { CopyPanel } from "./CopyPanel";
import { Publisher } from "./Publisher";
import { MediaLibrary, ContentCalendar } from "./CollectionViews";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export function StudioApp({ view = "studio" }: { view?: "studio" | "library" | "calendar" }) {
  const s = useStudio();
  const brand = useBrand();
  const shell = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false),
    [source, setSource] = useState(brandConfig.demoVideo),
    [fileName, setFileName] = useState("la_gloria_hamburguesa.mp4"),
    [exporting, setExporting] = useState(false),
    [renderPct, setRenderPct] = useState<number | null>(null),
    [help, setHelp] = useState(false),
    [brandMenu, setBrandMenu] = useState(false);
  const location = useLocation();
  useEffect(() => {
    Promise.resolve(useStudio.persist.rehydrate()).then(() => useStudio.getState().migrateWebhook());
  }, []);
  useEffect(
    () => () => {
      if (source.startsWith("blob:")) URL.revokeObjectURL(source);
    },
    [source],
  );
  useEffect(() => {
    setSource(brand.demoVideo);
    setFileName(brand.demoVideo ? "la_gloria_hamburguesa.mp4" : "Sin video");
  }, [brand.id]);
  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    el.style.setProperty("--primary", brand.colors.primary);
    el.style.setProperty("--success", brand.colors.agency);
    el.style.setProperty("--gold", brand.colors.gold);
  }, [brand.colors.primary, brand.colors.agency, brand.colors.gold]);
  const download = async () => {
    if (!source || s.busy) return;
    s.setBusy(true);
    setExporting(true);
    setRenderPct(0);
    try {
      const { renderBrandedVideo } = await import("./renderer");
      const { blob, ext } = await renderBrandedVideo(source, brand.logo, s, setRenderPct);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${brand.id}-reel-${fileName.replace(/\.\w+$/, "")}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success("¡Video con marca listo!", {
        description: "Incluye logo, hook y banner. Súbelo directo a Reels o TikTok.",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo renderizar el video.");
    } finally {
      s.setBusy(false);
      setExporting(false);
      setRenderPct(null);
    }
  };
  const newEdit = () => {
    window.location.href = "/";
  };
  return (
    <div ref={shell} className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="app-sidebar">
        <Link to="/" className="agency-logo" aria-label="Galia Studio">
          <span className="agency-symbol">
            <Zap size={22} fill="currentColor" />
          </span>
          {!collapsed && (
            <span>
              galia<span className="studio-word">studio</span>
              <i />
            </span>
          )}
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <ClientSwitcher collapsed={collapsed} />
        <div className="nav-label">CREA & CONECTA</div>
        <nav>
          {[
            { to: "/" as const, label: "Studio", icon: Clapperboard },
            { to: "/library" as const, label: "Biblioteca de medios", icon: Library },
            { to: "/calendar" as const, label: "Calendario", icon: CalendarDays },
          ].map(({ to, label, icon: Icon }) => (
            <Button
              asChild
              variant="ghost"
              className={`nav-item ${location.pathname === to ? "nav-active" : ""}`}
              key={to}
              title={label}
            >
              <Link to={to}>
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
                {to === "/" && !collapsed && <span className="nav-spark">✦</span>}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="galia-points">
              <span className="points-icon">
                <Sparkles size={19} />
              </span>
              <span>
                <b>{s.points} puntos Galia</b>
                <small>Cada idea cuenta.</small>
              </span>
              <ArrowUpRight size={15} />
            </div>
          )}
          <Button
            variant="ghost"
            className="help-button"
            onClick={() => setHelp(true)}
            title="Ayuda y soporte"
          >
            <CircleHelp />
            {!collapsed && (
              <span>
                Ayuda y soporte
                <ArrowUpRight size={13} />
              </span>
            )}
          </Button>
          <div className="sidebar-profile">
            <span className="profile-avatar">EG</span>
            {!collapsed && (
              <span>
                <b>Elias Galia</b>
                <small>Galia Digital</small>
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              title={collapsed ? "Expandir menú" : "Contraer menú"}
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>{brand.name}</span>
            <span>/</span>
            <b>
              {view === "studio"
                ? "Content Studio"
                : view === "library"
                  ? "Biblioteca"
                  : "Calendario"}
            </b>
          </div>
          <div className="topbar-right">
            <span className="saved-status">
              <span className="live-dot" />
              Guardado localmente
            </span>
            <span className="demo-tag">MVP DEMO</span>
            <span className="top-avatar">EG</span>
          </div>
        </header>
        <main className="main-content">
          {view === "studio" ? (
            <>
              <div className="view-heading">
                <div>
                  <span className="eyebrow">
                    <span />
                    DEL BARRIO AL FEED
                  </span>
                  <h1>
                    {brand.name}<span>.</span>
                  </h1>
                  <p>Tu video, la esencia de tu marca. Listo para compartir.</p>
                </div>
                <Button
                  variant="outline"
                  className="export-button"
                  onClick={download}
                  disabled={exporting || s.busy || !source}
                >
                  <Download />
                  {exporting ? `Renderizando… ${renderPct ?? 0}%` : "Descargar video con logo"}
                </Button>
              </div>
              <div className="workflow-steps">
                <span className="step-active">
                  <b>01</b>Tu video
                  <Check size={12} />
                </span>
                <i />
                <span>
                  <b>02</b>Dale tu sello
                </span>
                <i />
                <span>
                  <b>03</b>Comparte la gloria
                </span>
                <div className="ready-chip">
                  <Zap size={13} />
                  De la idea al reel, en 60 segundos
                </div>
              </div>
              <div className="studio-grid">
                <VideoEditor key={brand.id}
                  src={source}
                  fileName={fileName}
                  onVideo={(url, name) => {
                    setSource(url);
                    setFileName(name);
                  }}
                />
                <CopyPanel key={brand.id} />
              </div>
              <Publisher key={brand.id} fileName={fileName} source={source} />
            </>
          ) : view === "library" ? (
            <MediaLibrary key={brand.id} onEdit={newEdit} />
          ) : (
            <ContentCalendar key={brand.id} onEdit={newEdit} />
          )}
          <footer>
            <span>
              Powered by <b>Galia Digital</b>
              <span className="footer-divider">/</span>
              <span className="footer-motto">#NOHAYEXCUSA</span>
            </span>
            <span>
              Hecho con hambre de crear <span className="footer-spark">✦</span>
            </span>
          </footer>
        </main>
      </div>
      <Toaster theme="dark" position="bottom-right" richColors />
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent>
          <DialogTitle>Galia Studio · MVP</DialogTitle>
          <DialogDescription>
            Tu contenido y ajustes se guardan en este navegador. Los videos subidos permanecen solo
            durante la sesión.
            <br />
            <br />
            La generación de textos, los canales conectados y la publicación son demostrativos. La
            descarga contiene el video original sin marca de agua ni textos.
            <br />
            <br />
            Para soporte, visita galiadigital.cl.
          </DialogDescription>
          <Button asChild>
            <a href="https://galiadigital.cl" target="_blank" rel="noreferrer">
              Galia Digital
              <ArrowUpRight />
            </a>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
