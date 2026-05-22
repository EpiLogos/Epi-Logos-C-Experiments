fn main() {
    let out_dir = std::env::var("OUT_DIR").expect("OUT_DIR must be set");
    let mut build = cc::Build::new();

    build
        .std("c11")
        .warnings(true)
        .extra_warnings(true)
        .include("../epi-lib/include")
        .include("../vendor/blake3")
        .define("BLAKE3_NO_SSE2", None)
        .define("BLAKE3_NO_SSE41", None)
        .define("BLAKE3_NO_AVX2", None)
        .define("BLAKE3_NO_AVX512", None)
        .define("BLAKE3_USE_NEON", "0")
        // Pillar I
        .file("../epi-lib/src/psychoid_numbers.c")
        .file("../epi-lib/src/engine.c")
        .file("../epi-lib/src/arena.c")
        .file("../epi-lib/src/families.c")
        .file("../epi-lib/src/pointer_web.c")
        // M-branches
        .file("../epi-lib/src/m0.c")
        .file("../epi-lib/src/m1.c")
        .file("../epi-lib/src/m2.c")
        .file("../epi-lib/src/m3.c")
        .file("../epi-lib/src/m4.c")
        .file("../epi-lib/src/m5.c")
        .file("../epi-lib/src/kernel.c")
        // QV data (generated)
        .file("../epi-lib/src/qv_data.c")
        // BLAKE3
        .file("../vendor/blake3/blake3.c")
        .file("../vendor/blake3/blake3_dispatch.c")
        .file("../vendor/blake3/blake3_portable.c");

    // Suppress warnings for vendored BLAKE3 code
    build.flag_if_supported("-Wno-unused-parameter");

    build.compile("epilogos");

    println!("cargo:rustc-link-search=native={out_dir}");
    println!("cargo:rustc-link-lib=static=epilogos");
    println!("cargo:rerun-if-changed=../epi-lib/src/");
    println!("cargo:rerun-if-changed=../epi-lib/include/");
    println!("cargo:rerun-if-changed=../vendor/blake3/");
}
