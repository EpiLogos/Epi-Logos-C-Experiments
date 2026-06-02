# Dual-Portal Identity-Centred Rewrite

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Tauri app from a dashboard-with-tabs into two distinct portals — a cosmic/temporal visualization portal (Portal 0) and a personal/agentic identity portal (Portal 1) — with the Nara identity matrix as the gravitational centre, real text highlighting in the flow editor, and proper alignment with the CLI's identity system, gateway contracts, and agent envelope architecture.

**Architecture:** The Shell splits into Portal 0 (left: clock, Kairos, Bimba graph, strata) and Portal 1 (right: identity matrix, flow editor with highlight capture, Epii inbox, agent panel). Identity is loaded from the CLI's `~/.epi-logos/nara/profile.json` via new Rust commands. The flow editor uses TipTap's Highlight extension with custom marks to create `FlowHighlight` objects from text selections, which route through `InvocationEnvelope` to agents. The highlight sidebar becomes a live registry fed from the backend, not hardcoded categories.

**Tech Stack:** Tauri v2, React 19, Zustand, TipTap (StarterKit + Highlight + custom FlowMark), react-resizable-panels, framer-motion, react-force-graph-2d, @react-three/fiber, BLAKE3 (Rust), serde

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/stores/identityStore.ts` | User identity state: profile, layers, quintessence, wound status, session hash |
| `src/stores/highlightStore.ts` | Active highlights in current flow, highlight categories from registry |
| `src/services/identityClient.ts` | Tauri IPC calls for identity commands |
| `src/services/highlightClient.ts` | Tauri IPC calls for highlight CRUD |
| `src/domains/Portal1/IdentityMatrix.tsx` | 5-layer identity display with layer cards, quintessence badge, elemental profile |
| `src/domains/Portal1/IdentityLayerCard.tsx` | Single layer display (numerological, astrological, Jungian, Gene Keys, Human Design) |
| `src/domains/Portal1/FlowEditor.tsx` | Rewritten TipTap editor with highlight mark capture, category picker popover |
| `src/domains/Portal1/HighlightCategoryPicker.tsx` | Popover on text selection showing 8 canonical categories |
| `src/domains/Portal1/HighlightRail.tsx` | Vertical rail alongside editor showing active highlights with colours |
| `src/domains/Portal1/Portal1.tsx` | Right portal container: identity pages, flow editor, Epii inbox, agent panel |
| `src/domains/Portal0/Portal0.tsx` | Left portal container: full clock, Kairos, Bimba graph, strata |
| `src/domains/Portal0/KairosPanel.tsx` | Planet positions, hour ruler, decan, tattva display |
| `src-tauri/src/commands/identity.rs` | Rust commands: nara_identity_show, nara_identity_layers, nara_identity_layer_set, nara_wind_status, nara_quintessence |
| `src-tauri/src/commands/highlights.rs` | Rust commands: highlight_list, highlight_create, highlight_list_categories |
| `src-tauri/src/nara/identity.rs` | Nara identity types mirrored from CLI (ProfileJson, LayerMeta, NaraIdentityMatrix) |
| `src-tauri/src/nara/mod.rs` | Nara module barrel |

### Modified Files

| File | Changes |
|------|---------|
| `src/shell/Shell.tsx` | Replace two-panel layout with Portal0/Portal1 portal architecture |
| `src/stores/uiStore.ts` | Add `activePortal1Tab` (identity/flow/inbox/agents), remove `activeWorkspace` M0/M4/M5 concept |
| `src/services/types.ts` | Add identity types (ProfileJson, LayerMeta, NaraIdentityMatrix, WoundStatus, ElementalProfile) |
| `src/services/naraClient.ts` | Wire sendoff to use highlight store's session context |
| `src/domains/ClockCosmos.tsx` | Expand to full clock: add KairosPanel, fuller strata, decan chain display |
| `src/domains/M3_Mahamaya/StrataPanel.tsx` | Make always-visible in Portal0, not toggle-only |
| `src/domains/M4_Nara/HighlightSidebar.tsx` | Replace hardcoded categories with backend-fed registry |
| `src-tauri/src/commands/mod.rs` | Add `pub mod identity; pub mod highlights;` |
| `src-tauri/src/lib.rs` | Register identity and highlight commands, add `pub mod nara;` |
| `src-tauri/src/state.rs` | Add identity state to AppState |
| `src-tauri/Cargo.toml` | Add `blake3` dependency (already present), `zeroize` for identity types |

### Removed / Replaced Files

| File | Reason |
|------|--------|
| `src/domains/WorkspacePanel.tsx` | Replaced by Portal1.tsx — the M0/M4/M5 workspace switching concept is gone |
| `src/domains/M4_Nara/NaraDashboard.tsx` | Replaced by Portal1.tsx with identity-first tab structure |
| `src/domains/M4_Nara/NaraEditor.tsx` | Replaced by FlowEditor.tsx with highlight capture |
| `src/domains/M4_Nara/FlowTimeline.tsx` | Flow is now a single writing surface, not a timeline |

---

## Task 1: Nara Identity Types in Rust

**Files:**
- Create: `src-tauri/src/nara/mod.rs`
- Create: `src-tauri/src/nara/identity.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Create the nara module barrel**

```rust
// src-tauri/src/nara/mod.rs
pub mod identity;
```

- [ ] **Step 2: Create identity types mirroring CLI structs**

