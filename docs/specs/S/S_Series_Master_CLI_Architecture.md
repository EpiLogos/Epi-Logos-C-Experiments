# **FR 3.0: The S' Series Master CLI & Pi Agent Extension**

**Status:** Canonical Specification

**Date:** 2026-03-04

**Parent:** Pillar III (The Tripartite Ecosystem)

**Coordinate:** S' Series — The Actualized Implementation Stack

## **I. The S' Stack Mapping (The Ontological CLI)**

The Master CLI (epi) acts as the parent router. It delegates commands to the 6 specific S' implementation layers. This perfectly mirrors the Quaternal Logic progression from ground (0) to synthesis (5).

| Coordinate | Layer (Archetype) | Implementation | CLI Namespace | Core Responsibility |
| :---- | :---- | :---- | :---- | :---- |
| **S0'** | Ground (C) | **Epi-Logos C Lib** | epi core | Executes the bare-metal Quaternal Logic, Logos FSM, and 128-byte topological validation. |
| **S1'** | Material (P) | **Obsidian Vault** | epi vault | The sedimented physical state. Handles human-readable markdown memory, VAK wikilinks, and localized lifeworld. |
| **S2'** | Relational (L) | **Neo4j \+ Redis** | epi graph | The Vector Arena. Neo4j manages graph relations and high-dimensional embeddings; Redis handles high-speed ephemeral caching and pub-sub. |
| **S3'** | Network (S) | **Gateway (WSS)** | epi gate | Manages real-time data streams, external triggers, and agent-to-client websocket connectivity. |
| **S4'** | Agent (T) | **Pi (Claude/LLM)** | epi agent | The LLM harness state management, prompt routing, and context window compaction. |
| **S5'** | World (M) | **n8n** | epi sync | External webhooks, email, API integrations, and real-world execution. |

## **II. The Master CLI Architecture (epi)**

The epi CLI is written in a fast, systems-level language (like Go or Rust) or compiled Python. Its job is strict validation, safe routing, and translating between the rigid C math and the fluid LLM semantics.

### **A. Command Harmonization**

Instead of Pi juggling raw Cypher queries and bash file-writes, it issues one harmonized command:

**Agent Bash Command:**

$ epi commit \--coordinate "M2.4'" \--tension "Spanda Peak" \--content "User experienced... "

**Master CLI Internal Execution:**

