# Integrated Composition Design Primitives

This shelf is the canonical browser-facing design primitive surface for M-extension provenance, coordinate strings, symbolic state, readiness, and choreography indicators.

Consumers import through:

```ts
import { CoordinateString, ReadinessIndicator } from '@pratibimba/integrated-composition/design-primitives';
```

M-extension packages should not re-create local pending badges, blocked overlays, readiness chips, coordinate tint parsing, or hard-coded provenance borders.
