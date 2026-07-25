# Track 52 — The 4+2 Layout Layer: build the deep layer the carrier declares but does not have

**This track is hand-authored and self-contained — each tranche carries its full brief inline** (there is no 2026-06-02 design-reconciliation source; do not look for one).

**Why this track exists.** Canon defines exactly two layout modes inside one shell: the **0/1 daily layout** (lived preview) and the **deep IDE layout**, which `M5'-SPEC.md:91` names as "the full 4+2 surface with M0/M5 IDE chrome, six M-extensions, two integrated plugins, agentic control room". `M5'-SPEC.md:159` names the omni panel as "the canonical switch mechanism" and states "the omni panel switches layouts inside one process; there is no second app". `M'-SYSTEM-SPEC.md:168` fixes what the 4+2 layer IS: "Subsystem pages M0-M5 are the 4+2 explicate development of the (0/1) — the six positions of the matheme made into full-depth workspaces." `M'-TAURI-PORT-SPEC.md:65` fixes the relation: "The parent shell is the minimal 0/1 surface; the subsystem pages are the 4+2 body of the app. Shell surfaces preview; subsystem pages deliver depth. **Do not merge them.**" `M5'-SPEC.md:107` (DCC-07) makes the non-interchangeability a standing surface law.

**"4+2" is not a region count.** It is the QL mod-6 claim — four explicate positions (#1 Material, #2 Energetic, #3 Formal, #4 Teleological) plus two implicate dimensions (#0 Ground, #5 Synthesis) — instantiated as the six M0′–M5′ subsystem workspaces. Anyone reading it as "four panes plus two rails" will build the wrong thing.

**What the carrier actually has** (established 2026-07-25 by reading the source, not by inference):

- The layout id union `'daily-0-1' | 'ide-deep'` is declared **four times independently** — `omnipanelRuntime.ts:34` (`OmniPanelLayoutId`), `layoutClaims.ts:16` (`ActiveLayoutId`), `leftSidebarModes.ts:34` (`LeftSidebarLayoutId`), `crossLayoutIntent.ts:19` (`CrossLayoutId`) — plus inline literal unions in `m1KaprekarInspector.tsx:68`, `m1SurfaceDispatch.tsx:80`, `DiagnosticsPanel.tsx:50`. Nothing keeps them equal.
- **`ide-deep` selects no pane set.** There is no `ideDeepDefault()` FlexLayout model anywhere in `Body/M/pratibimba-app/src`. Only `personalDefault` (`App.tsx:175`) and `cosmicDefault` (`App.tsx:228`) exist, and both are FACE models. Selecting `ide-deep` today has exactly one runtime effect: it hides three face-0 daily widgets (`App.tsx:1270`).
- **No layout switch exists.** `setActiveLayout` is called from two sites only — persistence restore (`App.tsx:579`) and a cross-layout intent's `preferredLayout` (`App.tsx:807`). `commands/catalog.ts` registers `face.toggle` and no layout command. A user cannot deliberately enter the deep layout; they can only be carried there as a side effect of an intent whose target defaulted to it (`crossLayoutIntent.ts:49` defaults the 6th argument to `'ide-deep'`).
- **No subsystem page exists.** No route, no grid, no per-subsystem workspace. M0–M5 depth is scattered as ~24 sibling tabs inside the two face tabsets. The 4+2 body is unbuilt.
- **The activity-bar mode registry is dead code.** `registerLeftSidebarModeCommands` (`leftSidebarModes.ts:192`) is self-documented as "NOT wired into App.tsx here" and has zero production callers; `switchLayout` is called only by tests. The rendered left sidebar is a hardcoded 5-tab FlexLayout border on face 1 (`App.tsx:180`); face 0 has no left border at all.
- **Face and layout are conflated.** `resolveM1SurfaceContext` (`m1SurfaceDispatch.tsx:103`) derives `layoutId` FROM face — face 1 ⇒ `'ide-deep'` — ignoring the shell's real `activeLayout` and collapsing exactly the two authority classes DCC-07 forbids collapsing.

**Architect ruling (2026-07-25).** Build the 4+2 layer as a real layer, canon-faithful, BEFORE landing the deep surfaces that belong in it. The alternative readings — land deep surfaces on face models and defer, or formally redefine `ide-deep` as a per-face modifier — were considered and declined.

**⚑ Carrier (track 52) — build/verify HERE, never epi-theia:** `Body/M/pratibimba-app`. Theia framing in the specs is CONTRACT (what the surface must expose); Theia plumbing is dead. Deliver carrier-native panes/models on the modulation graph; never port an epi-theia widget. Track 00 (verification harness) gates all closure; the whole track is class **UF** — every tranche changes what renders, so browser-driven proof is the only honest proof.

**Standing constraint for every tranche here:** the seven-field cross-layout identity receipt (`state/crossLayoutIdentity.ts:69`) is the layout-switch invariant — coordinate, lens, mode, profileGeneration, sessionKey, dayNow, activityBarMode must survive any layout transition. A tranche that moves the user between layouts and drops one of those fields has failed even if it renders.

1. **T1 — One layout-id authority.**

   Brief: the union is declared four times and inlined three more, with no canonical export. This is not tidiness: T4 and T5 add a real deep layout, and a builder who edits four of seven sites ships a layout that half the app does not believe in.
   Build: one exported `LayoutId` type + `parseLayoutId` guard + `LAYOUT_IDS` tuple in a single module (`src/ui/layoutId.ts` is the natural home — `shellSlotPolicy.ts` and `layoutClaims.ts` already live there). Re-export or import it at all seven sites so `OmniPanelLayoutId`, `ActiveLayoutId`, `LeftSidebarLayoutId`, `CrossLayoutId` become aliases of the one type, and replace the three inline literal unions. Keep `OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY` and the `'daily-0-1'` fallback behaviour byte-identical — this tranche changes no behaviour.
   Add a guard test that FAILS when a new inline `'daily-0-1' | 'ide-deep'` literal union appears outside the authority module (AST walk, not a regex over prose — the house pattern is `src/chromeContract.test.ts`).
   Depends on Track 00 Tranche 3.
   Verify: real behavioral proof per Track 00 — `pnpm typecheck && pnpm test && pnpm build` green, the new guard test proven to fail on an injected duplicate union and pass when removed, and `pnpm test:e2e` green (no render change is the assertion). verifier ≠ closer; evidence = fresh command output.

2. **T2 — Un-conflate face from layout (DCC-07 repair).**

   Brief: `resolveM1SurfaceContext` (`m1SurfaceDispatch.tsx:97-112`) hardcodes face 1 ⇒ `layoutId: 'ide-deep'` and face 0 ⇒ `'daily-0-1'`. Face (cosmic/personal) and layout (daily/deep) are orthogonal axes — `App.tsx:153` and `App.tsx:517` treat them as such — and DCC-07 (`M5'-SPEC.md:107`, `:161`) holds shell-1 and full-4+2-depth as distinct authority classes. The current code makes "the user is on the personal face" mean "the user is in the 4+2 depth layout", which is false today and will be actively wrong once T4 lands.
   Build: `resolveM1SurfaceContext` takes the shell's real `activeLayout` and stops deriving it from face. `M1_SURFACE_MODES`' `'standalone-ide-deep'` member is re-derived from (face, layout) rather than face alone — decide and record whether the standalone mode is layout-gated, face-gated, or both, and write that as a decision record in the DR register rather than leaving it implied by a conditional.
   Audit the same conflation elsewhere before assuming this is the only site.
   Depends on Track 00 Tranche 3 and Track 52 Tranche 1.
   Verify: real behavioral proof per Track 00 — unit tests over `resolveM1SurfaceContext` covering all four (face, layout) combinations, plus a UF e2e asserting the M1 surface renders its correct mode on face 1 in the DAILY layout (the case the current code gets wrong). verifier ≠ closer; evidence = fresh command output.

3. **T3 — The layout switch the omni panel is supposed to be.**

   Brief: canon names the omni panel as the switch (`M5'-SPEC.md:91`, `:159`); no switch exists. A user can currently only reach `ide-deep` by side effect. Until a deliberate switch exists, T4's deep layout is unreachable and therefore unverifiable.
   Build: a `layout.switch` (and/or `layout.toggle`) command in the command spine, registered in `COMMAND_CATALOG` per §11 of `CHROME-CONTRACT.md`, surfaced as a real control in the OmniPanel (canon's named mechanism), persisting through the existing `epi-logos.layout.active` preference. Every transition must produce a `createCrossLayoutIdentityReceipt` (`crossLayoutIdentity.ts:69`) — the switch is the exact place the seven-field invariant earns its keep. `LAYOUT_VERSION` (`App.tsx:271`) bump law applies if default models change.
   Depends on Track 00 Tranche 3 and Track 52 Tranche 2.
   Verify: real behavioral proof per Track 00 — a UF e2e switches layouts through the real control in both directions, asserts `epi-logos.layout.active` persists across reload, and asserts the identity receipt was produced with all seven fields intact. verifier ≠ closer; evidence = fresh command output.

4. **T4 — `ideDeepDefault()`: the deep layout becomes a real pane set.**

   Brief: `M5'-SPEC.md:91` specifies the deep IDE layout as "M0/M5 IDE chrome, six M-extensions, two integrated plugins, agentic control room". Today `ide-deep` only SUBTRACTS three daily widgets from face 0 (`App.tsx:1270`). This tranche makes the deep layout a layout.
   Build: a third FlexLayout model `ideDeepDefault()` alongside `personalDefault`/`cosmicDefault`, carrying the deep IDE chrome the spec names. Decide explicitly — and record — whether the deep layout is per-face (a deep model for each face) or face-independent; the spec's "one shell" language and the orthogonality of the two axes both bear on this, and the answer changes `factory(node, activeLayout)`'s shape. The left slot must differ per layout for the first time (`shellSlotPolicy.ts:73` already declares `bottom` as the only per-layout slot — reconcile that declaration with what this tranche actually makes per-layout, and update it rather than leaving it stale).
   Every surface the deep model mounts needs its `CHROME-CONTRACT.md` §2 row in the same change — a `pending` surface id found in the factory FAILS the validator (`CHROME-CONTRACT.md:82`), and `src/chromeContract.test.ts` AST-walks the factory in both directions.
   Depends on Track 00 Tranche 3 and Track 52 Tranche 3.
   Verify: real behavioral proof per Track 00 — a UF e2e enters the deep layout through T3's real switch and asserts the deep pane set renders (not merely that three daily widgets vanished), that the chrome-contract validator agrees with what mounted, and that returning to daily restores the daily pane set with cross-layout identity intact. verifier ≠ closer; evidence = fresh command output.

5. **T5 — The M0′–M5′ subsystem pages: the 4+2 body.**

   Brief: this is the tranche the whole track exists for. `M'-SYSTEM-SPEC.md:168` — "Subsystem pages M0-M5 are the 4+2 explicate development of the (0/1) — the six positions of the matheme made into full-depth workspaces. They are not 'below' the shells and not duplicates of the shells." `M'-SYSTEM-SPEC.md:130` — "The subsystem pages M0'-M5' are the 4+2 body where depth lives. The OmniPanel is where agent, config, readiness, and operator concerns cross-cut everything." `M'-PORTAL-SPEC.md:57` — "The 4+2 layer is where M0' through M5' become fully engageable as their own instruments." `M'-PORTAL-SPEC.md:159` already enumerates `origin_surface` as one of `shell-0`, `shell-1`, `/`, or `4+2`, so the envelope vocabulary for this layer exists before the layer does.
   Build: six subsystem workspaces, one per M0′–M5′, reachable within the deep layout, each gathering that subsystem's depth surfaces as a workspace rather than as sibling tabs in a flat tabset. Plus the Home affordance canon describes: the 0/1 split view by default, with a toggle to the subsystems grid. `M'-TAURI-PORT-SPEC.md:65`'s "do not merge them" is the acceptance posture — a subsystem page that is just the shell's preview widget enlarged has not delivered depth.
   The ~24 depth tabs currently scattered across `cosmicDefault` and `personalDefault` are the raw material; decide per surface whether it moves, is mirrored, or stays a shell preview, and record that disposition the way `dailySurfaceOwnership.ts` records its own (that module's coordinate header is already `M' M5-3'` — it is the existing precedent for exactly this bookkeeping).
   Depends on Track 00 Tranche 3 and Track 52 Tranche 4.
   Verify: real behavioral proof per Track 00 — a UF e2e reaches each of the six subsystem pages from Home, asserts each renders its own subsystem's depth surfaces (not the shell preview), and asserts cross-layout identity survives entry and exit. The disposition record must account for every one of the currently-scattered depth tabs — an unaccounted tab is a FAIL, not an omission. verifier ≠ closer; evidence = fresh command output.

6. **T6 — Wire the activity-bar mode registry and reconcile its contradictions.**

   Brief: `LEFT_SIDEBAR_MODES` (`leftSidebarModes.ts:66`) declares five modes with per-layout availability, and `resolveModeForLayout` (`:135`) already implements the honest fallback for a mode that cannot survive into daily. None of it runs: `registerLeftSidebarModeCommands` (`:192`) has zero production callers and the rendered sidebar is hardcoded FlexLayout JSON (`App.tsx:180`). Two declared contradictions sit inside this: `smart-connections` declares `availableInLayouts: ['ide-deep']` while `CHROME-CONTRACT.md` lists `semanticConnections` as a live face-1 left-border tab reachable in daily; and the one `ACTIVE_LAYOUT_CLAIMS` row (`layoutClaims.ts:43`) is `code-pending` with a null receiver.
   Build: make the left slot read the registry, so the two `ide-deep`-only modes become genuinely reachable in the deep layout and genuinely absent in daily. Resolve the `smart-connections` contradiction in whichever direction is correct and update the losing declaration in the same change. Register the mode commands in `COMMAND_CATALOG`. `shellSlotPolicy.ts:23` names `left` as `activity-bar-switched` — this tranche is what makes that policy true.
   Depends on Track 00 Tranche 3 and Track 52 Tranche 4.
   Verify: real behavioral proof per Track 00 — a UF e2e asserts the deep layout offers the deep-only modes and the daily layout does not, that switching layouts while on a deep-only mode falls back per `resolveModeForLayout` rather than rendering an empty slot, and that `activityBarMode` (a cross-layout identity field) is handled coherently by that fallback. verifier ≠ closer; evidence = fresh command output.

---

## Provenance of this track

Written 2026-07-25 from a source-level audit of `Body/M/pratibimba-app/src` against `M5'-SPEC.md`, `M'-SYSTEM-SPEC.md`, `M'-PORTAL-SPEC.md`, `M'-TAURI-PORT-SPEC.md` and the M1-4 QL reading of 4+2. Every divergence above carries its `file:line`; none is inferred from a coordinate's name.

The audit was triggered while closing the first tranche of the specced-surface gap-closure track: three of its remaining surfaces are canon-named as deep/4+2 surfaces, and there was no deep layer to land them in. The Architect ruled the layer gets built first.

This track claims the six divergences above are real and now scheduled. It does NOT claim the layout audit is exhaustive — `resolveM1SurfaceContext` was found by grepping for face/layout conflation, and T2 explicitly requires auditing for further sites before assuming it is the only one.
