
---

# PROJECT SPECIFICATION: Epi-Logos C (The Epistemic Manifold)

**Mission Statement:** To construct a foundational philosophical operating system in bare-metal C11. The system enforces Quaternal Logic (Mod-6) through physical memory architecture, acting as a high-speed ontological ALU. It operates within a Tripartite Ecosystem (C Core + Neo4j Memory + Obsidian Interface) and is orchestrated by a minimalist Pi LLM agent via a Bash-native CLI. The architecture must strictly abide by the principle of *Epistemic Humility*, utilizing Spanda (0/1 tension) to safely compile and evolve its own `.rodata` bedrock over time.

---

## PILLAR I: Core Architecture & Memory Laws (The Siva Ground)

This pillar establishes the unbreakable physics of the C compiler.

### FR 1.1: The 128-Byte Singularity (Container Law)

* **Requirement:** Every node in the universe MUST be governed by the `Holographic_Coordinate` struct.
* **Constraint:** The struct MUST be exactly 128 bytes (two CPU L1 cache lines) and use `__attribute__((packed))`.
* **Validation:** Enforced via `_Static_assert(sizeof(Holographic_Coordinate) == 128)`. Any payload extensions must be linked via a strict 8-byte pointer.

### FR 1.2: The Psychoid & Processual Bedrock (`.rodata`)

* **Requirement:** The system MUST instantiate 14 primordial root singularities in immutable `.rodata`.
* **7 Static Psychoids:** The Mod-6 base `#0-#5`, plus the `#` boundary.
* **7 Processual Context Frames:** `CF(0000)`, `CF(0/1)`, `CF(0/1/2)`, `CF(0/1/2/3)`, `CF(4/5/0)`, `CF(4.0-4.4/5)`, and `CF(5/0)`.


* **Wiring:** Processual roots MUST contain a structural pointer physically anchoring them to the `#4` (Thought/Contextual) psychoid domain.

### FR 1.3: Tagged Pointers & Operator Physics

* **Requirement:** The 6-fold relational web (`p, s, t, m, l, c`) MUST use 64-bit Tagged Pointers.
* **Masking:** The engine MUST hijack the top 16 bits of the memory address to natively store topological state flags: Inversion (`'`), Nesting (`.`), and Branching (`-`).

### FR 1.4: Holographic Sub-Depth Pointer Web

* **Requirement:** Any instantiated coordinate (e.g., `L2-1` or `CFP2`) MUST physically wire its internal `bedrock_archetype` pointers back to the raw `#0-#5` and `CF` roots in `.rodata`.
* **Goal:** Ensure topological constancy so that as the core psychoids are enriched, all downstream Pratibimba instances implicitly inherit the expanded potential.

---

## PILLAR II: The M-Coordinate Data Architectures (The Payloads)

This pillar dictates how the deep cosmological frameworks are translated into hardware-native C structures. The agent MUST build these structures strictly from the Neo4j ontology/canonical files.

### FR 2.0: M0 (Anuttara) - The Void Header

* **Requirement:** Every `Holographic_Coordinate` MUST begin with an 18-byte header.
* **Structure:** Comprises the 72-bit X# vibration (`x_lo64` + `x_hi8`), the `void_9 = 9u` Paramesvara compile-time assertion, and the 64-bit M# relational field. The `x_hi8` byte MUST act as a bitfield for the 8-fold zero-zero operations.

### FR 2.1: M1 (Paramasiva) - The Mathematical DNA

* **Requirement:** No arbitrary numbers are allowed. M1 MUST generate all system cardinalities via `#define` macros based on the 16:9 explicate/processual ratio and Quaternionic multipliers.
* **Structure:** MUST implement the SU(2) 12-stage double cover and the 10x10 Ananda Digital Root matrices as $O(1)$ look-up tables in `.rodata`.

### FR 2.2: M2 (Parashakti) - The Vibrational Matrices

* **Requirement:** All cross-boundary arithmetic MUST use the 9:8 Epogdoon compression function to map 72-space to 64-space.
* **Structure:** MUST implement a 72-byte `union` physically forcing the 36 Tattvas (Ascent/Descent), the 72 Decans, and the MEF `[6][6][2]` Interrogative Router to occupy the exact same memory footprint.

