---
coordinate: "S0'Cx"
name: "S0' - C-Level Category Manifestations"
type: "category-mapping"
parent: "S0'"
---

# S0'Cx: C-Level Manifestations at Terminal API Layer

> **What this is**: How each C-level (C0-C5) manifests when expressed through the S0' Terminal API - the CLI command execution and Pydantic type enforcement layer

---

## S0.Y' (QL Paradigm) — C# Categories as Pydantic Models

| Y' | Category | QL | Pydantic Manifestation |
|----|----------|-----|------------------------|
| **S0.0'** | C0: Bimba | #0 | `QLCoordinate` (6-coordinate type system: C, P, M, S, T, L) |
| **S0.1'** | C1: Form | #1 | `QLBaseModel` (base model with coordinate embedding) |
| **S0.2'** | C2: Entity | #2 | Field types with `posx_{semantic}` pattern (e.g., `p0_grounds: list[str]`) |
| **S0.3'** | C3: Process | #3 | `ContextFrame` (coordinate-aware context container) |
| **S0.4'** | C4: Type | #4 | Enum types (`CategoryLevel`, `QLPosition`, `Subsystem`, `StackLayer`, `ThoughtType`, `LensMode`) |
| **S0.5'** | C5: Pratibimba | #5 | Instance tracking (`instance_id`, `created_at`, `bimba_state`) |

---

## Pydantic Model Architecture

```
epi-foundation/lib/models/
├── __init__.py                     # Export all models
├── coordinate_types.py              # C0: QLCoordinate, individual coordinate types
├── base_model.py                    # C1: QLBaseModel with coordinate embedding
├── field_types.py                   # C2: Positional field type definitions
├── context_frame.py                 # C3: ContextFrame for coordinate-aware contexts
├── enum_types.py                    # C4: All coordinate enumerations
└── instance_tracking.py             # C5: Instance metadata and state tracking
```

---

## Key Concepts

### Holographic Data Model

**All data is 6-coordinate holographic** at the type level:

```python
class HolographicUnit(QLBaseModel):
    # C0: Category - Core Identity
    uuid: str
    node_id: str | None
    level: CategoryLevel
    paradigm: str
    bimba_state: int  # 0-63 (2^6 possible states)

    # C1: Form - Functional Semantics (Position)
    p0_grounds: list[str] = []
    p1_title: str
    p2_operations: list[str] = []
    p3_patterns: list[str] = []
    p4_temporals: list[str] = []
    p5_integrations: list[str] = []

    # C2: Entity - Consciousness Domain
    m_primary: Subsystem | None = None
    m_secondary: Subsystem | None = None
    m_mode: str | None = None

    # C3: Process - Technology References
    s0_source: str | None = None
    s1_file_path: str | None = None
    s2_graph_id: str | None = None
    s3_pack: str | None = None
    s4_session: str | None = None
    s5_notion_id: str | None = None

    # C4: Type - Artifact Type
    t_type: ThoughtType
    t_mode: str
    t_folder: str

    # C5: Pratibimba - Epistemic Mode
    l_active: list[LensMode]
    l_mode: str
    l_focus: str | None = None
```

### Coordinate Type System

**6 independent coordinates** each with their own type:

```python
# C: Category (Core Identity)
class CategoryLevel(Enum):
    C0_ATOMIC = "C0"
    C1_PRESENCE = "C1"
    C2_SUBAGENTS = "C2"
    C3_SYSTEM = "C3"
    C4_SUBSYSTEMS = "C4"
    C5_SELF = "C5"

# P: Position (Functional Semantics)
class QLPosition(Enum):
    P0_GROUND = "#0"
    P1_DEFINITION = "#1"
    P2_OPERATION = "#2"
    P3_PATTERN = "#3"
    P4_CONTEXT = "#4"
    P5_INTEGRATION = "#5"

# M: Subsystem (Consciousness Domain)
class Subsystem(Enum):
    M0_ANUTTARA = "M0"  # Ground/Presence
    M1_PARAMASIVA = "M1"  # Definition/Form
    M2_PARASHAKTI = "M2"  # Operation/Process
    M3_MAHAMAYA = "M3"  # Pattern/Symbol
    M4_NARA = "M4"  # Context/Embodiment
    M5_EPII = "M5"  # Integration/Synthesis

# S: Stack (Technology References)
class StackLayer(Enum):
    S0_TERMINAL = "S0"
    S1_OBSIDIAN = "S1"
    S2_NEO4J = "S2"
    S3_PAI = "S3"
    S4_CLAUDE = "S4"
    S5_NOTION = "S5"

# T: Thought (Artifact Type)
class ThoughtType(Enum):
    T0_SEED = "T0"
    T1_SPEC = "T1"
    T2_FORM = "T2"
    T3_PROCESS = "T3"
    T4_PATTERN = "T4"
    T5_INSIGHT = "T5"

# L: Lens (Epistemic Mode)
class LensMode(Enum):
    L0_LITERAL = "L0"
    L1_FUNCTIONAL = "L1"
    L2_STRUCTURAL = "L2"
    L3_ARCHETYPAL = "L3"
    L4_PARADIGMATIC = "L4"
    L5_INTEGRAL = "L5"
```

