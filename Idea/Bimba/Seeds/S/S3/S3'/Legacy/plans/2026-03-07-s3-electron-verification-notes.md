# S3 Electron Verification Notes

## Target

- Rust gateway test port: `8421`
- Electron app path: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src`

## Required Flows

- hello/connect handshake
- session alias
- subagent switch
- skills surface
- channels surface

## Rust Contract Status

- `gate_omnipanel_contract`: PASS
- `gate_electron_smoke`: PASS

## Electron Verification Status

- Focused Electron verification command: run separately in app repo
- E2E Electron verification command: FAILED

### Command

```bash
cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src
npm run test:e2e -- --grep "gateway|session|skills|channels"
```

### Observed Blocker

- Playwright selected `tests/e2e/omnipanel-boundary.spec.ts`
- Failing spec: `OmniPanel boundary regression › keeps gateway shell isolated from Nara workflow UI`
- Additional teardown issue: `Worker teardown timeout of 30000ms exceeded.`
- Focused gateway spec rerun:

```bash
cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src
npm run test:e2e -- tests/e2e/omnipanel-gateway.spec.ts
```

- Focused spec result: `tests/e2e/omnipanel-gateway.spec.ts` failed before any gateway assertions ran.
- Exact failure: `"beforeAll" hook timeout of 120000ms exceeded` while launching Electron in the spec setup.
- Simplest shell spec rerun:

```bash
cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src
npm run test:e2e -- tests/e2e/app.spec.ts
```

- Shell spec result: failed with the same `beforeAll` launch timeout while launching Electron with `args: ['src']`.
- Boundary spec rerun:

```bash
cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src
npm run test:e2e -- tests/e2e/omnipanel-boundary.spec.ts
```

- Boundary spec result: Electron booted successfully with `args: ['.']`; the first test passed and the second test failed on an unrelated OmniPanel/Nara assertion.

### Current Interpretation

- The Rust-side OmniPanel contract is green.
- The first app-side blocker surfaced by the required Electron verification command is an Electron boundary spec, not a direct Rust handshake/session/chat parity assertion.
- A focused rerun of `tests/e2e/omnipanel-boundary.spec.ts` on the Electron repo `main` checkout showed that the Electron harness boots correctly when the spec uses `args: ['.']`, so this is not caused by the Rust worktree layout.
- The focused gateway spec and the older `app.spec.ts` both use `args: ['src']`, which resolves to `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src`.
- That directory has no `package.json`, so the current Playwright harness is launching Electron against the wrong application root.
- Task 11 is therefore blocked by an app-side E2E harness defect rather than a proven Rust gateway protocol mismatch.

## Notes

- The Electron app is treated as a compatibility harness for this tranche.
- Any failure here should be recorded as a Rust-side contract mismatch first unless the evidence proves otherwise.
