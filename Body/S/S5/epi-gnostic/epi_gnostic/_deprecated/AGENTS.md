# AGENTS.md — deprecated Graphiti compatibility

## Purpose
Deprecated Python Graphiti HTTP compatibility package retained only for cycle-4 deletion; `epi_gnostic._deprecated.graphiti_service` backs the temporary `epi-graphiti` command.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]] / [[S3-SPEC]]

## Ownership
- `graphiti_service.py` — former Graphiti/FastAPI wrapper, retained for deletion-safe compatibility while `[[NativeLibraryClient]]` in `Body/S/S3/graphiti-runtime` is canonical.
- `__init__.py` — package marker for the explicit deprecation boundary.
- Does NOT own new Graphiti behavior, gateway operations, or S5 authority; native behavior belongs to [[S3]] runtime with [[S5]] invocation governance.

## Local Contracts
- Compatibility import: `epi_gnostic.graphiti_service` forwards here while legacy callers are retired.
- Owning specs: [[S3-SPEC]], [[S5-SPEC]], [[S5-ARCHITECTURE]].

## Work Guidance
- Do not add new behavior here. Delete the package in the cycle-4 sidecar-removal tranche.

## Verification
- `Body/S/S5/epi-gnostic/.venv/bin/python -m pytest Body/S/S5/epi-gnostic/tests/test_graphiti_service.py -q`.

## Child DOX Index
- (leaf)
