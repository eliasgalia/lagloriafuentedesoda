<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Product architecture
- Keep the existing TanStack Start file router; studio, library and calendar have separate leaf routes so navigation and route metadata remain consistent.
- Define client identity and default media in `brandConfig.ts`; consumers use `useBrand()` to resolve the active client so editor, copy and webhook stay consistent.
- Keep the editor and demo posts in a hydration-safe Zustand persisted store; this MVP explicitly uses local-only persistence and no backend.
- Keep upload URLs session-scoped and revoke them on replacement/unmount; media binaries use asset pointers to keep source exports lightweight.
- Persist client configurations and per-client editor/post/channel snapshots in the hydration-safe studio store; migrate the legacy webhook only to the original client to prevent cross-brand sends.
- Small user-supplied client logos use validated image data URLs for local persistence; source-controlled default media remain asset pointers to keep exports lightweight.
- Lock client switching and configuration during generation/export/publishing so asynchronous results cannot cross client boundaries.
- AI copy runs server-side via createServerFn (copy.functions.ts → copy.server.ts) so the key stays private; mock templates remain as fallback.
- Keep simulated publishing and original-only export explicitly labeled; rendering and publishing adapters are future integration boundaries, not working services.