```rust
// src-tauri/src/nara/identity.rs
use std::collections::HashMap;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NumerologicalLayer {
    pub numerological_key: u32,
    pub sixfold_difference: u8,
    pub sixfold_sum: u8,
    pub life_path: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AstrologicalLayer {
    pub sun_degree_anchor: u16,
    pub moon_degree_anchor: u16,
    pub asc_degree_anchor: u16,
    pub mc_degree_anchor: u16,
    pub planet_degrees: [u16; 10],
    pub dominant_sign: u8,
    pub dominant_element: u8,
    pub dominant_modality: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct JungianLayer {
    pub adenine_water: u8,
    pub thymine_fire: u8,
    pub cytosine_earth: u8,
    pub guanine_air: u8,
    pub mbti_raw: u8,
    pub dominant_function: u8,
    pub auxiliary_function: u8,
    pub enneagram_type: u8,
    pub enneagram_wing: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GeneKeysLayer {
    pub gene_keys_activation: u64,
    pub shadow_mask: u64,
    pub gift_mask: u64,
    pub siddhi_mask: u64,
    pub life_work_hex: u8,
    pub evolution_hex: u8,
    pub radiance_hex: u8,
    pub purpose_hex: u8,
    pub attraction_hex: u8,
    pub iq_hex: u8,
    pub eq_hex: u8,
    pub sq_hex: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HumanDesignLayer {
    pub hd_type: u8,
    pub hd_authority: u8,
    pub hd_profile: [u8; 2],
    pub hd_definition: u8,
    pub incarnation_cross: u8,
    pub defined_channels: u16,
    pub defined_gates: [u32; 2],
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NaraIdentityMatrix {
    pub layer_presence: u8,
    pub layer_0: Option<NumerologicalLayer>,
    pub layer_1: Option<AstrologicalLayer>,
    pub layer_2: Option<JungianLayer>,
    pub layer_3: Option<GeneKeysLayer>,
    pub layer_4: Option<HumanDesignLayer>,
    pub quintessence_hash: String,
    pub quintessence_preview: String,
    pub computed: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LayerMeta {
    pub present: bool,
    pub source: String,
    pub completeness: u8,
    pub set_at: Option<u64>,
    pub elemental_profile: Option<[f32; 4]>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProfileJson {
    pub version: u32,
    pub layers: HashMap<String, LayerMeta>,
    pub layer_presence_mask: u8,
    pub hash_preview: String,
    pub last_wound: Option<u64>,
    pub kerykeion_version: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WoundStatus {
    pub wound: bool,
    pub layers_present: u8,
    pub quintessence_hash: String,
    pub quintessence_preview: String,
    pub last_wound: Option<u64>,
    pub layer_count: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ElementalProfile {
    pub fire: f32,
    pub water: f32,
    pub earth: f32,
    pub air: f32,
}

pub fn nara_home() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".epi-logos")
        .join("nara")
}

pub fn profile_path() -> PathBuf {
    nara_home().join("profile.json")
}

pub fn load_profile() -> Result<Option<ProfileJson>, String> {
    let path = profile_path();
    if !path.exists() {
        return Ok(None);
    }
    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("failed to read profile: {}", e))?;
    let profile: ProfileJson = serde_json::from_str(&content)
        .map_err(|e| format!("failed to parse profile: {}", e))?;
    Ok(Some(profile))
}

pub fn profile_to_wound_status(profile: &ProfileJson) -> WoundStatus {
    WoundStatus {
        wound: profile.last_wound.is_some(),
        layers_present: profile.layer_presence_mask,
        quintessence_hash: profile.hash_preview.clone(),
        quintessence_preview: if profile.hash_preview.len() >= 8 {
            profile.hash_preview[..8].to_string()
        } else {
            profile.hash_preview.clone()
        },
        last_wound: profile.last_wound,
        layer_count: profile.layer_presence_mask.count_ones() as u8,
    }
}

pub fn compute_elemental_profile(profile: &ProfileJson) -> ElementalProfile {
    let mut fire = 0.0f32;
    let mut water = 0.0f32;
    let mut earth = 0.0f32;
    let mut air = 0.0f32;
    let mut count = 0u8;

    for (_key, meta) in &profile.layers {
        if meta.present {
            if let Some(ep) = &meta.elemental_profile {
                fire += ep[0];
                water += ep[1];
                earth += ep[2];
                air += ep[3];
                count += 1;
            }
        }
    }

    if count == 0 {
        return ElementalProfile { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25 };
    }

    let n = count as f32;
    ElementalProfile {
        fire: fire / n,
        water: water / n,
        earth: earth / n,
        air: air / n,
    }
}
```

- [ ] **Step 3: Register the nara module in lib.rs**

Add `pub mod nara;` to the module declarations in `src-tauri/src/lib.rs` (after the existing `pub mod library;` line).

- [ ] **Step 4: Run cargo check**

Run: `cd src-tauri && cargo check`
Expected: Clean compilation, zero errors.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/nara/mod.rs src-tauri/src/nara/identity.rs src-tauri/src/lib.rs
git commit -m "feat(nara): add identity types mirroring CLI structs"
```

---

## Task 2: Identity Rust Commands

**Files:**
- Create: `src-tauri/src/commands/identity.rs`
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Create identity commands**

```rust
// src-tauri/src/commands/identity.rs
use crate::error::AppError;
use crate::nara::identity::{
    self, ElementalProfile, LayerMeta, ProfileJson, WoundStatus,
};
use std::collections::HashMap;

#[tauri::command]
pub async fn nara_identity_show() -> Result<Option<ProfileJson>, AppError> {
    identity::load_profile().map_err(|e| AppError::Custom(e))
}

#[tauri::command]
pub async fn nara_identity_wound_status() -> Result<WoundStatus, AppError> {
    match identity::load_profile().map_err(|e| AppError::Custom(e))? {
        Some(profile) => Ok(identity::profile_to_wound_status(&profile)),
        None => Ok(WoundStatus {
            wound: false,
            layers_present: 0,
            quintessence_hash: String::new(),
            quintessence_preview: String::new(),
            last_wound: None,
            layer_count: 0,
        }),
    }
}

#[tauri::command]
pub async fn nara_identity_layers() -> Result<HashMap<String, LayerMeta>, AppError> {
    match identity::load_profile().map_err(|e| AppError::Custom(e))? {
        Some(profile) => Ok(profile.layers),
        None => Ok(HashMap::new()),
    }
}

#[tauri::command]
pub async fn nara_identity_elemental() -> Result<ElementalProfile, AppError> {
    match identity::load_profile().map_err(|e| AppError::Custom(e))? {
        Some(profile) => Ok(identity::compute_elemental_profile(&profile)),
        None => Ok(ElementalProfile { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25 }),
    }
}

#[tauri::command]
pub async fn nara_identity_layer_set(
    layer: String,
    source: String,
) -> Result<(), AppError> {
    let mut profile = identity::load_profile()
        .map_err(|e| AppError::Custom(e))?
        .unwrap_or(ProfileJson {
            version: 1,
            layers: HashMap::new(),
            layer_presence_mask: 0,
            hash_preview: String::new(),
            last_wound: None,
            kerykeion_version: None,
        });

    let layer_idx: u8 = layer.parse()
        .map_err(|_| AppError::Custom(format!("invalid layer index: {}", layer)))?;
    if layer_idx > 4 {
        return Err(AppError::Custom("layer index must be 0-4".to_string()));
    }

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    profile.layers.insert(layer.clone(), LayerMeta {
        present: true,
        source,
        completeness: 1,
        set_at: Some(now),
        elemental_profile: None,
    });
    profile.layer_presence_mask |= 1 << layer_idx;

    let path = identity::profile_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| AppError::Custom(format!("failed to create nara dir: {}", e)))?;
    }
    let content = serde_json::to_string_pretty(&profile)
        .map_err(|e| AppError::Custom(format!("failed to serialize profile: {}", e)))?;
    std::fs::write(&path, content)
        .map_err(|e| AppError::Custom(format!("failed to write profile: {}", e)))?;

    Ok(())
}
```

- [ ] **Step 2: Check AppError has a Custom variant**

Read `src-tauri/src/error.rs` and verify there is a way to construct from a String. If `AppError` uses `#[from] String` or has a variant like `Custom(String)`, use it. If not, add one:

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    // ... existing variants ...
    #[error("{0}")]
    Custom(String),
}
```

- [ ] **Step 3: Register commands**

Add `pub mod identity;` to `src-tauri/src/commands/mod.rs`.

Add to the `generate_handler!` block in `src-tauri/src/lib.rs`:
```rust
commands::identity::nara_identity_show,
commands::identity::nara_identity_wound_status,
commands::identity::nara_identity_layers,
commands::identity::nara_identity_elemental,
commands::identity::nara_identity_layer_set,
```

- [ ] **Step 4: Run cargo check**

Run: `cd src-tauri && cargo check`
Expected: Clean compilation.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/commands/identity.rs src-tauri/src/commands/mod.rs src-tauri/src/lib.rs src-tauri/src/error.rs
git commit -m "feat(identity): add Tauri commands for identity show/layers/elemental/layer-set"
```

