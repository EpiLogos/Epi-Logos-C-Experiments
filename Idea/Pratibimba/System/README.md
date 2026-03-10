# Pratibimba System

This directory contains the repo-local Pratibimba runtime surfaces that were migrated from the legacy vault.

- `bimba-mcp/` contains the MCP server source for the Pratibimba stack in this repo.
- `epi-app/` contains the Electron application source and launcher bundle for this repo.

Copy policy for this tree:

- Do not copy legacy `node_modules`, `dist`, `coverage`, `test-results`, or legacy test suites into this repo.
- Install dependencies fresh inside each package when working in this checkout.
- Keep runtime path resolution repo-local or environment-driven. Do not reintroduce hard-coded legacy absolute paths.
