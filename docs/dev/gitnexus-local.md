# GitNexus Local Runtime Notes

## Apple Silicon Node Architecture

GitNexus depends on the native `@ladybugdb/core/lbugjs.node` module. On Apple Silicon, that module must be loaded by an `arm64` Node runtime. If `npx gitnexus ...` fails with:

```text
mach-o file, but is an incompatible architecture (have 'arm64', need 'x86_64')
```

the active shell is resolving Node through Rosetta/x86_64. The local repair is:

1. Install arm64 Node 24 with Homebrew:

   ```bash
   /opt/homebrew/bin/brew install node@24
   ```

2. Ensure shell startup places `/opt/homebrew/opt/node@24/bin` before `/usr/local/bin` and removes `/usr/local/opt/node@24/bin`.

3. Verify:

   ```bash
   zsh -lc 'node -p "process.version + \" \" + process.arch + \" \" + process.execPath"'
   zsh -lc 'npx gitnexus status'
   ```

Expected Node output includes `arm64` and `/opt/homebrew/Cellar/node@24/...`.

## Refreshing The Index

After a commit with new symbols:

```bash
zsh -lc 'npx gitnexus analyze'
zsh -lc 'npx gitnexus status'
```

If sandboxed execution cannot write `~/.gitnexus/registry.json`, rerun the analyze command with elevated filesystem permissions.

## Verified 2026-06-01

After installing arm64 `node@24` and updating shell startup, these commands succeeded in this repository:

```bash
zsh -lc 'npx gitnexus status'
zsh -lc 'npx gitnexus impact M3MahamayaWidget --direction downstream'
zsh -lc 'npx gitnexus impact M2PrimeMeaningPacket --direction downstream'
```
