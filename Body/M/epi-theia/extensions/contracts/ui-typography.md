# UI Typography Contract

The Epi-Logos Theia shell consumes typography through named tokens. Each token maps to Theia CSS variables so extensions inherit the active Theia theme, font family, and user font scaling instead of hard-coding a separate visual system.

| Token | Use case | Size | Weight | Family |
| --- | --- | --- | --- | --- |
| `epilogos.typography.heading.1` | Page title, for example `M5' Epii Atelier` | `calc(var(--theia-ui-font-size3) * 1.5)` | 600 | `var(--theia-ui-font-family)` |
| `epilogos.typography.heading.2` | Section title, for example `Mersenne Proof Overlay` or `Resonance Grid`; block matheme prominence | `var(--theia-ui-font-size2)` | 600 | `var(--theia-ui-font-family)` |
| `epilogos.typography.heading.3` | Sub-section or card title | `var(--theia-ui-font-size1)` | 600 | `var(--theia-ui-font-family)` |
| `epilogos.typography.heading.4` | Micro-section or chip label group | `var(--theia-ui-font-size0)` | 600 | `var(--theia-ui-font-family)` |
| `epilogos.typography.body.base` | Body text | `var(--theia-ui-font-size1)` | 400 | `var(--theia-ui-font-family)` |
| `epilogos.typography.body.small` | Secondary body text | `var(--theia-ui-font-size0)` | 400 | `var(--theia-ui-font-family)` |
| `epilogos.typography.caption` | Captions, hover tooltips, and `aria-label`-style asides | `var(--theia-ui-font-size)` | 400 | `var(--theia-ui-font-family)` |
| `epilogos.typography.mono.default` | Generic code, handles, and hex values | `var(--theia-ui-font-size0)` | 400 | `var(--theia-monospace-font-family)` |
| `epilogos.typography.mono.coordinate` | `[[wikilink]]` coordinate strings | `var(--theia-ui-font-size0)` | 400 | `var(--theia-monospace-font-family)` |
| `epilogos.typography.mono.codon` | Codon strings such as `AUG`, `UAA`, `CGU` | `var(--theia-ui-font-size0)` | 400 | `var(--theia-monospace-font-family)` |
| `epilogos.typography.mono.hexagram` | Hexagram glyphs such as `䷀`, `䷁`, `䷂` | `var(--theia-ui-font-size2)` | 400 | `var(--theia-monospace-font-family)` |
| `epilogos.typography.matheme.block` | KaTeX block rendering such as `0/1 = 4+2 = 5\to 0 = 0/1` | `var(--theia-ui-font-size2)` | 600 | `var(--theia-ui-font-family)` |
| `epilogos.typography.matheme.inline` | KaTeX inline rendering such as `\alpha = 16/9 \cdot \sqrt[3]{4\pi}` | `var(--theia-ui-font-size1)` | 400 | `var(--theia-ui-font-family)` |

`epilogos.typography.mono.coordinate` also consumes the wikilink target's family letter and archetype tier to apply `epilogos.colour.family.<letter>.<archetype>`, where `<letter>` is one of `p`, `s`, `t`, `m`, `l`, or `c`, and `<archetype>` is `0..5`.

Matheme primitives render through KaTeX. Block mathemes default to `epilogos.typography.matheme.block`; consumers may explicitly request `epilogos.typography.heading.2` when a proof token needs section-title prominence. Every rendered matheme must carry an `aria-label` containing a plain-text equivalent.
