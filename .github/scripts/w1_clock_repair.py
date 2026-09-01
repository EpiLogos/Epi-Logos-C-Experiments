from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"expected source fragment missing in {path}: {old!r}")
    p.write_text(text.replace(old, new, 1))


module = "Body/S/S0/portal-core/src/ananda_vortex.rs"
replace_once(
    module,
    "    pub decimal10_value: Option<u8>,\n    pub rule_value: Option<String>,\n",
    "    pub decimal10_value: Option<u8>,\n"
    "    pub decimal10_bimba: Option<u8>,\n"
    "    pub decimal10_pratibimba: Option<u8>,\n"
    "    pub decimal10_sum: Option<u8>,\n"
    "    pub decimal10_difference_a: Option<u8>,\n"
    "    pub decimal10_difference_b: Option<u8>,\n"
    "    pub rule_value: Option<String>,\n",
)
replace_once(
    module,
    "        let decimal10_value = if row12 < 10 && col12 < 10 {\n"
    "            match raw_value {\n"
    "                Some(raw) => Some(decimal_mod10(raw)),\n"
    "                None => None,\n"
    "            }\n"
    "        } else {\n"
    "            None\n"
    "        };\n",
    "        let decimal_terms = if row12 < 10 && col12 < 10 {\n"
    "            Some((\n"
    "                decimal_mod10(raw_bimba),\n"
    "                decimal_mod10(raw_pratibimba),\n"
    "                decimal_mod10(raw_sum),\n"
    "                decimal_mod10(raw_difference_a),\n"
    "                decimal_mod10(raw_difference_b),\n"
    "            ))\n"
    "        } else {\n"
    "            None\n"
    "        };\n"
    "        let decimal10_value = match (raw_value, decimal_terms) {\n"
    "            (Some(raw), Some(_)) => Some(decimal_mod10(raw)),\n"
    "            _ => None,\n"
    "        };\n"
    "        let (\n"
    "            decimal10_bimba,\n"
    "            decimal10_pratibimba,\n"
    "            decimal10_sum,\n"
    "            decimal10_difference_a,\n"
    "            decimal10_difference_b,\n"
    "        ) = match decimal_terms {\n"
    "            Some((b, p, s, da, db)) => (Some(b), Some(p), Some(s), Some(da), Some(db)),\n"
    "            None => (None, None, None, None, None),\n"
    "        };\n",
)
replace_once(
    module,
    "            decimal10_value,\n            rule_value,\n",
    "            decimal10_value,\n"
    "            decimal10_bimba,\n"
    "            decimal10_pratibimba,\n"
    "            decimal10_sum,\n"
    "            decimal10_difference_a,\n"
    "            decimal10_difference_b,\n"
    "            rule_value,\n",
)

kernel = "Body/S/S0/portal-core/src/kernel.rs"
replace_once(
    kernel,
    "use serde::{Deserialize, Serialize};\n\n",
    "use serde::{Deserialize, Serialize};\n\nuse crate::ananda_vortex::AnandaVortexProjection;\n",
)
replace_once(
    kernel,
    "pub const CURRENT_PROFILE_SCHEMA_VERSION: u16 = 1;",
    "pub const CURRENT_PROFILE_SCHEMA_VERSION: u16 = 2;",
)
replace_once(
    kernel,
    "    pub helix: String,\n    pub ratio_role: String,\n",
    "    pub helix: String,\n    #[serde(default)]\n    pub ananda_vortex: AnandaVortexProjection,\n    pub ratio_role: String,\n",
)
replace_once(
    kernel,
    "        let degree720 = hopf.degree720;\n        let degree360 = hopf.degree360;\n",
    "        let degree720 = hopf.degree720;\n"
    "        let degree360 = hopf.degree360;\n"
    "        let ananda_vortex = AnandaVortexProjection::from_clock(tick.cycle, tick12);\n",
)
replace_once(
    kernel,
    "            helix: helix.to_owned(),\n            ratio_role: ratio_role_for_sub_tick(tick12).to_owned(),\n",
    "            helix: helix.to_owned(),\n"
    "            ananda_vortex,\n"
    "            ratio_role: ratio_role_for_sub_tick(tick12).to_owned(),\n",
)
replace_once(
    kernel,
    '            source: "S0 kernel tick + portal-core harmonic/codon/Vimarsha projections".to_owned(),\n',
    '            source: "S0 kernel tick + canonical M1 Ananda + portal-core harmonic/codon/Vimarsha projections".to_owned(),\n',
)

lib = "Body/S/S0/portal-core/src/lib.rs"
replace_once(lib, "pub mod aspect;\n", "pub mod ananda_vortex;\npub mod aspect;\n")
replace_once(lib, "pub use aspect::compute_aspects;\n", "pub use ananda_vortex::*;\npub use aspect::compute_aspects;\n")

profile_test = "Body/S/S0/portal-core/tests/track_01_t2_profile_contract.rs"
replace_once(profile_test, 'assert_eq!(json["profileSchemaVersion"], 1);',
             'assert_eq!(json["profileSchemaVersion"], 2);')
replace_once(profile_test, 'assert_eq!(json["degree720"], 600);',
             'assert_eq!(json["degree720"], 660);')
replace_once(profile_test, 'assert_eq!(json["degree360"], 240);',
             'assert_eq!(json["degree360"], 300);')
replace_once(
    profile_test,
    '        "helix",\n        "ratioRole",\n',
    '        "helix",\n        "anandaVortex",\n        "ratioRole",\n',
)

p = Path(profile_test)
p.write_text(
    p.read_text()
    + r'''

#[test]
fn public_profile_serializes_typed_ananda_source_and_independent_hopf_state() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(9, 10));
    let json = serde_json::to_value(&profile).expect("profile serializes");
    let ananda = &json["anandaVortex"];

    assert_eq!(ananda["activeMatrixOp"], "diff-b");
    assert_eq!(ananda["activeCell"], serde_json::json!([10, 4]));
    assert_eq!(ananda["activeCellValue"]["rawValue"], 1);
    assert_eq!(ananda["activeCellValue"]["drValue"], 1);
    assert!(ananda["activeCellValue"]["decimal10Value"].is_null());
    assert_eq!(ananda["oscillatory"]["phase"], "prime");
    assert_eq!(ananda["oscillatory"]["conjugateTick12"], 4);
    assert_eq!(ananda["oscillatory"]["conjugatePhase"], "direct");
    assert_eq!(ananda["hopfFiber"], 1);
    assert_eq!(json["helix"], "pratibimba");
    assert_eq!(json["su2Layer"], "shadow");
}
'''
)