---

## Task 3: Highlight Commands in Rust

**Files:**
- Create: `src-tauri/src/commands/highlights.rs`
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Create highlight commands that read from the existing vault highlight registry**

```rust
// src-tauri/src/commands/highlights.rs
use tauri::State;

use crate::error::AppError;
use crate::state::AppState;
use crate::vault::highlight_registry::{Highlight, HighlightCategory, HighlightProvenance, HighlightRegistry};

#[tauri::command]
pub async fn highlight_list_categories(
    state: State<'_, AppState>,
) -> Result<Vec<HighlightCategory>, AppError> {
    let registry = HighlightRegistry::canonical();
    Ok(registry.all_categories())
}

#[tauri::command]
pub async fn highlight_create(
    category: String,
    from: u32,
    to: u32,
    text: String,
    flow_version: u32,
    day_now_path: String,
    session_id: Option<String>,
) -> Result<Highlight, AppError> {
    let id = format!("hl-{}", uuid::Uuid::new_v4().as_simple());
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    Ok(Highlight {
        id,
        category,
        from,
        to,
        original_text: text,
        label: None,
        color: None,
        timestamp: now,
        provenance: HighlightProvenance {
            flow_version,
            session_id,
            day_now_path,
        },
        run_id: None,
        result_path: None,
    })
}

#[tauri::command]
pub async fn highlight_list(
    _state: State<'_, AppState>,
) -> Result<Vec<Highlight>, AppError> {
    Ok(vec![])
}
```

- [ ] **Step 2: Ensure HighlightRegistry has `canonical()` and `all_categories()` methods**

Read `src-tauri/src/vault/highlight_registry.rs`. If `HighlightRegistry::canonical()` or `all_categories()` don't exist, add them:

```rust
impl HighlightRegistry {
    pub fn canonical() -> Self {
        let mut registry = Self { categories: HashMap::new() };
        for cat in CANONICAL_CATEGORIES.iter() {
            registry.categories.insert(cat.id.clone(), cat.clone());
        }
        registry
    }

    pub fn all_categories(&self) -> Vec<HighlightCategory> {
        self.categories.values().cloned().collect()
    }
}
```

- [ ] **Step 3: Register commands**

Add `pub mod highlights;` to `src-tauri/src/commands/mod.rs`.

Add to `generate_handler!` in `src-tauri/src/lib.rs`:
```rust
commands::highlights::highlight_list_categories,
commands::highlights::highlight_create,
commands::highlights::highlight_list,
```

- [ ] **Step 4: Run cargo check**

Run: `cd src-tauri && cargo check`
Expected: Clean compilation.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/commands/highlights.rs src-tauri/src/commands/mod.rs src-tauri/src/lib.rs
git commit -m "feat(highlights): add Tauri commands for highlight categories and creation"
```

---

## Task 4: TypeScript Identity & Highlight Types

**Files:**
- Modify: `src/services/types.ts`
- Create: `src/services/identityClient.ts`
- Create: `src/services/highlightClient.ts`

- [ ] **Step 1: Add identity types to types.ts**

Append to `src/services/types.ts`:

```typescript
// ── Identity Matrix ─────────────────────────────────────────────────────

export interface NumerologicalLayer {
  numerological_key: number;
  sixfold_difference: number;
  sixfold_sum: number;
  life_path: number;
}

export interface AstrologicalLayer {
  sun_degree_anchor: number;
  moon_degree_anchor: number;
  asc_degree_anchor: number;
  mc_degree_anchor: number;
  planet_degrees: number[];
  dominant_sign: number;
  dominant_element: number;
  dominant_modality: number;
}

export interface JungianLayer {
  adenine_water: number;
  thymine_fire: number;
  cytosine_earth: number;
  guanine_air: number;
  mbti_raw: number;
  dominant_function: number;
  auxiliary_function: number;
  enneagram_type: number;
  enneagram_wing: number;
}

export interface GeneKeysLayer {
  gene_keys_activation: number;
  shadow_mask: number;
  gift_mask: number;
  siddhi_mask: number;
  life_work_hex: number;
  evolution_hex: number;
  radiance_hex: number;
  purpose_hex: number;
  attraction_hex: number;
  iq_hex: number;
  eq_hex: number;
  sq_hex: number;
}

export interface HumanDesignLayer {
  hd_type: number;
  hd_authority: number;
  hd_profile: [number, number];
  hd_definition: number;
  incarnation_cross: number;
  defined_channels: number;
  defined_gates: [number, number];
}

export interface LayerMeta {
  present: boolean;
  source: string;
  completeness: number;
  set_at: number | null;
  elemental_profile: [number, number, number, number] | null;
}

export interface ProfileJson {
  version: number;
  layers: Record<string, LayerMeta>;
  layer_presence_mask: number;
  hash_preview: string;
  last_wound: number | null;
  kerykeion_version: string | null;
}

export interface WoundStatus {
  wound: boolean;
  layers_present: number;
  quintessence_hash: string;
  quintessence_preview: string;
  last_wound: number | null;
  layer_count: number;
}

