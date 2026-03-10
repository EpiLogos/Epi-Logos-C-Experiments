# World Types Mirror

`Idea/Bimba/World/Types` is the filesystem mirror of the canonical ordering used by the core coordinate system and the Neo4j seed bedrock.

The ordering is:

1. `Root/#`
2. `Psychoids/#0` through `Psychoids/#5`
3. `Coordinates/C` through `Coordinates/M`
4. Nested inversion branches inside each family (`C/C'`, `P/P'`, ... `M/M'`)
5. Reflective/context-frame language under `Coordinates/C/C'`
6. `Coordinates/C/C'/CF/CF_VOID` through `CF_MOBIUS`
7. `Coordinates/C/C'/CT/CT0` through `CT5`

The reflective branch under `C/C'` contains the context-frame language:

- `CPF`
- `CT`
- `CP`
- `CF`
- `CFP`
- `CS`

`Idea/Bimba/World/*.md` is intentionally separate. The world root is the flat artifact/form library: reusable CT5-style synthesis files and form blueprints that Hen and Templater can invoke in any context.
