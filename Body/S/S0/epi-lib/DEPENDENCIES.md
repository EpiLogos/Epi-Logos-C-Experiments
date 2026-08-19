# Native C dependency — QL-MEF

The Epi C build consumes the generalized QL kernel through an installed native-C prefix. Epi does not copy QL sources and does not depend on a sibling checkout at compile/link time.

Current pinned dependency:

```text
repository: EpiLogos/QL-MEF
revision: a3c33a2944fb2d90111afdf18f2afd6e871043e0
API: ql-c/primitive 0.1.0
artifact: lib/libql-mef-c.a
headers: include/ql/*.h
metadata: share/ql-mef-c/api-version.txt
          share/ql-mef-c/source-revision.txt
```

Materialise the dependency from that exact QL revision into an install prefix, for example:

```sh
make -C c clean all SOURCE_REVISION=a3c33a2944fb2d90111afdf18f2afd6e871043e0
make -C c install PREFIX="$PWD/.deps/ql-mef-c" \
  SOURCE_REVISION=a3c33a2944fb2d90111afdf18f2afd6e871043e0
```

Then build Epi with the prefix explicitly selected:

```sh
make verify-ql-c QL_MEF_C_PREFIX="$PWD/.deps/ql-mef-c"
make test_m1_ql_inversion test_m1 QL_MEF_C_PREFIX="$PWD/.deps/ql-mef-c"
```

`verify-ql-c` fails closed unless API version, exact source revision, installed header, static archive and the `ql_position_invert` symbol are present. The first migrated consumer is M1 `ql` CLI inversion display: its runtime value now comes from `ql_position_invert`; the historical `QL_INVERT` and `QL_FLOWERING[].inverse` values remain frozen parity evidence.
