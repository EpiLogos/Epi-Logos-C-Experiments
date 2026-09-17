# Onboarding visual-regression fixtures

Track 32.T32.14 extends the acceptance harness with deterministic onboarding
baselines. The binary PNG files are captured by the harness on first green run;
until then these DOM snapshots and screenshot manifests are the structural
baseline the visual gate asserts.

All payloads are `protected-local-synthetic-fixture`.

