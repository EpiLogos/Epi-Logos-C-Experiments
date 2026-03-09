fn main() {
    let out_dir = std::env::var("OUT_DIR").expect("OUT_DIR must be set");
    let mut build = cc::Build::new();

    build
        .std("c11")
        .warnings(true)
        .extra_warnings(true)
        .include("../include")
        .include("../vendor/blake3")
        .define("BLAKE3_NO_SSE2", None)
        .define("BLAKE3_NO_SSE41", None)
        .define("BLAKE3_NO_AVX2", None)
        .define("BLAKE3_NO_AVX512", None)
        // Pillar I
        .file("../src/psychoid_numbers.c")
        .file("../src/engine.c")
        .file("../src/arena.c")
        .file("../src/families.c")
        // M-branches
        .file("../src/m0.c")
        .file("../src/m1.c")
        .file("../src/m2.c")
        .file("../src/m3.c")
        .file("../src/m4.c")
        .file("../src/m5.c")
        // BLAKE3
        .file("../vendor/blake3/blake3.c")
        .file("../vendor/blake3/blake3_dispatch.c")
        .file("../vendor/blake3/blake3_portable.c");

    // Suppress warnings for vendored BLAKE3 code
    build.flag_if_supported("-Wno-unused-parameter");

    build.compile("epilogos");

    println!("cargo:rustc-link-search=native={out_dir}");
    println!("cargo:rustc-link-lib=static=epilogos");
    println!("cargo:rerun-if-changed=../src/");
    println!("cargo:rerun-if-changed=../include/");
    println!("cargo:rerun-if-changed=../vendor/blake3/");
}
