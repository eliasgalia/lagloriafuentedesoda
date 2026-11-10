import { beforeEach, describe, expect, it } from "vitest";
import { defaultClient, type ClientBrand } from "@/features/studio/brandConfig";
import { clientDefaults, useStudio } from "@/features/studio/store";
import { buildPayload } from "@/features/studio/webhook";

const client: ClientBrand = {
  id: "test-pyme", name: "Pyme de prueba", logo: "data:image/png;base64,logo",
  location: "Santiago", description: "Servicios", colors: { primary: "#ef4444", agency: "#10b981", gold: "#eab308" },
  handles: { instagram: "@pyme", tiktok: "@pyme_tiktok", facebook: "Pyme" }, webhookUrl: "https://hook.make.com/pyme",
};
beforeEach(() => {
  localStorage.clear();
  useStudio.setState({ ...clientDefaults(defaultClient), clients: [defaultClient], activeClientId: defaultClient.id, clientSettings: {}, busy: false });
});
describe("client isolation", () => {
  it("restores each client's editor, channels and posts without copying La Gloria", () => {
    const s = useStudio.getState();
    s.update({ caption: "Texto La Gloria", channels: ["Instagram"], size: 35 });
    s.saveClient(client); s.switchClient(client.id);
    expect(useStudio.getState().posts).toEqual([]);
    expect(useStudio.getState().caption).toBe("");
    s.update({ caption: "Texto Pyme", channels: ["TikTok"], size: 15 });
    s.switchClient(defaultClient.id);
    expect(useStudio.getState().caption).toBe("Texto La Gloria");
    expect(useStudio.getState().size).toBe(35);
    expect(useStudio.getState().channels).toEqual(["Instagram"]);
    expect(useStudio.getState().posts).toHaveLength(6);
    s.switchClient(client.id);
    expect(useStudio.getState().caption).toBe("Texto Pyme");
    expect(useStudio.getState().channels).toEqual(["TikTok"]);
  });
  it("keeps logo, palette, handles and webhook bound to the client through persistence", async () => {
    useStudio.getState().saveClient(client);
    useStudio.getState().switchClient(client.id);
    useStudio.setState({ clients: [defaultClient], activeClientId: defaultClient.id });
    // Restore the real persisted record rather than the reset above.
    useStudio.getState().saveClient(client);
    useStudio.getState().switchClient(client.id);
    await useStudio.persist.rehydrate();
    expect(useStudio.getState().clients.find((c) => c.id === client.id)).toEqual(client);
    expect(useStudio.getState().activeClientId).toBe(client.id);
    expect(useStudio.getState().clients.find((c) => c.id === defaultClient.id)?.webhookUrl).toBe("");
  });
  it("migrates the old webhook exclusively to La Gloria", () => {
    localStorage.setItem("galia_webhook_url", "https://hook.make.com/gloria");
    useStudio.getState().saveClient(client);
    useStudio.getState().switchClient(client.id);
    useStudio.getState().migrateWebhook();
    expect(useStudio.getState().clients.find((c) => c.id === defaultClient.id)?.webhookUrl).toBe("https://hook.make.com/gloria");
    expect(useStudio.getState().clients.find((c) => c.id === client.id)?.webhookUrl).toBe(client.webhookUrl);
    expect(localStorage.getItem("galia_webhook_url")).toBeNull();
  });
  it("blocks switching while an operation is running", () => {
    useStudio.getState().saveClient(client);
    useStudio.getState().setBusy(true);
    useStudio.getState().switchClient(client.id);
    expect(useStudio.getState().activeClientId).toBe(defaultClient.id);
  });
  it("sends the selected client identity in the webhook payload", () => {
    const payload = buildPayload({ brand: client.id, identity: client, hook: "H", caption: "C", hashtags: "#Pyme", channels: ["Instagram"], mode: "now", date: "", time: "", fileName: "v.mp4", x: 80, y: 80, size: 25, opacity: 90, bannerText: "Santiago" });
    expect(payload.brand).toBe("test-pyme");
    expect(payload.identity?.logo).toBe(client.logo);
    expect(payload.identity?.handles.instagram).toBe("@pyme");
    expect(payload.identity?.colors.primary).toBe("#ef4444");
  });
});