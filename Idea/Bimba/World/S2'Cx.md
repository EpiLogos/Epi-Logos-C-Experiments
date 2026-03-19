---
coordinate: "S2'Cx"
name: "S2' - C-Level Category Manifestations"
type: "category-mapping"
parent: "S2'"
---

# S2'Cx: C-Level Manifestations at Graph API Layer

> **What this is**: How each C-level (C0-C5) manifests when expressed through the S2' Graph API - the Neo4j graph operations layer

---

## S2.Y' (QL Paradigm) — C# Categories as Graph Operations

| Y' | Category | QL | Neo4j Manifestation |
|----|----------|-----|---------------------|
| **S2.0'** | C0: Bimba | #0 | Coordinate node properties (c_level, c_name) |
| **S2.1'** | C1: Form | #1 | Entity node with labels and positional properties |
| **S2.2'** | C2: Entity | #2 | Typed relationships with coordinate metadata |
| **S2.3'** | C3: Process | #3 | Graph patterns and traversal operations |
| **S2.4'** | C4: Type | #4 | Node labels (Type categories) |
| **S2.5'** | C5: Pratibimba | #5 | Temporal properties and instance tracking |

---

## Graph Architecture

```
Neo4j Graph Structure
├── Nodes (Entities)
│   ├── Labels: Type categories (C4)
│   ├── Properties: Coordinate metadata (C0-C5)
│   └── Identity: uuid, node_id (C0)
│
├── Relationships (Connections)
│   ├── Type: Relationship category (semantic)
│   ├── Properties: Coordinate metadata
│   └── Direction: source → target
│
└── Graph Patterns (Process)
    ├── Coordinate filters
    ├── Position traversals
    └── Temporal queries
```

---

## Key Concepts

### Coordinate Node Properties

**C0 Bimba** manifests as node properties:

```cypher
// Node with coordinate properties
{
  // C0: Category - Core Identity
  uuid: "unique-id",
  c_level: "C3",
  c_name: "System",
  paradigm: "QL",
  bimba_state: 42,

  // Node identity
  node_id: "neo4j-id",
  created_at: datetime(),
  updated_at: datetime()
}
```

### Positional Properties

**C1 Form** manifests as QL position properties:

```cypher
// Position #0: Ground
p_0_grounds: ["ref-1", "ref-2"]

// Position #1: Definition
p_1_title: "Entity Name"

// Position #2: Operation
p_2_operations: ["method-1", "method-2"]

// Position #3: Pattern
p_3_patterns: ["pattern-ref"]

// Position #4: Context
p_4_temporals: ["2026-01-28"]

// Position #5: Integration
p_5_integrations: ["synthesis-ref"]
```

### Typed Relationships

**C2 Entity** manifests as coordinate-typed relationships:

```cypher
// Relationship with coordinate metadata
(:Entity {uuid: "source"})
  [:RELATES_TO {
    m_primary: "M2",
    p_position: "#2",
    relationship_type: "functional"
  }]
(:Entity {uuid: "target"})
```

### Graph Patterns

**C3 Process** manifests as traversal patterns:

```cypher
// Position-based traversal
MATCH path = (start)-[:RELATES_TO {p_position: "#2"}*]->(end)
WHERE start.c_level = "C0"

// Coordinate filter
MATCH (n)
WHERE n.c_level = $c_level
  AND n.m_primary = $m_subsystem
  AND n.p_1_title CONTAINS $search

// Temporal query
MATCH (n)
WHERE n.p_4_temporals CONTAINS "2026-01-28"
```

### Node Labels

**C4 Type** manifests as Neo4j labels:

```cypher
// Primary label by Type
(:Obsidian)
(:ClaudeCode)
(:Concept)
(:Task)
(:Session)

// Secondary labels for hierarchy
(:Obsidian:Tool:Content)
(:Task:Action:Pratibimba)
```

### Temporal Instance Tracking

**C5 Pratibimba** manifests as temporal properties:

```cypher
// Instance tracking
instance_id: "instance-unique-id",
instance_created: datetime(),

// Temporal references
p_4_temporals: ["2026-01-28", "2026-01-27"],

// Activity tracking
last_accessed: datetime(),
access_count: 42
```

---

