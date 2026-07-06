fn main() {
    let mut build = cc::Build::new();

    build
        .std("c11")
        .warnings(true)
        .extra_warnings(true)
        .include("include")
        .include("../vendor/blake3")
        .define("BLAKE3_NO_SSE2", None)
        .define("BLAKE3_NO_SSE41", None)
        .define("BLAKE3_NO_AVX2", None)
        .define("BLAKE3_NO_AVX512", None)
        .define("BLAKE3_USE_NEON", "0")
        .file("src/psychoid_numbers.c")
        .file("src/engine.c")
        .file("src/arena.c")
        .file("src/families.c")
        .file("src/pointer_web.c")
        .file("src/m0.c")
        .file("src/m1.c")
        .file("src/m2.c")
        .file("src/m3.c")
        .file("src/m3_clock_lut.c")
        .file("src/m4.c")
        .file("src/m5.c")
        .file("src/kernel.c")
        .file("src/qv_data.c")
        .file("../vendor/blake3/blake3.c")
        .file("../vendor/blake3/blake3_dispatch.c")
        .file("../vendor/blake3/blake3_portable.c");

    if std::env::var_os("CARGO_FEATURE_M0_VERIFIER").is_some() {
        build.file("src/m0_verifier.c");
    }

    build.flag_if_supported("-Wno-unused-parameter");
    build.compile("epilogos");

    println!("cargo:rerun-if-changed=src/");
    println!("cargo:rerun-if-changed=include/");
    println!("cargo:rerun-if-changed=../vendor/blake3/");
}