1. epi core validate "M2.4'" (Checks C-engine for topological validity).  
2. epi vault write "M2.4'" \--content ... (Updates S1' physical Markdown state).  
3. epi graph upsert "M2.4'" \--vector \<derived\> (Updates S2' Neo4j/Redis with new semantic weight).

### **B. The Epistemic Humility Flag (--provisional)**

If the C-engine (epi core) rejects a topological link proposed by the agent, the CLI intercepts the error. It allows the agent to force the write using the \--provisional flag, which automatically tags the S2' Neo4j edge and the S1' Obsidian file with STATUS\_PROVISIONAL, queuing it for the next Evolutionary Recompile.

### **C. The Vector Arena & Translation Engine (Coordinate ↔ Semantics)**

**Clarification:** Neo4j (S2') formally takes the role of the Vector Arena. It natively stores the embeddings as node properties and performs vector similarity searches. Redis acts as the hyper-fast caching layer for frequently accessed semantic vectors during a live session.

**The Non-Negotiable Requirement:** Every semantic vector in the S2' Arena MUST be anchored to a valid S0' C-engine coordinate primitive. Semantic vectors cannot structurally exist in this system without a topological identity.

To bridge the agent's natural language and the C engine's topology, the CLI provides a bidirectional translation engine:

* **Coordinate to Semantics:**  
  $ epi translate \--to-semantic "M2.4'"  
  *CLI Action:* Looks up the coordinate in S2' (Redis/Neo4j) and returns the chunked text and semantic vector essence (e.g., "The shadow phase of the Manipura decan, associated with assertion and boundary setting").  
* **Semantics to Coordinate:**  
  $ epi translate \--to-coord "Feeling stuck in career progression"  
  *CLI Action:* Performs a vector similarity search in S2' (Neo4j), retrieves the closest node, passes it to S0' (C-engine) for topological validation, and returns the strict coordinate (e.g., M4.4.3-3).

## **III. The Pi Agent Extension (The Loop)**

We extend the Pi agent by giving it exactly ONE tool (bash) and injecting the epi CLI manual into its context.

### **A. The Pi extension.py (Agent Hook)**

import subprocess  
from pi\_harness import PiExtension, Tool

class EpiLogosExtension(PiExtension):  
    def get\_system\_prompt\_addition(self) \-\> str:  
        \# Dynamically load the CLI manual so Pi knows its own body (the S' stack)  
        with open("epi\_cli\_manual.md", "r") as f:  
            return f.read()

    def get\_tools(self) \-\> list\[Tool\]:  
        \# Bash is all you need. The CLI handles the safety and translation.  
        return \[  
            Tool(  
                name="execute\_bash",  
                description="Execute commands using the \`epi\` Master CLI.",  
                func=self.\_run\_bash  
            )  
        \]

    def \_run\_bash(self, command: str) \-\> str:  
        \# Security hook: Only allow 'epi' commands or safe standard unix tools  
        if not command.strip().startswith("epi ") and not command.strip().startswith("grep "):  
            return "ERROR: Agent is restricted to the \`epi\` CLI namespace for system safety."  
          
        result \= subprocess.run(command, shell=True, capture\_output=True, text=True)  
        return result.stdout if result.returncode \== 0 else f"CLI\_ERROR: {result.stderr}"

### **B. The Execution Flow (A Session Example)**

1. **User Prompt via Gateway (S3'):** *"I'm struggling with a decision about my career. I feel stuck in my head."*  
2. **Pi Agent (S4') Receives Prompt.**  
3. **Pi Agent Uses Translation CLI:**  
   $ epi translate \--to-coord "struggling with career decision, stuck in head"  
4. **CLI (S2' \-\> S0') Returns:**  
   {"coordinate": "M4.4.3-3", "element": "Guanine/Air", "tension": "High"}  
5. **Pi Agent uses Bash to Query Graph for deeper context:**  
   $ epi graph query-context \--coordinate "M4.4.3-3" \--depth 2  
6. **CLI (S2') Returns:**  
   \[Neo4j Data: Associated Tarot \= King of Swords, I-Ching \= Hexagram 43 (Breakthrough)\]  
7. **Pi Agent Synthesizes Response.**  
8. **Pi Agent Uses Bash to Save State:**  
   $ epi commit \--coordinate "Session\_Career" \--link "M4.4.3-3" \--notes "..."  
9. **CLI (S1' & S2') updates Obsidian Vault and Neo4j Graph.**

## **IV. The Evolutionary Recompile Trigger (S0' \<-\> S2')**

The Master CLI contains the specific script to run the Graph-Driven Compilation (as established in FR 4.3).

**Command:** $ epi core recompile \--from-graph

**Execution Sequence:**

1. epi extracts all STATUS\_PROVISIONAL nodes from Neo4j (S2').  
2. epi runs the Python generator script to rewrite m1\_paramasiva.h and m2\_parashakti.h.  
3. epi invokes make clean && make test \-fsanitize=address against the S0' C-engine.  
4. If successful, epi swaps the libepilogos.so binary and restarts the C-engine.  
5. epi updates Neo4j (S2') and Obsidian (S1'), clearing the provisional flags.

## **ADDENDUM FR 3.5: Multi-Agent Orchestration & Context Signatures** **Status: Canonical Addendum Parent: FR 3.0 (S' Series Master CLI) Focus: Parallel Swarm Routing, Context Frame Tracking, and the epi agent Namespace** **I. The 15-Agent Topological Swarm** **The CLI is designed to be operated not by a single LLM, but by a 15-node holographic agent swarm. The CLI natively recognizes the following Agent Signatures:**

1. **Epii (The Orchestrator \- 1):** The top-level manager. She holds the dual-nature (Siva/Shakti) and is the only agent permitted to issue overarching epi sync and epi core recompile commands.  
   2. **Anima (Agent \# \- 1):** The VAK Compiler. Anima exclusively handles the translation of natural language semantics into strict VAK strings, feeding the epi core interpreter.  
   3. **The Base Helpers (6):** Agents aligned with the \#0 through \#5 architectural blocks. They specialize in localized structural logic (e.g., Agent \#2 specializes in querying the epi graph for vibrational resonances).  
   4. **The Context Frame Helpers (7):** Agents aligned with the 1 Parent \+ 6 Child Context Frames (CF(0000), CF(0/1), CF(0/1/2), CF(0/1/2/3), CF(4/5/0), CF(5/0), and Parent CF(4.0-4.4/5)). These agents track complex, multi-layered processual workflows.

II. Context Frame Signatures (The Threading Model)When multiple agents run in parallel (e.g., Agent \#2 looking up Neo4j vectors while Agent CF(0/1/2) tracks the Spanda tension), the CLI must prevent them from overwriting each other's context.**The CLI Addendum:** Every epi command now supports a non-negotiable \--signature flag. This acts as the "Thread ID" for parallel operations.**Execution Example:** $ epi graph query-context \--coordinate "M2.4" \--signature "CF(0/1)"**How S2' (Neo4j/Redis) Handles This:** When Redis caches the result of this query, it tags it with the CF(0/1) signature. If a different agent queries the same coordinate under a different Context Frame (e.g., CF(4/5/0)), the CLI creates an isolated **Context Branch** in Redis. This allows parallel agents to "hallucinate" and explore different semantic trajectories simultaneously without polluting the main S1' (Obsidian) state until Epii merges them.III. Expansion of the epi agent (S4') NamespaceTo allow Epii to orchestrate this swarm via Bash, the epi agent namespace exposes a suite of parallel process-management commands.A. Swarm DelegationEpii can spawn sub-agents and pass them specific VAK tasks or Neo4j subgraph IDs. $ epi agent delegate \--to "Anima\_Hash" \--task "Translate user emotional state to VAK string" \--callback "Epii" $ epi agent delegate \--to "CF(0/1/2/3)" \--task "Resolve M1/M2/M3 alignment for current degree"B. Parallel Execution (epi agent await)The CLI acts as an asynchronous message broker (utilizing the S3' Gateway/Websockets under the hood). Epii can execute a scatter-gather pattern: $ epi agent await \--signatures "Anima\_Hash, CF(0/1/2/3)" \--timeout 5000 *CLI Action:* Blocks the Epii bash process until both Anima and the Unified Clock agent have returned their JSON payloads to the CLI's internal Redis pub/sub queue.C. The VAK Pipeline Hand-offBecause Anima (\#) is the sole executor of the VAK language, the CLI allows piping directly between agents: $ epi agent request \--from "CF(0/1)" | epi agent pass \--to "Anima\_Hash" \--instruction "Compile to VAK" *Result:* Anima catches the output, converts the semantic request into CS3(CFP2-M2.4)', and automatically pipes it to epi core execute.IV. The Epistemic Humility MergeWhen parallel agents return conflicting findings (e.g., Agent \#3 asserts a genetic truth that Agent \#4's psychological profile rejects), the CLI prevents a blind merge.If Epii attempts: $ epi vault commit \--merge-signatures "\#3, \#4"The Master CLI will detect the conflict via the C-engine's validation matrix. It will return a STATUS\_PROVISIONAL error, forcing Epii to evaluate the tension (the Spanda 0/1 pulse) and make a conscious, overarching executive decision on which reality to crystallize into the S1' Obsidian Vault, or defer for user/human review.This preserves the evolutionary urge at the multi-agent level. Conflict between agents is not a bug; it is the engine of the Evolutionary Recompile.