## Graph API Operations

**S2' API provides graph CRUD operations**:

### Create Operations

```python
def create_node_from_unit(unit: HolographicUnit) -> str:
    """Create Neo4j node from HolographicUnit"""
    # Map coordinates to node properties
    # Set labels based on Type (C4)
    # Return node_id

def create_relationship_from_ql(ql_rel: QLRelationship) -> str:
    """Create relationship from QL relationship"""
    # Source and target nodes
    # Relationship type
    # Coordinate metadata as properties
```

### Read Operations

```python
def read_node_by_id(node_id: str) -> HolographicUnit | None:
    """Read node and convert to HolographicUnit"""

def read_by_coordinates(coords: QLCoordinate) -> list[HolographicUnit]:
    """Query nodes by coordinate filter"""

def read_position_position(start: str, end: str) -> list[HolographicUnit]:
    """Position-based traversal (e.g., #0 → #5)"""
```

### Update Operations

```python
def update_node_from_unit(unit: HolographicUnit) -> bool:
    """Update existing node with unit data"""

def update_coordinates(node_id: str, coords: QLCoordinate) -> bool:
    """Update coordinate properties"""
```

### Delete Operations

```python
def delete_node(node_id: str) -> bool:
    """Delete node by ID"""

def delete_relationship(rel_id: str) -> bool:
    """Delete relationship by ID"""
```

---

## C-Level Details

### C0: Bimba (Canonical Source)

**S2.0' Manifestation**: Coordinate node properties

- `c_level: "C0"-"C5"` - Category level
- `c_name: string` - Category name
- `paradigm: "QL"` - QL paradigm
- `bimba_state: 0-63` - Holographic state encoding

### C1: Form (The Thing Itself)

**S2.1' Manifestation**: Entity node with labels

- `uuid: string` - Unique identifier
- `node_id: string` - Neo4j internal ID
- `p_1_title: string` - Form name
- Labels: Type categorization (C4)

### C2: Entity (The Atomic Unit)

**S2.2' Manifestation**: Typed relationships

- Relationship type: Semantic category
- Properties: Coordinate metadata
- Direction: source → target
- `m_primary` subsystem relationship

### C3: Process (The Flow / Transformation)

**S2.3' Manifestation**: Graph patterns and traversals

- Position-based paths: `#0 → #5`
- Coordinate filters: `{C: "C3", M: "M2"}`
- Temporal queries: `p_4_temporals CONTAINS date`
- Pattern matching: `(a)-[:REL*]->(b)`

### C4: Type (The Formal Pattern)

**S2.4' Manifestation**: Node labels

- Primary label: Type category (e.g., `Obsidian`)
- Secondary labels: Hierarchy (e.g., `Obsidian:Tool:Content`)
- Label-based queries: `MATCH (n:Obsidian)`

### C5: Pratibimba (The Instance / Reflection)

**S2.5' Manifestation**: Temporal properties

- `instance_id: string` - Instance identifier
- `instance_created: datetime` - Creation timestamp
- `p_4_temporals: list[string]` - Temporal references
- `last_accessed: datetime` - Activity tracking

---

## Neo4j Schema

**Indexes for coordinate queries**:

```cypher
// Coordinate indexes
CREATE INDEX ON :Entity(c_level);
CREATE INDEX ON :Entity(m_primary);
CREATE INDEX ON :Entity(p_1_title);
CREATE INDEX ON :Entity(bimba_state);

// Temporal indexes
CREATE INDEX ON :Entity(p_4_temporals);
CREATE INDEX ON :Entity(instance_created);

// Full-text search
CREATE FULLTEXT INDEX entity_search FOR (n:Entity) ON EACH [
  n.p_1_title, n.p_0_grounds, n.p_3_patterns
];
```

---

## Möbius Return: C5 → C0

```
Today's C5 (Pratibimba instance with temporal properties)
    ↓
Graph sync preserves p_4_temporals and instance_id
    ↓
Becomes Tomorrow's C0 (Canonical node with coordinate properties)
    ↓
Which seeds Tomorrow's C1 (New entity nodes with labels)
```

---

*This file defines how each C-level manifests through the S2' Graph API*
*See S2-X' seeds for detailed CT × CT' mappings*
