---
name: klein-mode
description: "Klein bottle topology: Day + Night' pass as a single surface. The execution reviews itself. Refinement telemetry output."
port_type: fresh-design
skill_class: vak
ct: CT5
cp: "4.5"
agent_affinity: sophia
---

# Klein Mode -- Day + Night' Self-Review

Klein mode runs a Day pass (forward synthesis) and a Night' pass (analytical inversion) as a single topological surface. The Night' pass does not review some external target -- it reviews the Day pass that just ran. The execution becomes the review target. The inside becomes the outside.

This is the Klein bottle: the map reviews the territory that IS the map.

## What It Does

1. **Day pass (forward, P0 -> P5):** Execute the work -- skill invocations, tool calls, agent routing, whatever the task requires. This is normal synthesis.

2. **Night' pass (inversion, P5' -> P0'):** Immediately after, run VAK analysis on that same Day execution. The Night' pass receives the full execution trace as its input and evaluates it:
   - Which skills fired and how effectively
   - Which tools were selected and whether better options existed
   - What execution patterns emerged (repeated routing, bottlenecks, dead ends)
   - Where the agent coordination worked and where it didn't

The two passes form a single Klein surface: the work and the review of the work are one run.

## When to Use

- After any significant orchestration run where you want the system to learn from its own execution
- When tuning skill selection or tool routing based on live results rather than static configuration
- When a full Day pass has completed and refinement data is needed before the next cycle

## Output: Refinement Telemetry

Klein mode produces structured refinement data, not abstract observations:

```json
{
  "mode": "klein",
  "timestamp": "2026-03-08T10:30:00Z",
  "day_pass": {
    "skills_invoked": ["coordinate-lookup", "graph-query", "vault-write"],
    "tools_used": ["neo4j-client", "obsidian-api", "redis-cache"],
    "agent_routing": ["nous -> logos -> sophia"],
    "duration_ms": 4200
  },
  "night_pass": {
    "skill_effectiveness": {
      "coordinate-lookup": { "rating": "effective", "notes": "fast resolution, no fallback needed" },
      "graph-query": { "rating": "suboptimal", "notes": "3 retries due to missing index, suggest schema review" },
      "vault-write": { "rating": "effective", "notes": null }
    },
    "tool_adjustments": [
      { "tool": "neo4j-client", "suggestion": "add index on coordinate_id for faster traversal" }
    ],
    "pattern_observations": [
      "nous -> logos routing added unnecessary definition step for a known coordinate",
      "sophia should have been routed directly for CF(5/0) synthesis tasks"
    ],
    "execution_antipatterns": [],
    "suggested_refinements": [
      { "target": "agent-routing", "change": "bypass logos for coordinates already in overlay cache" },
      { "target": "skill/graph-query", "change": "pre-check index existence before multi-hop traversal" }
    ]
  }
}
```

## Telemetry Fields

| Field | Type | Description |
|-------|------|-------------|
| `mode` | string | Always `"klein"` |
| `timestamp` | ISO8601 | When the Klein pass completed |
| `day_pass.skills_invoked` | string[] | Skills that fired during the forward pass |
| `day_pass.tools_used` | string[] | Tools called during execution |
| `day_pass.agent_routing` | string[] | Agent dispatch chain |
| `day_pass.duration_ms` | integer | Wall time for the forward pass |
| `night_pass.skill_effectiveness` | object | Per-skill VAK assessment |
| `night_pass.tool_adjustments` | object[] | Suggested tool configuration changes |
| `night_pass.pattern_observations` | string[] | Emergent patterns noticed in the execution |
| `night_pass.execution_antipatterns` | string[] | Things that went wrong or were wasteful |
| `night_pass.suggested_refinements` | object[] | Actionable changes for skills, tools, or routing |

## How It Feeds Back

The refinement telemetry is not decorative. It feeds into concrete improvement:

- **Skill refinement:** If a skill consistently rates `"suboptimal"`, its parameters or invocation conditions should be adjusted.
- **Tool tuning:** Tool adjustment suggestions can be applied to configuration or flagged for the next development cycle.
- **Routing optimization:** Pattern observations about agent dispatch inform routing table updates.
- **Antipattern elimination:** Repeated antipatterns across multiple Klein passes signal architectural issues.

## Why Sophia

Sophia operates at CF (5/0) -- the Mobius return where synthesis meets ground. The Klein mode is precisely this: the completed execution (5, integration) folds back to become input (0, ground) for its own review. Sophia holds both sides of this surface naturally.

## Constraints

- Klein mode is analytical -- it does not modify system state during the review pass
- One inversion level only (the Night' reviews the Day, not itself reviewing itself)
- The Day pass must complete before the Night' pass begins -- they are sequential within the single surface
- Output is always structured telemetry, not narrative
