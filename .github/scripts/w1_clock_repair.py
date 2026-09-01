from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"expected source fragment missing in {path}: {old!r}")
    p.write_text(text.replace(old, new, 1))


kernel = "Body/S/S0/portal-core/src/kernel.rs"
replace_once(
    kernel,
    "use crate::mahamaya::MahamayaCodecProjection;\n",
    "use crate::hopf::hopf_clock_address;\nuse crate::mahamaya::MahamayaCodecProjection;\n",
)
replace_once(
    kernel,
    "        let degree720 = tick12 as u16 * 60;\n        let degree360 = degree720 % 360;\n",
    "        let hopf = hopf_clock_address(tick.cycle, tick12);\n        let degree720 = hopf.degree720;\n        let degree360 = hopf.degree360;\n",
)
replace_once(
    kernel,
    '            su2_layer: if degree720 >= 360 {\n                "shadow"\n            } else {\n                "primary"\n            }\n',
    '            su2_layer: if hopf.fiber == 1 {\n                "shadow"\n            } else {\n                "primary"\n            }\n',
)

lib = "Body/S/S0/portal-core/src/lib.rs"
replace_once(
    lib,
    "pub use hopf::{hopf_fiber, hopf_project, validate_quaternion_unity};\n",
    "pub use hopf::{\n    hopf_clock_address, hopf_fiber, hopf_project, validate_quaternion_unity,\n    HopfClockAddress,\n};\n",
)

test = "Body/S/S0/portal-core/tests/kernel_clock_projection.rs"
replace_once(
    test,
    'assert_eq!(public_json["harmonicProfile"]["degree720"], 420);',
    'assert_eq!(public_json["harmonicProfile"]["degree720"], 210);',
)
replace_once(
    test,
    'assert_eq!(public_json["harmonicProfile"]["degree360"], 60);',
    'assert_eq!(public_json["harmonicProfile"]["degree360"], 210);',
)
replace_once(
    test,
    'assert_eq!(public_json["harmonicProfile"]["su2Layer"], "shadow");',
    'assert_eq!(public_json["harmonicProfile"]["su2Layer"], "primary");',
)
replace_once(
    test,
    'assert_eq!(json["harmonicProfile"]["degree720"], 600);',
    'assert_eq!(json["harmonicProfile"]["degree720"], 660);',
)
replace_once(
    test,
    'assert_eq!(json["harmonicProfile"]["degree360"], 240);',
    'assert_eq!(json["harmonicProfile"]["degree360"], 300);',
)

p = Path(test)
p.write_text(
    p.read_text()
    + r'''

#[test]
fn hopf_fibre_and_direct_prime_helix_are_independent_coordinates() {
    let cases = [
        (0u64, 0u8, 0u16, 0u16, "primary", "bimba"),
        (0, 7, 210, 210, "primary", "pratibimba"),
        (1, 0, 360, 0, "shadow", "bimba"),
        (1, 7, 570, 210, "shadow", "pratibimba"),
        (1, 11, 690, 330, "shadow", "pratibimba"),
        (2, 0, 0, 0, "primary", "bimba"),
    ];

    for (cycle, tick12, degree720, degree360, layer, helix) in cases {
        let tick = portal_core::kernel_tick_from_epogdoon(cycle, tick12);
        let profile = portal_core::MathemeHarmonicProfile::from_tick(tick);
        assert_eq!(profile.tick12, tick12);
        assert_eq!(profile.degree720, degree720);
        assert_eq!(profile.degree360, degree360);
        assert_eq!(profile.su2_layer, layer);
        assert_eq!(profile.helix, helix);
    }
}
'''
)

workflow = ".github/workflows/m1-ananda-substrate.yml"
path_block = "      - 'Body/S/S0/epi-lib/test/m1/**'\n      - '.github/workflows/m1-ananda-substrate.yml'\n"
expanded_block = "      - 'Body/S/S0/epi-lib/test/m1/**'\n      - 'Body/S/S0/portal-core/src/hopf.rs'\n      - 'Body/S/S0/portal-core/src/kernel.rs'\n      - 'Body/S/S0/portal-core/src/lib.rs'\n      - 'Body/S/S0/portal-core/src/ananda_vortex.rs'\n      - 'Body/S/S0/portal-core/tests/kernel_clock_projection.rs'\n      - 'Body/S/S0/portal-core/tests/ananda_vortex_projection.rs'\n      - '.github/workflows/m1-ananda-substrate.yml'\n"
replace_once(workflow, path_block, expanded_block)
replace_once(workflow, path_block, expanded_block)

p = Path(workflow)
p.write_text(
    p.read_text()
    + "\n  rust-profile:\n"
    + "    runs-on: ubuntu-latest\n"
    + "    steps:\n"
    + "      - uses: actions/checkout@v4\n"
    + "      - name: Run portal-core temporal and harmonic profile tests\n"
    + "        run: cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml\n"
)
