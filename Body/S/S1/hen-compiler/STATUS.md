# STATUS - hen-compiler

## Compatibility Status
`Body/S/S1/hen-compiler/` is compatibility/probe material for Claude memory tooling. It remains in the tree for legacy local knowledge-base workflows, but it is not the canonical [[S1]] / [[Hen]] compiler authority.

## Canonical Authority
Authoritative [[S1]] Hen compiler law lives in `Body/S/S1/hen-compiler-core/` and the owning canon: [[S1-SPEC]] and [[S1-ARCHITECTURE]].

Reusable compiler, residency, ledger, frontmatter, wikilink, graph-promotion, and agent-invocation logic must land in the Rust `hen-compiler-core` modules, not in this Python directory.

## Allowed Use
- Run or test the existing Python compatibility/probe scripts when maintaining legacy Claude memory workflows.
- Keep existing fixtures, logs, knowledge output, and compatibility tests understandable.
- Use existing Python behavior as migration evidence when porting reusable logic to `hen-compiler-core`.

## Do Not Add
- Do not add new Python code to the canonical [[S1]] pipeline here.
- Do not make Rust, gateway, or [[M']] consumers depend on this directory.
- Do not treat `scripts/compile.py`, `scripts/query.py`, `scripts/flush.py`, or `scripts/lint.py` as canonical Hen implementation surfaces.

This declaration implements [[S1-ARCHITECTURE]] section 5.10: no deletion, no rebuild, only an explicit compatibility-only boundary.