### ContextFrame Pattern

**C3 Process** manifests as coordinate-aware context container:

```python
class ContextFrame(QLBaseModel):
    """Coordinate-aware context for operations"""
    frame_id: str
    coordinates: QLCoordinate
    context_type: str  # "session", "task", "entry", "operation"
    parent_frame: str | None = None
    child_frames: list[str] = []
    metadata: dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
```

---

## C-Level Details

### C0: Bimba (Canonical Source)

**S0.0' Manifestation**: `QLCoordinate` type system

- Encodes all 6 coordinates as typed values
- Provides `bimba_state` integer (0-63) for 2^6 holographic encoding
- `validate_coordinate()` ensures coordinate consistency
- The type-level reference for all coordinate operations

### C1: Form (The Thing Itself)

**S0.1' Manifestation**: `QLBaseModel` with coordinate embedding

- Base class for all Pydantic models in the system
- Automatically includes coordinate metadata
- `model_dump_json()` produces coordinate-aware JSON
- Forms are type definitions that can be instantiated

### C2: Entity (The Atomic Unit)

**S0.2' Manifestation**: Positional field types with `posx_{semantic}` pattern

- `p0_grounds: list[str]` - Ground references
- `p1_title: str` - Definition/name
- `p2_operations: list[str]` - Operation methods
- `p3_patterns: list[str]` - Pattern references
- `p4_temporals: list[str]` - Temporal references
- `p5_integrations: list[str]` - Integration references

### C3: Process (The Flow / Transformation)

**S0.3' Manifestation**: `ContextFrame` for coordinate-aware contexts

- Session context frames (Claude session)
- Task context frames (Task operation)
- Entry context frames (Daily entry)
- Operation context frames (Individual operation)

### C4: Type (The Formal Pattern)

**S0.4' Manifestation**: Enum types for each coordinate

- `CategoryLevel` (C0-C5)
- `QLPosition` (#0-#5)
- `Subsystem` (M0-M5)
- `StackLayer` (S0-S5)
- `ThoughtType` (T0-T5)
- `LensMode` (L0-L5)

### C5: Pratibimba (The Instance / Reflection)

**S0.5' Manifestation**: Instance tracking metadata

- `instance_id: str` - Unique instance identifier
- `created_at: datetime` - Instance creation time
- `bimba_state: int` - Holographic state encoding (0-63)
- Tracks the instance vs canonical distinction

---

## Terminal API Operations

**S0' API provides CLI command execution** with type enforcement:

```python
# Coordinate validation
def validate_coordinate(coord: QLCoordinate) -> bool:
    """Validate 6-coordinate consistency"""

# Type checking
def get_coordinate_type(coord: QLCoordinate, position: str) -> type:
    """Get expected type for coordinate position"""

# Instance tracking
def track_instance(unit: HolographicUnit) -> str:
    """Generate and track instance_id"""
```

---

## Möbius Return: C5 → C0

```
Today's C5 (Pratibimba instance state)
    ↓
Encoded as bimba_state integer (0-63)
    ↓
Becomes Tomorrow's C0 (QLCoordinate type ground)
    ↓
Which seeds Tomorrow's C1 (Form instantiation)
```

---

*This file defines how each C-level manifests through the S0' Terminal API*
*See S0-X' seeds for detailed CT × CT' mappings*