export interface ElementalProfile {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

export interface Highlight {
  id: string;
  category: HighlightCategoryId;
  from: number;
  to: number;
  original_text: string;
  label: string | null;
  color: string | null;
  timestamp: number;
  provenance: HighlightProvenance;
  run_id: string | null;
  result_path: string | null;
}

export interface HighlightProvenance {
  flow_version: number;
  session_id: string | null;
  day_now_path: string;
}
```

- [ ] **Step 2: Create identityClient.ts**

```typescript
// src/services/identityClient.ts
import { invoke } from './invoke';
import type {
  ProfileJson,
  WoundStatus,
  LayerMeta,
  ElementalProfile,
} from './types';

export const identityClient = {
  show: () => invoke<ProfileJson | null>('nara_identity_show'),
  woundStatus: () => invoke<WoundStatus>('nara_identity_wound_status'),
  layers: () => invoke<Record<string, LayerMeta>>('nara_identity_layers'),
  elemental: () => invoke<ElementalProfile>('nara_identity_elemental'),
  setLayer: (layer: string, source: string) =>
    invoke<void>('nara_identity_layer_set', { layer, source }),
};
```

- [ ] **Step 3: Create highlightClient.ts**

```typescript
// src/services/highlightClient.ts
import { invoke } from './invoke';
import type { HighlightCategory, Highlight } from './types';

export const highlightClient = {
  listCategories: () =>
    invoke<HighlightCategory[]>('highlight_list_categories'),
  create: (params: {
    category: string;
    from: number;
    to: number;
    text: string;
    flow_version: number;
    day_now_path: string;
    session_id?: string;
  }) => invoke<Highlight>('highlight_create', params),
  list: () => invoke<Highlight[]>('highlight_list'),
};
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/services/types.ts src/services/identityClient.ts src/services/highlightClient.ts
git commit -m "feat(ts): add identity and highlight client types and IPC wrappers"
```

---

## Task 5: Identity Store (Zustand)

**Files:**
- Create: `src/stores/identityStore.ts`
- Modify: `src/stores/index.ts`

- [ ] **Step 1: Create the identity store**

```typescript
// src/stores/identityStore.ts
import { create } from 'zustand';
import { identityClient } from '@/services/identityClient';
import type {
  ProfileJson,
  WoundStatus,
  LayerMeta,
  ElementalProfile,
} from '@/services/types';

interface IdentityStore {
  profile: ProfileJson | null;
  woundStatus: WoundStatus | null;
  elemental: ElementalProfile | null;
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  fetchWoundStatus: () => Promise<void>;
  fetchElemental: () => Promise<void>;
  setLayer: (layer: string, source: string) => Promise<void>;
}

export const useIdentityStore = create<IdentityStore>((set, get) => ({
  profile: null,
  woundStatus: null,
  elemental: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await identityClient.show();
      set({ profile, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  fetchWoundStatus: async () => {
    try {
      const woundStatus = await identityClient.woundStatus();
      set({ woundStatus });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  fetchElemental: async () => {
    try {
      const elemental = await identityClient.elemental();
      set({ elemental });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  setLayer: async (layer: string, source: string) => {
    try {
      await identityClient.setLayer(layer, source);
      await get().fetchProfile();
      await get().fetchWoundStatus();
      await get().fetchElemental();
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
```

- [ ] **Step 2: Add export to stores/index.ts**

Add to `src/stores/index.ts`:
```typescript
export { useIdentityStore } from './identityStore';
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/stores/identityStore.ts src/stores/index.ts
git commit -m "feat(store): add identity store with profile/wound/elemental state"
```

---

## Task 6: Highlight Store (Zustand)

**Files:**
- Create: `src/stores/highlightStore.ts`
- Modify: `src/stores/index.ts`

- [ ] **Step 1: Create the highlight store**

```typescript
// src/stores/highlightStore.ts
import { create } from 'zustand';
import { highlightClient } from '@/services/highlightClient';
import type { HighlightCategory, Highlight } from '@/services/types';

interface HighlightStore {
  categories: HighlightCategory[];
  highlights: Highlight[];
  pendingSelection: { from: number; to: number; text: string } | null;
  loading: boolean;

  fetchCategories: () => Promise<void>;
  fetchHighlights: () => Promise<void>;
  setPendingSelection: (sel: { from: number; to: number; text: string } | null) => void;
  createHighlight: (
    categoryId: string,
    flowVersion: number,
    dayNowPath: string,
    sessionId?: string,
  ) => Promise<Highlight | null>;
}

export const useHighlightStore = create<HighlightStore>((set, get) => ({
  categories: [],
  highlights: [],
  pendingSelection: null,
  loading: false,

  fetchCategories: async () => {
    try {
      const categories = await highlightClient.listCategories();
      set({ categories });
    } catch {
      set({ categories: [] });
    }
  },

  fetchHighlights: async () => {
    try {
      const highlights = await highlightClient.list();
      set({ highlights });
    } catch {
      set({ highlights: [] });
    }
  },

  setPendingSelection: (sel) => set({ pendingSelection: sel }),

  createHighlight: async (categoryId, flowVersion, dayNowPath, sessionId) => {
    const sel = get().pendingSelection;
    if (!sel) return null;

    try {
      const hl = await highlightClient.create({
        category: categoryId,
        from: sel.from,
        to: sel.to,
        text: sel.text,
        flow_version: flowVersion,
        day_now_path: dayNowPath,
        session_id: sessionId,
      });
      set((s) => ({
        highlights: [...s.highlights, hl],
        pendingSelection: null,
      }));
      return hl;
    } catch {
      return null;
    }
  },
}));
```

- [ ] **Step 2: Add export to stores/index.ts**

Add to `src/stores/index.ts`:
```typescript
export { useHighlightStore } from './highlightStore';
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/stores/highlightStore.ts src/stores/index.ts
git commit -m "feat(store): add highlight store with category registry and selection tracking"
```

---

## Task 7: Update UI Store for Portal Architecture

**Files:**
- Modify: `src/stores/uiStore.ts`

- [ ] **Step 1: Replace workspace concept with portal tab concept**

Replace the entire `uiStore.ts` with:

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';
import type { MefLensId } from '@/services/types';

export type Portal1Tab = 'identity' | 'flow' | 'inbox' | 'agents';
export type ViewDimension = '2d' | '3d';

interface UiStore {
  omniPanelOpen: boolean;
  portal1Tab: Portal1Tab;
  viewDimension: ViewDimension;
  commandPaletteOpen: boolean;
  activeMefLens: MefLensId;
  activeBranchLens: number;
  strataExpanded: boolean;

  toggleOmniPanel: () => void;
  setPortal1Tab: (tab: Portal1Tab) => void;
  toggleDimension: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setMefLens: (lens: MefLensId) => void;
  setBranchLens: (lens: number) => void;
  toggleStrata: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  omniPanelOpen: false,
  portal1Tab: 'identity',
  viewDimension: '3d',
  commandPaletteOpen: false,
  activeMefLens: 0,
  activeBranchLens: 0,
  strataExpanded: false,

  toggleOmniPanel: () => set((s) => ({ omniPanelOpen: !s.omniPanelOpen })),
  setPortal1Tab: (tab) => set({ portal1Tab: tab }),
  toggleDimension: () =>
    set((s) => ({ viewDimension: s.viewDimension === '2d' ? '3d' : '2d' })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setMefLens: (lens) => set({ activeMefLens: lens }),
  setBranchLens: (lens) => set({ activeBranchLens: lens }),
  toggleStrata: () => set((s) => ({ strataExpanded: !s.strataExpanded })),
}));
```

- [ ] **Step 2: Update any imports referencing `ActiveWorkspace` or `setWorkspace`**

Search for `activeWorkspace` and `setWorkspace` in all `.tsx` files. Update references:
- `WorkspacePanel.tsx` will be replaced in Task 10, so leave it for now.
- `Shell.tsx` will be rewritten in Task 9.
- `CommandPalette.tsx` — update workspace navigation to use `setPortal1Tab` instead.
- `OmniPanel.tsx` — remove workspace references if any.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Errors from `WorkspacePanel.tsx` and `Shell.tsx` referencing old store shape — acceptable, these files are replaced in Tasks 9-10.

- [ ] **Step 4: Commit**

```bash
git add src/stores/uiStore.ts
git commit -m "refactor(ui): replace workspace concept with portal tab architecture"
```

---

## Task 8: Identity Matrix Component

**Files:**
- Create: `src/domains/Portal1/IdentityLayerCard.tsx`
- Create: `src/domains/Portal1/IdentityMatrix.tsx`

- [ ] **Step 1: Create IdentityLayerCard**

```typescript
// src/domains/Portal1/IdentityLayerCard.tsx
import type { LayerMeta } from '@/services/types';

const LAYER_NAMES: Record<string, string> = {
  '0': 'Numerological',
  '1': 'Astrological',
  '2': 'Jungian',
  '3': 'Gene Keys',
  '4': 'Human Design',
};

const LAYER_COLORS: Record<string, string> = {
  '0': '#f59e0b',
  '1': '#8b5cf6',
  '2': '#ef4444',
  '3': '#10b981',
  '4': '#3b82f6',
};

interface Props {
  layerKey: string;
  meta: LayerMeta | undefined;
  onSet?: (layerKey: string) => void;
}

export function IdentityLayerCard({ layerKey, meta, onSet }: Props) {
  const name = LAYER_NAMES[layerKey] ?? `Layer ${layerKey}`;
  const color = LAYER_COLORS[layerKey] ?? '#6b7280';
  const present = meta?.present ?? false;

  return (
    <div
      style={{
        border: `1px solid ${present ? color : '#374151'}`,
        borderRadius: 8,
        padding: '12px 16px',
        background: present ? `${color}10` : '#111827',
        opacity: present ? 1 : 0.5,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color, fontWeight: 600, fontSize: 13 }}>{name}</div>
          {present && meta ? (
            <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>
              {meta.source}
              {meta.completeness > 0 && (
                <span style={{ marginLeft: 8 }}>{'*'.repeat(meta.completeness)}</span>
              )}
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>Not set</div>
          )}
        </div>
        {!present && onSet && (
          <button
            onClick={() => onSet(layerKey)}
            style={{
              background: color,
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 10px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Set
          </button>
        )}
      </div>
      {present && meta?.elemental_profile && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['Fire', 'Water', 'Earth', 'Air'].map((el, i) => (
            <div key={el} style={{ fontSize: 10, color: '#9ca3af' }}>
              {el}: {((meta.elemental_profile![i]) * 100).toFixed(0)}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create IdentityMatrix**

```typescript
// src/domains/Portal1/IdentityMatrix.tsx
import { useEffect } from 'react';
import { useIdentityStore } from '@/stores/identityStore';
import { IdentityLayerCard } from './IdentityLayerCard';

export function IdentityMatrix() {
  const { profile, woundStatus, elemental, fetchProfile, fetchWoundStatus, fetchElemental } =
    useIdentityStore();

  useEffect(() => {
    fetchProfile();
    fetchWoundStatus();
    fetchElemental();
  }, [fetchProfile, fetchWoundStatus, fetchElemental]);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'auto' }}>
      {/* Quintessence Badge */}
      <div style={{
        background: '#1e1b4b',
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ color: '#a78bfa', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
            Quintessence
          </div>
          <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: 16, marginTop: 4 }}>
            {woundStatus?.quintessence_preview || '--------'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#6b7280', fontSize: 11 }}>
            {woundStatus?.layer_count ?? 0}/5 layers
          </div>
          <div style={{ color: woundStatus?.wound ? '#4ade80' : '#ef4444', fontSize: 11, marginTop: 2 }}>
            {woundStatus?.wound ? 'Wound' : 'Unwound'}
          </div>
        </div>
      </div>

      {/* Elemental Profile */}
      {elemental && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}>
          {[
            { label: 'Fire', value: elemental.fire, color: '#ef4444' },
            { label: 'Water', value: elemental.water, color: '#3b82f6' },
            { label: 'Earth', value: elemental.earth, color: '#a3e635' },
            { label: 'Air', value: elemental.air, color: '#e2e8f0' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                height: 4,
                borderRadius: 2,
                background: '#1f2937',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${value * 100}%`,
                  background: color,
                  borderRadius: 2,
                }} />
              </div>
              <div style={{ color, fontSize: 10, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Layer Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['0', '1', '2', '3', '4'].map((key) => (
          <IdentityLayerCard
            key={key}
            layerKey={key}
            meta={profile?.layers[key]}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors (these components are standalone).

- [ ] **Step 4: Commit**

```bash
git add src/domains/Portal1/IdentityMatrix.tsx src/domains/Portal1/IdentityLayerCard.tsx
git commit -m "feat(identity): add IdentityMatrix and IdentityLayerCard components"
```

---

## Task 9: Flow Editor with Highlight Capture

**Files:**
- Create: `src/domains/Portal1/HighlightCategoryPicker.tsx`
- Create: `src/domains/Portal1/FlowEditor.tsx`
- Create: `src/domains/Portal1/HighlightRail.tsx`

- [ ] **Step 1: Create HighlightCategoryPicker**

```typescript
// src/domains/Portal1/HighlightCategoryPicker.tsx
import type { HighlightCategory } from '@/services/types';

interface Props {
  categories: HighlightCategory[];
  position: { x: number; y: number };
  onSelect: (categoryId: string) => void;
  onClose: () => void;
}

export function HighlightCategoryPicker({ categories, position, onSelect, onClose }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
      />
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 1000,
          background: '#1f2937',
          border: '1px solid #374151',
          borderRadius: 8,
          padding: 4,
          minWidth: 180,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '6px 10px',
              background: 'transparent',
              border: 'none',
              color: '#e2e8f0',
              fontSize: 12,
              cursor: 'pointer',
              borderRadius: 4,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#374151'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: cat.default_color,
              flexShrink: 0,
            }} />
            <span>{cat.display_name}</span>
          </button>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create FlowEditor with selection-to-highlight pipeline**

```typescript
// src/domains/Portal1/FlowEditor.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { useHighlightStore } from '@/stores/highlightStore';
import { useVaultStore } from '@/stores/vaultStore';
import { useTemporalStore } from '@/stores/temporalStore';
import { HighlightCategoryPicker } from './HighlightCategoryPicker';

export function FlowEditor() {
  const { categories, fetchCategories, setPendingSelection, createHighlight } =
    useHighlightStore();
  const { currentFlow, fetchFlow, todayNote } = useVaultStore();
  const runtime = useTemporalStore((s) => s.runtime);
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
    ],
    content: currentFlow?.content ?? todayNote?.content ?? '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      useVaultStore.getState().saveFlow?.(html);
    },
  });

  const handleMouseUp = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (to - from < 2) return;

    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text.trim()) return;

    setPendingSelection({ from, to, text });

    const domSel = window.getSelection();
    if (domSel && domSel.rangeCount > 0) {
      const range = domSel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPickerPos({ x: rect.left, y: rect.bottom + 4 });
    }
  }, [editor, setPendingSelection]);

  const handleCategorySelect = useCallback(
    async (categoryId: string) => {
      setPickerPos(null);
      const dayNowPath = runtime?.now_path ?? '';
      const flowVersion = currentFlow?.version ?? 0;
      const hl = await createHighlight(categoryId, flowVersion, dayNowPath);

      if (hl && editor) {
        const cat = categories.find((c) => c.id === categoryId);
        const color = cat?.default_color ?? '#fbbf24';
        const { from, to } = useHighlightStore.getState().pendingSelection ?? { from: 0, to: 0 };
        editor.chain().focus().setTextSelection({ from, to }).setHighlight({ color }).run();
      }
    },
    [editor, categories, createHighlight, runtime, currentFlow],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '6px 12px',
        borderBottom: '1px solid #1f2937',
        background: '#111827',
      }}>
        {[
          { label: 'B', cmd: () => editor?.chain().focus().toggleBold().run() },
          { label: 'I', cmd: () => editor?.chain().focus().toggleItalic().run() },
          { label: 'H1', cmd: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
          { label: 'H2', cmd: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
          { label: 'List', cmd: () => editor?.chain().focus().toggleBulletList().run() },
        ].map(({ label, cmd }) => (
          <button
            key={label}
            onClick={cmd}
            style={{
              background: '#1f2937',
              color: '#9ca3af',
              border: '1px solid #374151',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        onMouseUp={handleMouseUp}
        style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Category picker popover */}
      {pickerPos && categories.length > 0 && (
        <HighlightCategoryPicker
          categories={categories}
          position={pickerPos}
          onSelect={handleCategorySelect}
          onClose={() => setPickerPos(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create HighlightRail**

```typescript
// src/domains/Portal1/HighlightRail.tsx
import { useHighlightStore } from '@/stores/highlightStore';

export function HighlightRail() {
  const { highlights, categories } = useHighlightStore();

  if (highlights.length === 0) {
    return (
      <div style={{ padding: 12, color: '#6b7280', fontSize: 11, textAlign: 'center' }}>
        Select text and mark it to create highlights
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8, overflow: 'auto' }}>
      {highlights.map((hl) => {
        const cat = categories.find((c) => c.id === hl.category);
        return (
          <div
            key={hl.id}
            style={{
              padding: '6px 10px',
              borderLeft: `3px solid ${cat?.default_color ?? '#6b7280'}`,
              background: '#1f2937',
              borderRadius: '0 4px 4px 0',
              fontSize: 11,
            }}
          >
            <div style={{ color: cat?.default_color ?? '#9ca3af', fontSize: 10, marginBottom: 2 }}>
              {cat?.display_name ?? hl.category}
            </div>
            <div style={{ color: '#d1d5db' }}>
              {hl.original_text.length > 60
                ? hl.original_text.slice(0, 60) + '...'
                : hl.original_text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors from these new files (may still have errors from old files being replaced — acceptable).

- [ ] **Step 5: Commit**

```bash
git add src/domains/Portal1/FlowEditor.tsx src/domains/Portal1/HighlightCategoryPicker.tsx src/domains/Portal1/HighlightRail.tsx
git commit -m "feat(flow): add FlowEditor with text selection highlight capture and category picker"
```

---

## Task 10: Portal 1 Container

**Files:**
- Create: `src/domains/Portal1/Portal1.tsx`
- Create: `src/domains/Portal1/index.ts`

- [ ] **Step 1: Create Portal1**

```typescript
// src/domains/Portal1/Portal1.tsx
import { useUiStore, type Portal1Tab } from '@/stores/uiStore';
import { IdentityMatrix } from './IdentityMatrix';
import { FlowEditor } from './FlowEditor';
import { HighlightRail } from './HighlightRail';
import { EpiiDashboard } from '@/domains/M5_Epii/EpiiDashboard';
import { EpiiAgent } from '@/domains/M5_Epii/EpiiAgent';

const TABS: { id: Portal1Tab; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'flow', label: 'Flow' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'agents', label: 'Agents' },
];

export function Portal1() {
  const { portal1Tab, setPortal1Tab } = useUiStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #1e293b',
        background: '#0f172a',
        padding: '0 12px',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPortal1Tab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: portal1Tab === tab.id ? '2px solid #a78bfa' : '2px solid transparent',
              color: portal1Tab === tab.id ? '#e2e8f0' : '#6b7280',
              fontSize: 13,
              fontWeight: portal1Tab === tab.id ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {portal1Tab === 'identity' && <IdentityMatrix />}
        {portal1Tab === 'flow' && (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <FlowEditor />
            </div>
            <div style={{ width: 220, borderLeft: '1px solid #1e293b', overflow: 'auto' }}>
              <HighlightRail />
            </div>
          </div>
        )}
        {portal1Tab === 'inbox' && <EpiiDashboard />}
        {portal1Tab === 'agents' && <EpiiAgent />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create barrel export**

```typescript
// src/domains/Portal1/index.ts
export { Portal1 } from './Portal1';
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors from Portal1 files.

- [ ] **Step 4: Commit**

```bash
git add src/domains/Portal1/Portal1.tsx src/domains/Portal1/index.ts
git commit -m "feat(portal1): add Portal1 container with identity/flow/inbox/agents tabs"
```

---

## Task 11: Kairos Panel and Portal 0

**Files:**
- Create: `src/domains/Portal0/KairosPanel.tsx`
- Create: `src/domains/Portal0/Portal0.tsx`
- Create: `src/domains/Portal0/index.ts`

- [ ] **Step 1: Create KairosPanel**

```typescript
// src/domains/Portal0/KairosPanel.tsx
import { useClockStore } from '@/stores/clockStore';

const PLANET_NAMES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ELEMENT_NAMES = ['Akasha', 'Air', 'Fire', 'Water', 'Earth'];

export function KairosPanel() {
  const state = useClockStore((s) => s.state);
  if (!state) return <div style={{ padding: 12, color: '#6b7280', fontSize: 11 }}>No clock state</div>;

  const kairos = state.kairos;

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ color: '#a78bfa', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
        Kairos
      </div>

      {/* Planetary hour */}
      {kairos && (
        <div style={{ color: '#e2e8f0', fontSize: 12 }}>
          Hour of {PLANET_NAMES[kairos.hour_planet] ?? '?'} ({kairos.current_hour}:00)
        </div>
      )}

      {/* Planet positions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {kairos?.planets?.map((p, i) => {
          if (!p || p.degree === 0xFFFF) return null;
          const sign = SIGN_NAMES[Math.floor(p.degree / 30)] ?? '?';
          const deg = p.degree % 30;
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af' }}>
              <span>{PLANET_NAMES[i]}</span>
              <span>
                {deg}° {sign}
                {p.is_retrograde ? ' R' : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dominant element */}
      {state.dominant_element !== undefined && (
        <div style={{ color: '#6ee7b7', fontSize: 11, marginTop: 4 }}>
          Element: {ELEMENT_NAMES[state.dominant_element] ?? '?'}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Portal0**

This wraps the existing `ClockCosmos` with `KairosPanel` and the `BimbaMap2D`/`BimbaMap3D` embedded below:

```typescript
// src/domains/Portal0/Portal0.tsx
import { lazy, Suspense } from 'react';
import { ClockCosmos } from '@/domains/ClockCosmos';
import { KairosPanel } from './KairosPanel';
import { BimbaMap2D } from '@/domains/M0_Anuttara/BimbaMap2D';
import { useUiStore } from '@/stores/uiStore';
import { useGraphStore } from '@/stores/graphStore';

const BimbaMap3D = lazy(() =>
  import('@/domains/M0_Anuttara/BimbaMap3D').then((m) => ({ default: m.BimbaMap3D })),
);

export function Portal0() {
  const viewDimension = useUiStore((s) => s.viewDimension);
  const graphData = useGraphStore((s) => s.data);
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const selectNode = useGraphStore((s) => s.selectNode);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0e1a' }}>
      {/* Clock section */}
      <div style={{ flexShrink: 0 }}>
        <ClockCosmos />
      </div>

      {/* Kairos */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #1e293b' }}>
        <KairosPanel />
      </div>

      {/* Bimba Graph */}
      <div style={{ flex: 1, borderTop: '1px solid #1e293b', minHeight: 200 }}>
        {viewDimension === '2d' ? (
          <BimbaMap2D
            nodes={graphData?.nodes ?? []}
            edges={graphData?.edges ?? []}
            selectedNodeId={selectedNode?.id ?? null}
            onNodeClick={(node) => selectNode?.(node)}
            activeLens={0}
          />
        ) : (
          <Suspense fallback={<div style={{ padding: 16, color: '#6b7280' }}>Loading 3D...</div>}>
            <BimbaMap3D
              nodes={graphData?.nodes ?? []}
              edges={graphData?.edges ?? []}
              selectedNodeId={selectedNode?.id ?? null}
              onNodeClick={(node) => selectNode?.(node)}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create barrel export**

```typescript
// src/domains/Portal0/index.ts
export { Portal0 } from './Portal0';
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Possible errors from prop mismatches with BimbaMap2D/3D — fix by checking their actual props and adjusting. The KairosPanel may need to guard against missing `kairos` field on `PortalClockState` — add `kairos?: KairosState` to the type if not present.

- [ ] **Step 5: Commit**

```bash
git add src/domains/Portal0/Portal0.tsx src/domains/Portal0/KairosPanel.tsx src/domains/Portal0/index.ts
git commit -m "feat(portal0): add Portal0 with clock, Kairos panel, and Bimba graph"
```

---

## Task 12: Rewrite Shell Layout

**Files:**
- Modify: `src/shell/Shell.tsx`

- [ ] **Step 1: Replace Shell with dual-portal layout**

```typescript
// src/shell/Shell.tsx
import { useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Portal0 } from '@/domains/Portal0';
import { Portal1 } from '@/domains/Portal1';
import { OmniPanel } from '@/components/OmniPanel';
import { CommandPalette } from '@/components/CommandPalette';
import { useUiStore } from '@/stores/uiStore';
import { useClockStore } from '@/stores/clockStore';
import { useTemporalStore } from '@/stores/temporalStore';
import { useGraphStore } from '@/stores/graphStore';
import { useGatewayStore } from '@/stores/gatewayStore';
import { useIdentityStore } from '@/stores/identityStore';

export function Shell() {
  const {
    omniPanelOpen,
    commandPaletteOpen,
    toggleOmniPanel,
    setCommandPaletteOpen,
    toggleDimension,
    setBranchLens,
    setPortal1Tab,
  } = useUiStore();

  useEffect(() => {
    useClockStore.getState().fetch();
    useTemporalStore.getState().fetch();
    useGraphStore.getState().connect();
    useGatewayStore.getState().checkConnection();
    useIdentityStore.getState().fetchProfile();
    useIdentityStore.getState().fetchWoundStatus();
    useIdentityStore.getState().fetchElemental();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else {
          toggleOmniPanel();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        toggleDimension();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        setBranchLens(parseInt(e.key) - 1);
        return;
      }

      if (e.key === 'i' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable)) {
        setPortal1Tab('identity');
      }
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable)) {
        setPortal1Tab('flow');
      }
    },
    [commandPaletteOpen, setCommandPaletteOpen, toggleOmniPanel, toggleDimension, setBranchLens, setPortal1Tab],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0e1a', color: '#e2e8f0' }}>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={30} minSize={20} maxSize={45}>
          <Portal0 />
        </Panel>
        <PanelResizeHandle
          style={{ width: 4, background: '#1e293b', cursor: 'col-resize' }}
        />
        <Panel defaultSize={70} minSize={40}>
          <Portal1 />
        </Panel>
      </PanelGroup>

      {omniPanelOpen && <OmniPanel />}
      {commandPaletteOpen && <CommandPalette />}
    </div>
  );
}
```

- [ ] **Step 2: Update CommandPalette to use portal1Tab instead of workspace**

In `src/components/CommandPalette.tsx`, find any references to `setWorkspace('M0')` / `setWorkspace('M4')` / `setWorkspace('M5')` and replace with:

```typescript
// Old: setWorkspace('M0')  → Not needed, graph is always visible in Portal0
// Old: setWorkspace('M4')  → setPortal1Tab('flow')
// Old: setWorkspace('M5')  → setPortal1Tab('inbox')
```

Import `setPortal1Tab` from `useUiStore` instead of `setWorkspace`.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors. If old components (`WorkspacePanel`, `NaraDashboard`) reference removed store fields, those files are now dead code — delete or ignore.

- [ ] **Step 4: Delete replaced files**

```bash
rm src/domains/WorkspacePanel.tsx
rm src/domains/M4_Nara/NaraDashboard.tsx
rm src/domains/M4_Nara/NaraEditor.tsx
rm src/domains/M4_Nara/FlowTimeline.tsx
```

- [ ] **Step 5: Run TypeScript check again**

Run: `npx tsc --noEmit`
Expected: Zero errors. Fix any remaining import references to deleted files.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(shell): rewrite Shell as dual-portal layout with Portal0/Portal1"
```

---

## Task 13: Update OmniPanel for Identity Context

**Files:**
- Modify: `src/components/OmniPanel.tsx`

- [ ] **Step 1: Add identity summary to OmniPanel's Overview tab**

In the `OverviewContent` component inside `OmniPanel.tsx`, add an identity section after the existing status sections:

```typescript
// Add import at top
import { useIdentityStore } from '@/stores/identityStore';

// Inside OverviewContent, after existing status cards:
const { woundStatus, elemental } = useIdentityStore();

// Add this JSX block after existing content:
<div style={{ marginTop: 16 }}>
  <div style={{ color: '#a78bfa', fontSize: 11, marginBottom: 8 }}>Identity</div>
  <div style={{ color: '#e2e8f0', fontSize: 12 }}>
    Quintessence: {woundStatus?.quintessence_preview || 'Not wound'}
  </div>
  <div style={{ color: '#9ca3af', fontSize: 11 }}>
    {woundStatus?.layer_count ?? 0}/5 layers ·{' '}
    {woundStatus?.wound ? 'Wound' : 'Unwound'}
  </div>
  {elemental && (
    <div style={{ color: '#6b7280', fontSize: 10, marginTop: 4 }}>
      F:{(elemental.fire * 100).toFixed(0)} W:{(elemental.water * 100).toFixed(0)}{' '}
      E:{(elemental.earth * 100).toFixed(0)} A:{(elemental.air * 100).toFixed(0)}
    </div>
  )}
</div>
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/OmniPanel.tsx
git commit -m "feat(omni): add identity summary to OmniPanel overview"
```

---

## Task 14: Wire naraClient.sendoff to Highlight Flow

**Files:**
- Modify: `src/services/naraClient.ts`

- [ ] **Step 1: Update sendoff to pull session context from stores**

```typescript
// src/services/naraClient.ts
import { vaultClient } from './vaultClient';
import { clockClient } from './clockClient';
import type { FlowHighlight, InvocationEnvelope, AgentRunHandle } from './types';
import { invoke } from './invoke';
import { temporalClient } from './temporalClient';

export const naraClient = {
  getTodayJournal: vaultClient.getTodayNote,
  getDailyNote: vaultClient.getDailyNote,
  saveFlow: vaultClient.saveFlow,
  getFlow: vaultClient.getFlow,

  sendoff: async (
    highlight: FlowHighlight,
    modality: string,
    sessionKey: string,
  ): Promise<AgentRunHandle> => {
    const runtime = await temporalClient.getRuntime();
    const envelope: InvocationEnvelope = {
      kind: 'nara_highlight',
      modality,
      session_key: sessionKey,
      payload: {
        text: highlight.text,
        category: highlight.category,
        from: highlight.from,
        to: highlight.to,
        timestamp: highlight.timestamp,
      },
      day_now: runtime,
      coordinate: "M4-4'",
    };
    return invoke<AgentRunHandle>('agent_invoke', { envelope });
  },

  sendHighlight: async (
    text: string,
    category: string,
    from: number,
    to: number,
  ): Promise<AgentRunHandle> => {
    const runtime = await temporalClient.getRuntime();
    const highlight: FlowHighlight = {
      id: `hl-${Date.now()}`,
      category,
      from,
      to,
      text,
      timestamp: Date.now(),
    };
    return naraClient.sendoff(highlight, category, '');
  },

  oracleCast: (kind: 'tarot' | 'iching' | 'dream', context?: unknown) =>
    invoke<unknown>('nara_oracle_cast', { kind, context }),

  getClockState: clockClient.getState,
};
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/naraClient.ts
git commit -m "feat(nara): add sendHighlight method for direct highlight-to-agent dispatch"
```

---

## Task 15: Full Compilation Verification

**Files:** None (verification only)

- [ ] **Step 1: Run Rust check**

Run: `cd src-tauri && cargo check`
Expected: Clean compilation, zero errors.

- [ ] **Step 2: Run Rust tests**

Run: `cd src-tauri && cargo test`
Expected: All tests pass (41+ tests).

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 4: Start dev server to verify app loads**

Run: `cargo tauri dev`
Expected: App window opens. Portal0 shows clock + Kairos + graph. Portal1 shows identity tab with layer cards. Switching to Flow tab shows editor. Text selection in editor shows category picker.

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: fix compilation issues from dual-portal rewrite"
```

---

## Summary of Changes

| Area | Before | After |
|------|--------|-------|
| **Layout** | Two panels (ClockCosmos + WorkspacePanel) | Two portals (Portal0: cosmic/temporal + Portal1: personal/agentic) |
| **Identity** | Nothing | 5-layer NaraIdentityMatrix, quintessence badge, elemental bars, layer cards |
| **Flow Editor** | TipTap with toolbar, no highlighting | TipTap with text selection → category picker → FlowHighlight creation → envelope dispatch |
| **Highlights** | Hardcoded 8 categories, no backend | Backend-fed categories from HighlightRegistry, real Highlight objects with provenance |
| **Graph** | Hidden in M0 workspace tab | Always visible in Portal0 below the clock |
| **Kairos** | Not shown | Planet positions, planetary hour, dominant element |
| **Rust Commands** | No identity/highlight commands | 5 identity commands + 3 highlight commands |
| **Stores** | No identity or highlight state | identityStore + highlightStore |
| **Navigation** | M0/M4/M5 workspace switching | Portal1 tabs: identity/flow/inbox/agents |
