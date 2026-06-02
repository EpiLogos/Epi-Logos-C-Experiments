# ADR-05-006 — Optional Docker browser-mode build for CI / headless

**Status:** Decided 2026-06-01
**Decision register:** PRD-04
**Affected tracks:** 05, 09 (CI)
**Depends on:** [ADR-05-004](./adr-05-004-electron-target.md)

## Context

Per canon §2-§3, the browser-app target serves CI / optional Docker headless / future hosted-shared deployment. Eclipse Theia upstream ships the canonical [`theiaide/theia`](https://hub.docker.com/r/theiaide/theia) Docker pattern. T0 must commit a plan; T9 (or a follow-on) wires the build.

## Decision

**Optional Docker browser-mode** is in scope as a CI / headless deployment vehicle. **It is not the canonical user product** — the Electron build (ADR-05-004) is. The Docker image:

1. Reuses the same browser bundle the Electron renderer reuses (one bundle, two delivery shapes).
2. Mounts the workspace volume so users can hot-iterate without rebuilding.
3. Connects to an **externally hosted** `Body/S/S3/gateway` (URL passed via `EPI_GATEWAY_URL` env var); the Docker image does not bundle the gateway.

### Dockerfile sketch (committed in a future tranche, not T1)

```dockerfile
FROM node:20-bookworm-slim

# Theia application-manager prerequisites
RUN apt-get update && apt-get install -y \
    libsecret-1-dev libxkbfile-dev libx11-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/theia
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY theia-app/package.json ./theia-app/
COPY extensions/ ./extensions/
COPY patches/ ./patches/

RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @pratibimba/theia-app build:prod

EXPOSE 3000
ENV THEIA_DEFAULT_PLUGINS=local-dir:/home/theia/plugins
ENV NODE_OPTIONS=--max-old-space-size=2048

CMD ["pnpm", "--filter", "@pratibimba/theia-app", "start", "--hostname=0.0.0.0", "--port=3000"]
```

### Configuration & contract

| Field | Value | Notes |
|---|---|---|
| Base image | `node:20-bookworm-slim` | Matches Node engine pin `>=20.0.0 <25`. |
| Exposed port | 3000 | Matches `theia-app/package.json#scripts.start` default. |
| Workspace mount | `/home/theia/workspace` (consumer-supplied volume) | Container is stateless; vault + workspace stays on host. |
| Gateway URL | `EPI_GATEWAY_URL` env var | Container does not run a gateway. CI/headless deployments must point at a separately-running gateway. |
| Plugins dir | `/home/theia/plugins` | Reserved for any future Theia plugin contributions. The earlier ADR-05-008 reservation for `obsidian-md-vsc` is **superseded** by ADR-05-010 — no VS Code extension borrow currently planned. |

### Build invocation (when committed)

```sh
docker build -t epi-logos/pratibimba-system:dev .
docker run -p 3000:3000 \
  -e EPI_GATEWAY_URL=ws://host.docker.internal:8765 \
  -v "$PWD/workspace:/home/theia/workspace" \
  epi-logos/pratibimba-system:dev
```

### Excluded from T1 / T9

- **Production container hardening** (non-root user, read-only rootfs, distroless final stage). Defer until release-quality.
- **Multi-stage builds** for size reduction. Defer until release-quality.
- **TLS termination** inside container. The container assumes a reverse-proxy in front (nginx, Traefik, Cloudflare Tunnel).

## Consequences

- T1 does **not** commit the Dockerfile. T1 verifies that the browser build works in dev; Docker comes later as a CI / headless deployment vehicle.
- A follow-on tranche (likely T9 or post-T9) commits the Dockerfile and adds a CI smoke job that builds + boots the image and hits a readiness endpoint.
- Track 09 CI may consume this image once it lands.

## Cross-references

- [`theiaide/theia` Docker Hub](https://hub.docker.com/r/theiaide/theia) — upstream reference pattern.
- [Theia Docker deployment docs](https://theia-ide.org/docs/composing_applications) — composition guidance.
