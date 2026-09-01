from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"expected source fragment missing in {path}: {old!r}")
    p.write_text(text.replace(old, new, 1))


lib = "Body/S/S0/portal-core/src/lib.rs"
replace_once(lib, "pub mod aspect;\n", "pub mod ananda_vortex;\npub mod aspect;\n")
replace_once(lib, "pub use aspect::compute_aspects;\n", "pub use ananda_vortex::*;\npub use aspect::compute_aspects;\n")

kernel = "Body/S/S0/portal-core/src/kernel.rs"
replace_once(
    kernel,
    "use serde::{Deserialize, Serialize};\n\nuse crate::codon_rotation_projection::{\n",
    "use serde::{Deserialize, Serialize};\n\nuse crate::ananda_vortex::AnandaVortexProjection;\nuse crate::codon_rotation_projection::{\n",
)
replace_once(
    kernel,
    "pub const CURRENT_PROFILE_SCHEMA_VERSION: u16 = 1;",
    "pub const CURRENT_PROFILE_SCHEMA_VERSION: u16 = 2;",
)
replace_once(
    kernel,
    '            source: "S0 kernel tick + portal-core harmonic/codon/Vimarsha projections".to_owned(),\n',
    '            source: "S0 kernel tick + portal-core harmonic/codon/Vimarsha/Ananda projections".to_owned(),\n',
)
replace_once(
    kernel,
    "    pub helix: String,\n    pub ratio_role: String,\n",
    "    pub helix: String,\n    #[serde(default)]\n    pub ananda_vortex: AnandaVortexProjection,\n    pub ratio_role: String,\n",
)
replace_once(
    kernel,
    "        let hopf = hopf_clock_address(tick.cycle, tick12);\n        let degree720 = hopf.degree720;\n",
    "        let hopf = hopf_clock_address(tick.cycle, tick12);\n        let ananda_vortex = AnandaVortexProjection::from_clock(tick.cycle, tick12);\n        let degree720 = hopf.degree720;\n",
)
replace_once(
    kernel,
    "            helix: helix.to_owned(),\n            ratio_role: ratio_role_for_sub_tick(tick12).to_owned(),\n",
    "            helix: helix.to_owned(),\n            ananda_vortex,\n            ratio_role: ratio_role_for_sub_tick(tick12).to_owned(),\n",
)

t2 = "Body/S/S0/portal-core/tests/track_01_t2_profile_contract.rs"
replace_once(t2, 'assert_eq!(json["profileSchemaVersion"], 1);', 'assert_eq!(json["profileSchemaVersion"], 2);')
replace_once(t2, 'assert_eq!(json["degree720"], 600);', 'assert_eq!(json["degree720"], 660);')
replace_once(t2, 'assert_eq!(json["degree360"], 240);', 'assert_eq!(json["degree360"], 300);')
replace_once(
    t2,
    '        "phase",\n        "helix",\n        "ratioRole",\n',
    '        "phase",\n        "helix",\n        "anandaVortex",\n        "ratioRole",\n',
)