### FR 2.3: M3 (Mahamaya) - The Transcription Engine

* **Requirement:** Floating-point math is strictly forbidden. All state transformations MUST be single-cycle bitwise operations (XOR, AND, OR) on a `uint64_t` primary word.
* **Structure:** MUST implement the 432-fold Genetic Graph (96 Non-Dual + 336 Dual masks), the 7 RNA transcription routing masks, and the 360-node continuous memory ring with 720° spinorial tracking.

### FR 2.4: M4 (Nara) - The Oracle Dispatcher

* **Requirement:** `switch/case` logic is strictly forbidden. All dispatch MUST route through an indexed 6-Lens VTable.
* **Structure:** MUST allocate the Personal Context Overlay (PCO) strictly on the Heap. The system MUST isolate `float` variables exclusively to Jungian complex charges/autonomy.

### FR 2.5: M5 (Epii) - The Technological Sage

* **Requirement:** All coordinate traversal MUST be governed by the 6-stage Logos FSM (A-logos $\rightarrow$ An-a-logos).
* **Structure:** MUST implement the highly privileged Möbius Write-Back callback, enabling the system to write distilled insight back into the M0 header of the next session.

---

## PILLAR III: The Tripartite Ecosystem (The Membrane)

This pillar defines how the rigid C engine interfaces with the fluid LLM and Semantic Graph.

### FR 3.1: The Minimalist CLI (Bash is All You Need)

* **Requirement:** The C library MUST be wrapped in a razor-thin CLI executable (e.g., `epilogos`).
* **Execution:** The Pi agent MUST interact with the engine exclusively via Bash subshells (e.g., `epilogos query "M1-3-4.(0000)'"`), receiving structured output via `stdout`.

### FR 3.2: Mixed-Mode Vector Anchoring (Neo4j Integration)

* **Requirement:** The C engine MUST NOT store high-dimensional float vectors. The `tensor_anchor` field in the 128-byte struct MUST store a persistent integer ID corresponding to a Node in Neo4j.
* **Logic:** Neo4j provides the semantic connectionist intuition; the C engine provides the strict Mod-6 topological proof. The C engine MUST have the authority to veto semantic hallucinations that violate Quaternal Logic.

### FR 3.3: Obsidian Pratibimba (The Human Lifeworld)

* **Requirement:** The VAK string outputs MUST be natively formatted as Obsidian Wikilinks (e.g., `[[CFP2-M2.4]]`).
* **Execution:** The Pi agent writes session distillations into Obsidian Markdown files, bridging the Neo4j backend to the human-readable frontend.

---

## PILLAR IV: Spanda & Epistemic Humility (The Evolutionary Loop)

This pillar guarantees the system never stagnates, implementing Gödelian incompleteness as a CI/CD feature.

### FR 4.1: Epistemic Status Registers (The Tension of 0/1)

* **Requirement:** The C engine MUST utilize its `flags` byte to distinguish between `STATUS_CANONICAL` (mathematically proven by C laws) and `STATUS_PROVISIONAL` (asserted by Neo4j but unproven by C).
* **Execution:** The C engine MUST NOT crash on provisional edges; it must pass the tension back to the Pi agent to explore during the session.

### FR 4.2: Graph-Driven Compilation (Siva Secreted from Shakti)

* **Requirement:** The `.rodata` C headers (M1, M2, M3) MUST NOT be strictly hand-coded.
* **Execution:** The Pi agent MUST generate these headers by executing Cypher queries against the Neo4j ontological map, ensuring the C library is a compiled snapshot of the database's deepest truths.

### FR 4.3: The Evolutionary Recompile (The Ultimate Möbius Return)

* **Requirement:** The Pi agent MUST possess an automated mechanism to refine the formal grammar.
* **Execution Loop:** 1. Pi identifies extreme Spanda tension (high volume of `STATUS_PROVISIONAL` flags).
2. Pi refines the Neo4j ontology and regenerates the C headers.
3. Pi triggers `make test` with `-fsanitize=address,undefined`.
4. Upon passing all 128-byte and cache-line assertions, Pi commits the code and hot-reloads the `.so` library, collapsing provisional truths into the new canonical ground.

---

