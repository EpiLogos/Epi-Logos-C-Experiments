export type UiDesignTokenType = 'color' | 'dimension' | 'duration' | 'cubicBezier';

export interface UiDesignToken {
    readonly $value: string | readonly number[] | Readonly<Record<string, string>>;
    readonly $type: UiDesignTokenType;
    readonly $description: string;
}

export type UiDesignTokenGroup = {
    readonly [key: string]: UiDesignToken | UiDesignTokenGroup;
};

export type UiDesignTokenTopLevelName = 'colour' | 'typography' | 'motion' | 'spacing' | 'depth';

export const UI_DESIGN_TOKEN_TOP_LEVEL_NAMES = Object.freeze(["colour","typography","motion","spacing","depth"]) as readonly UiDesignTokenTopLevelName[];

export const UI_DESIGN_TOKENS = {
    "epilogos": {
        "colour": {
            "family": {
                "p": {
                    "0": {
                        "$value": {
                            "dark": "#6EA8FE",
                            "light": "#6EA8FE",
                            "glass": "#6EA8FE"
                        },
                        "$type": "color",
                        "$description": "Family P archetype tier 0 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "1": {
                        "$value": {
                            "dark": "#5C95EA",
                            "light": "#5C95EA",
                            "glass": "#5C95EA"
                        },
                        "$type": "color",
                        "$description": "Family P archetype tier 1 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "2": {
                        "$value": {
                            "dark": "#4A82D6",
                            "light": "#4A82D6",
                            "glass": "#4A82D6"
                        },
                        "$type": "color",
                        "$description": "Family P archetype tier 2 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "3": {
                        "$value": {
                            "dark": "#386FC2",
                            "light": "#386FC2",
                            "glass": "#386FC2"
                        },
                        "$type": "color",
                        "$description": "Family P archetype tier 3 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "4": {
                        "$value": {
                            "dark": "#265CAE",
                            "light": "#265CAE",
                            "glass": "#265CAE"
                        },
                        "$type": "color",
                        "$description": "Family P archetype tier 4 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "5": {
                        "$value": {
                            "dark": "#14499A",
                            "light": "#14499A",
                            "glass": "#14499A"
                        },
                        "$type": "color",
                        "$description": "Family P archetype tier 5 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    }
                },
                "s": {
                    "0": {
                        "$value": {
                            "dark": "#C59BFF",
                            "light": "#C59BFF",
                            "glass": "#C59BFF"
                        },
                        "$type": "color",
                        "$description": "Family S archetype tier 0 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "1": {
                        "$value": {
                            "dark": "#B387F0",
                            "light": "#B387F0",
                            "glass": "#B387F0"
                        },
                        "$type": "color",
                        "$description": "Family S archetype tier 1 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "2": {
                        "$value": {
                            "dark": "#A173E1",
                            "light": "#A173E1",
                            "glass": "#A173E1"
                        },
                        "$type": "color",
                        "$description": "Family S archetype tier 2 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "3": {
                        "$value": {
                            "dark": "#8F5FD2",
                            "light": "#8F5FD2",
                            "glass": "#8F5FD2"
                        },
                        "$type": "color",
                        "$description": "Family S archetype tier 3 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "4": {
                        "$value": {
                            "dark": "#7D4BC3",
                            "light": "#7D4BC3",
                            "glass": "#7D4BC3"
                        },
                        "$type": "color",
                        "$description": "Family S archetype tier 4 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "5": {
                        "$value": {
                            "dark": "#6B37B4",
                            "light": "#6B37B4",
                            "glass": "#6B37B4"
                        },
                        "$type": "color",
                        "$description": "Family S archetype tier 5 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    }
                },
                "t": {
                    "0": {
                        "$value": {
                            "dark": "#66D9E8",
                            "light": "#66D9E8",
                            "glass": "#66D9E8"
                        },
                        "$type": "color",
                        "$description": "Family T archetype tier 0 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "1": {
                        "$value": {
                            "dark": "#53C6D5",
                            "light": "#53C6D5",
                            "glass": "#53C6D5"
                        },
                        "$type": "color",
                        "$description": "Family T archetype tier 1 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "2": {
                        "$value": {
                            "dark": "#40B3C2",
                            "light": "#40B3C2",
                            "glass": "#40B3C2"
                        },
                        "$type": "color",
                        "$description": "Family T archetype tier 2 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "3": {
                        "$value": {
                            "dark": "#2DA0AF",
                            "light": "#2DA0AF",
                            "glass": "#2DA0AF"
                        },
                        "$type": "color",
                        "$description": "Family T archetype tier 3 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "4": {
                        "$value": {
                            "dark": "#1A8D9C",
                            "light": "#1A8D9C",
                            "glass": "#1A8D9C"
                        },
                        "$type": "color",
                        "$description": "Family T archetype tier 4 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "5": {
                        "$value": {
                            "dark": "#077A89",
                            "light": "#077A89",
                            "glass": "#077A89"
                        },
                        "$type": "color",
                        "$description": "Family T archetype tier 5 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    }
                },
                "m": {
                    "0": {
                        "$value": {
                            "dark": "#F6C177",
                            "light": "#F6C177",
                            "glass": "#F6C177"
                        },
                        "$type": "color",
                        "$description": "Family M archetype tier 0 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "1": {
                        "$value": {
                            "dark": "#E9AE60",
                            "light": "#E9AE60",
                            "glass": "#E9AE60"
                        },
                        "$type": "color",
                        "$description": "Family M archetype tier 1 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "2": {
                        "$value": {
                            "dark": "#DC9B49",
                            "light": "#DC9B49",
                            "glass": "#DC9B49"
                        },
                        "$type": "color",
                        "$description": "Family M archetype tier 2 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "3": {
                        "$value": {
                            "dark": "#CF8832",
                            "light": "#CF8832",
                            "glass": "#CF8832"
                        },
                        "$type": "color",
                        "$description": "Family M archetype tier 3 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "4": {
                        "$value": {
                            "dark": "#C2751B",
                            "light": "#C2751B",
                            "glass": "#C2751B"
                        },
                        "$type": "color",
                        "$description": "Family M archetype tier 4 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "5": {
                        "$value": {
                            "dark": "#B56204",
                            "light": "#B56204",
                            "glass": "#B56204"
                        },
                        "$type": "color",
                        "$description": "Family M archetype tier 5 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    }
                },
                "l": {
                    "0": {
                        "$value": {
                            "dark": "#80D98B",
                            "light": "#80D98B",
                            "glass": "#80D98B"
                        },
                        "$type": "color",
                        "$description": "Family L archetype tier 0 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "1": {
                        "$value": {
                            "dark": "#6BC878",
                            "light": "#6BC878",
                            "glass": "#6BC878"
                        },
                        "$type": "color",
                        "$description": "Family L archetype tier 1 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "2": {
                        "$value": {
                            "dark": "#56B765",
                            "light": "#56B765",
                            "glass": "#56B765"
                        },
                        "$type": "color",
                        "$description": "Family L archetype tier 2 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "3": {
                        "$value": {
                            "dark": "#41A652",
                            "light": "#41A652",
                            "glass": "#41A652"
                        },
                        "$type": "color",
                        "$description": "Family L archetype tier 3 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "4": {
                        "$value": {
                            "dark": "#2C953F",
                            "light": "#2C953F",
                            "glass": "#2C953F"
                        },
                        "$type": "color",
                        "$description": "Family L archetype tier 4 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "5": {
                        "$value": {
                            "dark": "#17842C",
                            "light": "#17842C",
                            "glass": "#17842C"
                        },
                        "$type": "color",
                        "$description": "Family L archetype tier 5 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    }
                },
                "c": {
                    "0": {
                        "$value": {
                            "dark": "#FF8AA2",
                            "light": "#FF8AA2",
                            "glass": "#FF8AA2"
                        },
                        "$type": "color",
                        "$description": "Family C archetype tier 0 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "1": {
                        "$value": {
                            "dark": "#F17691",
                            "light": "#F17691",
                            "glass": "#F17691"
                        },
                        "$type": "color",
                        "$description": "Family C archetype tier 1 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "2": {
                        "$value": {
                            "dark": "#E36280",
                            "light": "#E36280",
                            "glass": "#E36280"
                        },
                        "$type": "color",
                        "$description": "Family C archetype tier 2 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "3": {
                        "$value": {
                            "dark": "#D54E6F",
                            "light": "#D54E6F",
                            "glass": "#D54E6F"
                        },
                        "$type": "color",
                        "$description": "Family C archetype tier 3 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "4": {
                        "$value": {
                            "dark": "#C73A5E",
                            "light": "#C73A5E",
                            "glass": "#C73A5E"
                        },
                        "$type": "color",
                        "$description": "Family C archetype tier 4 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    },
                    "5": {
                        "$value": {
                            "dark": "#B9264D",
                            "light": "#B9264D",
                            "glass": "#B9264D"
                        },
                        "$type": "color",
                        "$description": "Family C archetype tier 5 tint for coordinate-bearing surfaces. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                    }
                }
            },
            "element": {
                "aether": {
                    "$value": {
                        "dark": "#D7C7FF",
                        "light": "#D7C7FF",
                        "glass": "#D7C7FF"
                    },
                    "$type": "color",
                    "$description": "Prima-materia element tint for framing and threshold states. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "earth": {
                    "$value": {
                        "dark": "#8BCB88",
                        "light": "#8BCB88",
                        "glass": "#8BCB88"
                    },
                    "$type": "color",
                    "$description": "Earth element tint for grounding, materiality, and stable quartet positions. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "water": {
                    "$value": {
                        "dark": "#62B6FF",
                        "light": "#62B6FF",
                        "glass": "#62B6FF"
                    },
                    "$type": "color",
                    "$description": "Water element tint for flow, receptivity, and reflective quartet positions. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "air": {
                    "$value": {
                        "dark": "#F4D35E",
                        "light": "#F4D35E",
                        "glass": "#F4D35E"
                    },
                    "$type": "color",
                    "$description": "Air element tint for motion, relation, and communicative quartet positions. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "fire": {
                    "$value": {
                        "dark": "#FF7A59",
                        "light": "#FF7A59",
                        "glass": "#FF7A59"
                    },
                    "$type": "color",
                    "$description": "Fire element tint for ignition, discernment, and transformative quartet positions. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "salt": {
                    "$value": {
                        "dark": "#E8E1CF",
                        "light": "#E8E1CF",
                        "glass": "#E8E1CF"
                    },
                    "$type": "color",
                    "$description": "Salt element tint for ultima-materia crystallisation and completion. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                }
            },
            "flow": {
                "mahamaya-gold": {
                    "$value": {
                        "dark": "#D8A534",
                        "light": "#D8A534",
                        "glass": "#D8A534"
                    },
                    "$type": "color",
                    "$description": "Mahamaya directed-response flow streamline. Derivation: Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6."
                },
                "parashakti-emerald": {
                    "$value": {
                        "dark": "#2DBE7E",
                        "light": "#2DBE7E",
                        "glass": "#2DBE7E"
                    },
                    "$type": "color",
                    "$description": "Parashakti integrative flow streamline. Derivation: Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6."
                }
            },
            "psyche-facet": {
                "anima": {
                    "$value": {
                        "dark": "#FF9F7A",
                        "light": "#FF9F7A",
                        "glass": "#FF9F7A"
                    },
                    "$type": "color",
                    "$description": "Anima dispatch and lemniscate recognition facet. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "eros": {
                    "$value": {
                        "dark": "#FF6F91",
                        "light": "#FF6F91",
                        "glass": "#FF6F91"
                    },
                    "$type": "color",
                    "$description": "Eros operative exchange and verification facet. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "logos": {
                    "$value": {
                        "dark": "#6EA8FE",
                        "light": "#6EA8FE",
                        "glass": "#6EA8FE"
                    },
                    "$type": "color",
                    "$description": "Logos form-giving and scoping facet. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "mythos": {
                    "$value": {
                        "dark": "#9B8CFF",
                        "light": "#9B8CFF",
                        "glass": "#9B8CFF"
                    },
                    "$type": "color",
                    "$description": "Mythos pattern and strange-attractor facet. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "nous": {
                    "$value": {
                        "dark": "#BFD7EA",
                        "light": "#BFD7EA",
                        "glass": "#BFD7EA"
                    },
                    "$type": "color",
                    "$description": "Nous epistemic clearing facet. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "psyche": {
                    "$value": {
                        "dark": "#7BDCB5",
                        "light": "#7BDCB5",
                        "glass": "#7BDCB5"
                    },
                    "$type": "color",
                    "$description": "Psyche household coordination facet. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "sophia": {
                    "$value": {
                        "dark": "#FFD166",
                        "light": "#FFD166",
                        "glass": "#FFD166"
                    },
                    "$type": "color",
                    "$description": "Sophia integrative pulse and return facet. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                }
            },
            "signal": {
                "info": {
                    "$value": {
                        "dark": "#6EA8FE",
                        "light": "#6EA8FE",
                        "glass": "#6EA8FE"
                    },
                    "$type": "color",
                    "$description": "Informational signal for neutral guidance. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "success": {
                    "$value": {
                        "dark": "#59D98E",
                        "light": "#59D98E",
                        "glass": "#59D98E"
                    },
                    "$type": "color",
                    "$description": "Success signal for completed or ready affordances. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "warning": {
                    "$value": {
                        "dark": "#F6C177",
                        "light": "#F6C177",
                        "glass": "#F6C177"
                    },
                    "$type": "color",
                    "$description": "Warning signal for cautions that do not block action. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "danger": {
                    "$value": {
                        "dark": "#FF6B6B",
                        "light": "#FF6B6B",
                        "glass": "#FF6B6B"
                    },
                    "$type": "color",
                    "$description": "Danger signal for blocked or destructive states. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "readiness": {
                "severity": {
                    "ready": {
                        "$value": {
                            "dark": "#59D98E",
                            "light": "#59D98E",
                            "glass": "#59D98E"
                        },
                        "$type": "color",
                        "$description": "Ready bridge or substrate state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "degraded": {
                        "$value": {
                            "dark": "#F6C177",
                            "light": "#F6C177",
                            "glass": "#F6C177"
                        },
                        "$type": "color",
                        "$description": "Degraded but usable bridge or substrate state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "blocked": {
                        "$value": {
                            "dark": "#FF6B6B",
                            "light": "#FF6B6B",
                            "glass": "#FF6B6B"
                        },
                        "$type": "color",
                        "$description": "Blocked bridge or substrate state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    }
                },
                "id": {
                    "bridge-unavailable": {
                        "$value": {
                            "dark": "#FF6B6B",
                            "light": "#FF6B6B",
                            "glass": "#FF6B6B"
                        },
                        "$type": "color",
                        "$description": "Bridge unavailable readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "profile-missing-field": {
                        "$value": {
                            "dark": "#F6C177",
                            "light": "#F6C177",
                            "glass": "#F6C177"
                        },
                        "$type": "color",
                        "$description": "Profile field missing readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "s2-graph-blocked": {
                        "$value": {
                            "dark": "#FF7A59",
                            "light": "#FF7A59",
                            "glass": "#FF7A59"
                        },
                        "$type": "color",
                        "$description": "S2 graph blocked readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "s3-subscription-blocked": {
                        "$value": {
                            "dark": "#FF8AA2",
                            "light": "#FF8AA2",
                            "glass": "#FF8AA2"
                        },
                        "$type": "color",
                        "$description": "S3 subscription blocked readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "s5-review-blocked": {
                        "$value": {
                            "dark": "#D54E6F",
                            "light": "#D54E6F",
                            "glass": "#D54E6F"
                        },
                        "$type": "color",
                        "$description": "S5 review blocked readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "authority-payload-missing": {
                        "$value": {
                            "dark": "#F4D35E",
                            "light": "#F4D35E",
                            "glass": "#F4D35E"
                        },
                        "$type": "color",
                        "$description": "Authority payload missing readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "privacy-blocked": {
                        "$value": {
                            "dark": "#C59BFF",
                            "light": "#C59BFF",
                            "glass": "#C59BFF"
                        },
                        "$type": "color",
                        "$description": "Privacy blocked readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "degraded-but-readable": {
                        "$value": {
                            "dark": "#F6C177",
                            "light": "#F6C177",
                            "glass": "#F6C177"
                        },
                        "$type": "color",
                        "$description": "Readable degraded readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    },
                    "ready-public-current": {
                        "$value": {
                            "dark": "#59D98E",
                            "light": "#59D98E",
                            "glass": "#59D98E"
                        },
                        "$type": "color",
                        "$description": "Current public ready readiness state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                    }
                }
            },
            "privacy": {
                "protected-local": {
                    "$value": {
                        "dark": "#C59BFF",
                        "light": "#C59BFF",
                        "glass": "#C59BFF"
                    },
                    "$type": "color",
                    "$description": "Protected-local privacy chrome. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "handle-only": {
                    "$value": {
                        "dark": "#66D9E8",
                        "light": "#66D9E8",
                        "glass": "#66D9E8"
                    },
                    "$type": "color",
                    "$description": "Handle-only privacy chrome. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "opt-in": {
                    "$value": {
                        "dark": "#80D98B",
                        "light": "#80D98B",
                        "glass": "#80D98B"
                    },
                    "$type": "color",
                    "$description": "Opt-in public privacy chrome. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "chroma-depth": {
                "shallow": {
                    "$value": {
                        "dark": "#A7C7E7",
                        "light": "#A7C7E7",
                        "glass": "#A7C7E7"
                    },
                    "$type": "color",
                    "$description": "Shallow chroma for low-emphasis coordinate support. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "middle": {
                    "$value": {
                        "dark": "#6EA8FE",
                        "light": "#6EA8FE",
                        "glass": "#6EA8FE"
                    },
                    "$type": "color",
                    "$description": "Middle chroma for active coordinate support. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "deep": {
                    "$value": {
                        "dark": "#265CAE",
                        "light": "#265CAE",
                        "glass": "#265CAE"
                    },
                    "$type": "color",
                    "$description": "Deep chroma for high-emphasis coordinate support. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "capacity": {
                "open": {
                    "$value": {
                        "dark": "#59D98E",
                        "light": "#59D98E",
                        "glass": "#59D98E"
                    },
                    "$type": "color",
                    "$description": "Capacity available state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "near-limit": {
                    "$value": {
                        "dark": "#F6C177",
                        "light": "#F6C177",
                        "glass": "#F6C177"
                    },
                    "$type": "color",
                    "$description": "Capacity near-limit state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "closed": {
                    "$value": {
                        "dark": "#FF6B6B",
                        "light": "#FF6B6B",
                        "glass": "#FF6B6B"
                    },
                    "$type": "color",
                    "$description": "Capacity closed state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "bridge": {
                "connected": {
                    "$value": {
                        "dark": "#59D98E",
                        "light": "#59D98E",
                        "glass": "#59D98E"
                    },
                    "$type": "color",
                    "$description": "Connected bridge status. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "degraded": {
                    "$value": {
                        "dark": "#F6C177",
                        "light": "#F6C177",
                        "glass": "#F6C177"
                    },
                    "$type": "color",
                    "$description": "Degraded bridge status. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "disconnected": {
                    "$value": {
                        "dark": "#FF6B6B",
                        "light": "#FF6B6B",
                        "glass": "#FF6B6B"
                    },
                    "$type": "color",
                    "$description": "Disconnected bridge status. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "surface": {
                "base": {
                    "$value": {
                        "dark": "#151821",
                        "light": "#151821",
                        "glass": "#151821"
                    },
                    "$type": "color",
                    "$description": "Base shell surface. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "raised": {
                    "$value": {
                        "dark": "#202433",
                        "light": "#202433",
                        "glass": "#202433"
                    },
                    "$type": "color",
                    "$description": "Raised composition surface. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "inset": {
                    "$value": {
                        "dark": "#0F121A",
                        "light": "#0F121A",
                        "glass": "#0F121A"
                    },
                    "$type": "color",
                    "$description": "Inset data surface. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "layout": {
                "focus": {
                    "$value": {
                        "dark": "#6EA8FE",
                        "light": "#6EA8FE",
                        "glass": "#6EA8FE"
                    },
                    "$type": "color",
                    "$description": "Focused layout channel. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "split": {
                    "$value": {
                        "dark": "#66D9E8",
                        "light": "#66D9E8",
                        "glass": "#66D9E8"
                    },
                    "$type": "color",
                    "$description": "Split layout channel. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "composite": {
                    "$value": {
                        "dark": "#9B8CFF",
                        "light": "#9B8CFF",
                        "glass": "#9B8CFF"
                    },
                    "$type": "color",
                    "$description": "Composite layout channel. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "insight": {
                "dormant": {
                    "$value": {
                        "dark": "#778190",
                        "light": "#778190",
                        "glass": "#778190"
                    },
                    "$type": "color",
                    "$description": "Dormant insight state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "active": {
                    "$value": {
                        "dark": "#FFD166",
                        "light": "#FFD166",
                        "glass": "#FFD166"
                    },
                    "$type": "color",
                    "$description": "Active insight state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "confirmed": {
                    "$value": {
                        "dark": "#59D98E",
                        "light": "#59D98E",
                        "glass": "#59D98E"
                    },
                    "$type": "color",
                    "$description": "Confirmed insight state. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "skeleton": {
                "base": {
                    "$value": {
                        "dark": "#2B3040",
                        "light": "#2B3040",
                        "glass": "#2B3040"
                    },
                    "$type": "color",
                    "$description": "Skeleton placeholder base. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "shimmer": {
                    "$value": {
                        "dark": "#3A4154",
                        "light": "#3A4154",
                        "glass": "#3A4154"
                    },
                    "$type": "color",
                    "$description": "Skeleton placeholder shimmer. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "signature": {
                "cool": {
                    "$value": {
                        "dark": "#6EA8FE",
                        "light": "#6EA8FE",
                        "glass": "#6EA8FE"
                    },
                    "$type": "color",
                    "$description": "Cool Cl(4,2) signature pole. Derivation: Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6."
                },
                "warm": {
                    "$value": {
                        "dark": "#F6C177",
                        "light": "#F6C177",
                        "glass": "#F6C177"
                    },
                    "$type": "color",
                    "$description": "Warm Cl(4,2) signature pole. Derivation: Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6."
                }
            }
        },
        "typography": {
            "mono": {
                "coordinate": {
                    "$value": "13px",
                    "$type": "dimension",
                    "$description": "Monospace size for wikilink coordinate strings. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                },
                "label": {
                    "$value": "12px",
                    "$type": "dimension",
                    "$description": "Monospace size for compact coordinate labels. Derivation: Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture."
                }
            },
            "prose": {
                "body": {
                    "$value": "14px",
                    "$type": "dimension",
                    "$description": "Default prose body size for Theia content surfaces. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "canon": {
                    "$value": "16px",
                    "$type": "dimension",
                    "$description": "Canon text size for source excerpts and proof prose. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "legal": {
                    "$value": "12px",
                    "$type": "dimension",
                    "$description": "Legal and policy copy size for compact disclosures. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            },
            "ui": {
                "micro": {
                    "$value": "11px",
                    "$type": "dimension",
                    "$description": "Microcopy size for asides and metadata. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "chip": {
                    "$value": "12px",
                    "$type": "dimension",
                    "$description": "Chip label size for compact status affordances. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "tooltip": {
                    "$value": "12px",
                    "$type": "dimension",
                    "$description": "Tooltip text size for hover disclosures. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                },
                "status-bar": {
                    "$value": "12px",
                    "$type": "dimension",
                    "$description": "Status-bar label size aligned to Theia chrome. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
                }
            }
        },
        "motion": {
            "tick": {
                "$value": "120ms",
                "$type": "duration",
                "$description": "Profile-tick visual acknowledgement duration. Derivation: Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6."
            },
            "toggle": {
                "$value": "160ms",
                "$type": "duration",
                "$description": "Binary control toggle duration. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "reveal": {
                "$value": "220ms",
                "$type": "duration",
                "$description": "Progressive disclosure reveal duration. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "slerp": {
                "$value": [
                    0.32,
                    0.72,
                    0.18,
                    1
                ],
                "$type": "cubicBezier",
                "$description": "Slerp choreography easing. Derivation: Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6."
            },
            "bloom": {
                "$value": "280ms",
                "$type": "duration",
                "$description": "Recognition bloom duration for insight activation. Derivation: Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md alpha/16:9/4pi proof overlay."
            },
            "settle": {
                "$value": "180ms",
                "$type": "duration",
                "$description": "Settle duration after bridge or layout state change. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "lemniscate": {
                "$value": [
                    0.38,
                    0,
                    0.2,
                    1
                ],
                "$type": "cubicBezier",
                "$description": "Lemniscate transition easing. Derivation: Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6."
            }
        },
        "spacing": {
            "tight": {
                "$value": "4px",
                "$type": "dimension",
                "$description": "Tight spacing for dense coordinate annotations. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "compact": {
                "$value": "8px",
                "$type": "dimension",
                "$description": "Compact spacing for chips and toolbar groups. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "standard": {
                "$value": "12px",
                "$type": "dimension",
                "$description": "Standard spacing for extension control rows. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "generous": {
                "$value": "16px",
                "$type": "dimension",
                "$description": "Generous spacing for composition panes. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "section": {
                "$value": "24px",
                "$type": "dimension",
                "$description": "Section spacing for major content transitions. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            }
        },
        "depth": {
            "surface": {
                "$value": "0px",
                "$type": "dimension",
                "$description": "Base surface elevation. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "overlay": {
                "$value": "8px",
                "$type": "dimension",
                "$description": "Overlay elevation depth. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "tooltip": {
                "$value": "12px",
                "$type": "dimension",
                "$description": "Tooltip elevation depth. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "modal": {
                "$value": "24px",
                "$type": "dimension",
                "$description": "Modal elevation depth. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            },
            "notification": {
                "$value": "16px",
                "$type": "dimension",
                "$description": "Notification elevation depth. Derivation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11."
            }
        }
    }
} as const;

export type UiDesignTokenPath = string;

export function getUiDesignToken(path: UiDesignTokenPath): UiDesignToken {
    const token = path.split('.').reduce<unknown>((cursor, segment) => {
        if (!cursor || typeof cursor !== 'object') {
            return undefined;
        }
        return (cursor as Record<string, unknown>)[segment];
    }, UI_DESIGN_TOKENS);

    if (!isUiDesignToken(token)) {
        throw new Error(`Unknown UI design token: ${path}`);
    }

    return token;
}

export function flattenUiDesignTokens(
    node: UiDesignTokenGroup = UI_DESIGN_TOKENS,
    prefix = ''
): Readonly<Record<string, UiDesignToken>> {
    const entries: Array<[string, UiDesignToken]> = [];
    for (const [key, value] of Object.entries(node)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (isUiDesignToken(value)) {
            entries.push([path, value]);
            continue;
        }
        entries.push(...Object.entries(flattenUiDesignTokens(value as UiDesignTokenGroup, path)));
    }
    return Object.freeze(Object.fromEntries(entries));
}

function isUiDesignToken(value: unknown): value is UiDesignToken {
    return Boolean(
        value &&
            typeof value === 'object' &&
            Object.hasOwn(value, '$value') &&
            Object.hasOwn(value, '$type') &&
            Object.hasOwn(value, '$description')
    );
}
