// Browser-side renderer: composes video + logo + hook + banner on a canvas and
// records it with MediaRecorder. Future: swap for server FFmpeg (Make.com / Cloud Run).
export type RenderSettings = {
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
};

const W = 720;
const H = 1280;
const PREVIEW_W = 260; // preview phone width used to scale font sizes

export function pickMimeType() {
  const types = ["video/mp4;codecs=avc1", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

export async function renderBrandedVideo(
  src: string,
  logoSrc: string,
  s: RenderSettings,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; ext: string }> {
  const mime = pickMimeType();
  if (!mime) throw new Error("Tu navegador no permite grabar video. Usa Chrome o Edge.");
  const scale = W / PREVIEW_W;
  const logo = s.watermark ? await loadImage(logoSrc) : null;

  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.src = src;
  video.playsInline = true;
  video.preload = "auto";
  await new Promise<void>((res, rej) => {
    video.onloadedmetadata = () => res();
    video.onerror = () => rej(new Error("No se pudo abrir el video."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(30);

  let audioCtx: AudioContext | null = null;
  try {
    audioCtx = new AudioContext();
    const node = audioCtx.createMediaElementSource(video);
    const dest = audioCtx.createMediaStreamDestination();
    node.connect(dest);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  } catch {
    video.muted = true;
  }

  const draw = () => {
    const vw = video.videoWidth || W,
      vh = video.videoHeight || H;
    const k = Math.max(W / vw, H / vh);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(video, (W - vw * k) / 2, (H - vh * k) / 2, vw * k, vh * k);

    if (logo) {
      const lw = (s.size / 100) * W;
      const lh = lw * (logo.height / logo.width);
      const lx = (s.x / 100) * W,
        ly = (s.y / 100) * H;
      ctx.save();
      ctx.globalAlpha = s.opacity / 100;
      ctx.translate(lx + lw / 2, ly + lh / 2);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 12;
      ctx.drawImage(logo, -lw / 2, -lh / 2, lw, lh);
      ctx.restore();
    }

    if (s.hookEnabled && s.hook && video.currentTime < 3) {
      const fs = s.fontSize * 1.3 * scale;
      const t = Math.min(1, video.currentTime / 0.4);
      ctx.save();
      ctx.globalAlpha = t;
      ctx.font = `900 ${fs}px "DM Sans", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 16;
      const lines = wrap(ctx, s.hook.toUpperCase(), W * 0.82);
      const y0 = H * 0.36 - ((lines.length - 1) * fs * 1.1) / 2 + (1 - t) * 30;
      lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * fs * 1.1));
      ctx.restore();
    }

    if (s.banner && s.bannerText) {
      const fs = s.fontSize * 0.6 * scale;
      ctx.save();
      ctx.font = `700 ${fs}px "DM Sans", sans-serif`;
      const tw = ctx.measureText(s.bannerText).width;
      const bw = Math.min(W * 0.9, tw + fs * 1.6),
        bh = fs * 2;
      const bx = (W - bw) / 2,
        by = H * 0.74;
      ctx.fillStyle = s.bannerStyle === "amber" ? "#f59e0b" : "rgba(10,10,12,0.82)";
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, bh / 2);
      ctx.fill();
      ctx.fillStyle = s.textColor === "dark" ? "#111" : "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.bannerText, W / 2, by + bh / 2, bw - fs);
      ctx.restore();
    }
  };

  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((res) => (recorder.onstop = () => res()));

  video.currentTime = 0;
  draw();
  recorder.start(250);
  await video.play();
  await new Promise<void>((res) => {
    const tick = () => {
      draw();
      onProgress(Math.min(99, Math.round((video.currentTime / (video.duration || 1)) * 100)));
      if (video.ended || video.currentTime >= video.duration) res();
      else requestAnimationFrame(tick);
    };
    video.onended = () => res();
    requestAnimationFrame(tick);
  });
  recorder.stop();
  await done;
  video.pause();
  stream.getTracks().forEach((t) => t.stop());
  audioCtx?.close();
  onProgress(100);
  return { blob: new Blob(chunks, { type: mime.split(";")[0] }), ext: mime.includes("mp4") ? "mp4" : "webm" };
}
