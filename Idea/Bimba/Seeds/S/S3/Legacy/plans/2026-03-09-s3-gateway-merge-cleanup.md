# S3 Gateway Merge Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finalize the uncommitted `codex/s3-gateway-full-implementation` work, merge it into `main`, remove merged worktrees, and identify why Rust build artifacts are consuming multiple gigabytes.

**Architecture:** Validate the uncommitted gateway implementation directly in the `s3` worktree, commit only after tests prove the work is real, then merge into `main` and verify the merged result. After cleanup, inspect Rust build directories to separate repository size from build artifact size and identify the dominant contributors.

**Tech Stack:** Git worktrees, Rust, Cargo, shell tooling (`git`, `du`, `find`, `rg`)

---

### Task 1: Verify the S3 Gateway Worktree

**Files:**
- Inspect: `epi-cli/Cargo.toml`
- Inspect: `epi-cli/src/main.rs`
- Inspect: `epi-cli/src/gate/*.rs`
- Test: `epi-cli/tests/gate_*.rs`

**Step 1: Review the diff for coherence**

Run: `git -C .worktrees/codex/s3-gateway-full-implementation diff --stat`
Expected: Gateway-focused Rust source and test changes only.

**Step 2: Run the crate tests in the worktree**

Run: `cargo test` from `.worktrees/codex/s3-gateway-full-implementation/epi-cli`
Expected: Pass, or fail with actionable compile/test errors to fix before commit.

**Step 3: If tests fail, fix the minimal issues**

Run: `cargo test` again after each fix.
Expected: Green test run with no regressions.

**Step 4: Commit the verified work**

Run: `git add ... && git commit -m "feat(gate): add gateway implementation surface"`
Expected: One focused commit capturing the previously uncommitted gateway files.

### Task 2: Review and Merge the Verified Branch

**Files:**
- Inspect: `git diff main...codex/s3-gateway-full-implementation`
- Verify: merged `main`

**Step 1: Review the finalized delta before merge**

Run: `git log --oneline main..codex/s3-gateway-full-implementation`
Expected: The original branch work plus the new verification-backed commit.

**Step 2: Merge into `main`**

Run: `git checkout main && git merge codex/s3-gateway-full-implementation`
Expected: Clean merge or explicit conflicts to resolve.

**Step 3: Verify on merged `main`**

Run: `cargo test` from `epi-cli`
Expected: Green merged result before cleanup.

### Task 3: Remove Merged Worktrees and Branches

**Files:**
- Remove: `.worktrees/codex/s3-gateway-full-implementation`
- Remove: `.worktrees/codex/s4-prime-pleroma-real-port`

**Step 1: Confirm both branches are merged**

Run: `git branch --merged main`
Expected: Both worktree branches listed.

**Step 2: Remove worktrees**

Run: `git worktree remove <path>`
Expected: Worktree directories removed cleanly.

**Step 3: Delete local branches**

Run: `git branch -d <branch>`
Expected: Branches deleted because their tips are merged.

### Task 4: Investigate Rust Build Size

**Files:**
- Inspect: `epi-cli/target`
- Inspect: `.worktrees/*/epi-cli/target`

**Step 1: Measure artifact directories**

Run: `du -sh epi-cli/target .worktrees/*/epi-cli/target`
Expected: Concrete size breakdown for each build tree.

**Step 2: Identify the largest subdirectories**

Run: `du -sh epi-cli/target/* | sort -h`
Expected: Clear attribution to debug, incremental, deps, or other outputs.

**Step 3: Summarize root cause and cleanup options**

Expected: Evidence-backed explanation of why the build is large and which directories can be cleaned safely.
