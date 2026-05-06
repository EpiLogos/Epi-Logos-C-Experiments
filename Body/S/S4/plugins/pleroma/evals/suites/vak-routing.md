# Pleroma Eval Suite: VAK Routing

**Purpose:** Verify that `vak-evaluate` assigns correct CF codes and routes to the right constitutional agent for standard task types.

## Suite: vak-routing

### Case 1: Brainstorming request → Nous

**Input:** "I'm not sure what approach to take for this feature"
**Expected CPF:** `(00/00)`
**Expected CF:** `(00/00)` → Nous
**Expected agent:** `nous`

### Case 2: Write failing test → Eros

**Input:** "Write a failing test for the new auth module"
**Expected CPF:** `(4.0/1-4.4/5)`
**Expected CF:** `(0/1/2)` → Eros
**Expected CT:** CT2 Operational

### Case 3: Architecture decision → Mythos

**Input:** "Analyse why the gateway is timing out under load"
**Expected CPF:** `(4.0/1-4.4/5)`
**Expected CF:** `(0/1/2/3)` → Mythos
**Expected CP:** 4.3 Pattern

### Case 4: Active execution task → Anima

**Input:** "Implement the codex runtime install command"
**Expected CPF:** `(4.0/1-4.4/5)`
**Expected CF:** `(4.0/1-4.4/5)` → Anima
**Expected CFP:** CFP0 or CFP2

### Case 5: Session synthesis → Psyche

**Input:** "Synthesise what we produced in this session"
**Expected CPF:** `(4.5/0)`
**Expected CF:** `(4.5/0)` → Psyche

### Case 6: Branch closure → Sophia

**Input:** "All tests pass, finish this development branch"
**Expected CPF:** `(4.0/1-4.4/5)`
**Expected CF:** `(5/0)` → Sophia
