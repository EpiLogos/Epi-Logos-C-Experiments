//! equivalence_classes.rs — OWL/SHACL projection of the Anuttara identity chains
//!
//! Reads M0_IDENTITY_CHAINS (compiled from the corpus `=` chains by T1.14 as
//! equivalence-class membership tables) and generates:
//!   (a) epi:inIdentityChainWith transitive closure
//!   (b) owl:sameAs transitive closure within each chain
//!   (c) Cypher for n10s.rdf.import.inline to write OWL triples
//!
//! CRITICAL: The `=/≠` (Reflective Distinction) is paraconsistent.
//! Do NOT emit owl:differentFrom for =/= pairs.
//! Export =/= as annotation property only (epi:reflectiveDistinction).
//!
//! Architecture: n10s is Neo4j server-side plugin accessed via Cypher.
//! S2 Neo4j is source of truth; OWL is a projection.

use std::collections::{BTreeSet, HashMap};

/// A single equality identity chain from the Anuttara corpus.
/// Each chain declares that all terms within it are `owl:sameAs`.
///
/// Example: the triad identities from R_TRIAD_TABLE:
///   "## = @ = (0/1)-(00)-00"           → chain ["##", "@", "(0/1)-(00)-00"]
///   "#R = @ = (7-8-9-(0/1)/O#-X#-N#)"  → chain ["#R", "@", "(7-8-9-(0/1)/O#-X#-N#)"]
///   "R# = parent of the acts ..."       → chain ["R#", "parent of the acts ..."]
///
/// And the broader corpus chains such as:
///   "(0- + -0) = ## = R+# = R# = 00"   → chain ["(0- + -0)", "##", "R+#", "R#", "00"]
///   "R# = 00\""                          → chain ["R#", "00\""]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IdentityChain {
    /// Human-readable name for this chain (for traceability)
    pub name: String,
    /// The ordered set of symbols in this identity chain, delimited by `=`
    pub terms: Vec<String>,
}

impl IdentityChain {
    pub fn new(name: impl Into<String>, terms: Vec<String>) -> Self {
        Self {
            name: name.into(),
            terms,
        }
    }

    /// Produce all unordered pairs within this chain as owl:sameAs candidates.
    /// For chain [A, B, C], emits (A,B), (A,C), (B,C).
    pub fn same_as_pairs(&self) -> Vec<(&str, &str)> {
        let mut pairs = Vec::new();
        for i in 0..self.terms.len() {
            for j in (i + 1)..self.terms.len() {
                pairs.push((self.terms[i].as_str(), self.terms[j].as_str()));
            }
        }
        pairs
    }

    /// Compute the transitive closure over all chains merged together.
    /// Returns a set of equivalence classes, each being a BTreeSet of term strings.
    pub fn transitive_closure(chains: &[IdentityChain]) -> Vec<BTreeSet<String>> {
        // Build a union-find over all unique terms
        let mut parent: HashMap<String, String> = HashMap::new();
        let mut rank: HashMap<String, usize> = HashMap::new();

        fn find(parent: &mut HashMap<String, String>, x: &str) -> String {
            let p = parent.get(x).cloned().unwrap_or_else(|| x.to_string());
            if p == x {
                return p;
            }
            let root = find(parent, &p);
            parent.insert(x.to_string(), root.clone());
            root
        }

        fn union(
            parent: &mut HashMap<String, String>,
            rank: &mut HashMap<String, usize>,
            a: &str,
            b: &str,
        ) {
            let ra = find(parent, a);
            let rb = find(parent, b);
            if ra == rb {
                return;
            }
            let rank_a = *rank.get(&ra).unwrap_or(&0);
            let rank_b = *rank.get(&rb).unwrap_or(&0);
            if rank_a < rank_b {
                parent.insert(ra.clone(), rb.clone());
            } else if rank_a > rank_b {
                parent.insert(rb.clone(), ra.clone());
            } else {
                parent.insert(rb.clone(), ra.clone());
                *rank.entry(ra).or_insert(0) += 1;
            }
        }

        // Ensure all terms have entries
        for chain in chains {
            for term in &chain.terms {
                parent.entry(term.clone()).or_insert_with(|| term.clone());
                rank.entry(term.clone()).or_insert(0);
            }
        }

        // Union all terms within each chain
        for chain in chains {
            if chain.terms.len() < 2 {
                continue;
            }
            let first = &chain.terms[0];
            for other in &chain.terms[1..] {
                union(&mut parent, &mut rank, first, other);
            }
        }

        // Collect into equivalence classes
        let mut classes: HashMap<String, BTreeSet<String>> = HashMap::new();
        let all_terms: Vec<String> = parent.keys().cloned().collect();
        for term in all_terms {
            let root = find(&mut parent, &term);
            classes
                .entry(root)
                .or_insert_with(BTreeSet::new)
                .insert(term);
        }

        classes.into_values().collect()
    }
}

/// Canonical identity chains compiled from the Anuttara corpus.
///
/// In the full implementation, these are read from M0_IDENTITY_CHAINS[] in m0.h.
/// Currently hardcoded from the known corpus chains and R_TRIAD_TABLE identities.
pub fn m0_identity_chains() -> Vec<IdentityChain> {
    vec![
        // ── Triad identity chains (from R_TRIAD_TABLE in m0.c) ──
        IdentityChain::new(
            "R_TRIAD_TRUTH",
            vec![
                "##".to_string(),
                "@".to_string(),
                "(0/1)-(00)-00".to_string(),
            ],
        ),
        IdentityChain::new(
            "R_TRIAD_LIGHT",
            vec![
                "#R".to_string(),
                "@".to_string(),
                "(7-8-9-(0/1)/O#-X#-N#)".to_string(),
            ],
        ),
        IdentityChain::new(
            "R_TRIAD_LIFE",
            vec![
                "R#".to_string(),
                "parent of the acts".to_string(),
                "@5 (Sakti Techne)".to_string(),
            ],
        ),
        // ── Corpus identity chains from Anuttara complete explication ──
        // "(0- + -0) = ## = R+# = R# = 00" — one node viewed five ways
        IdentityChain::new(
            "CORPUS_VOID_EQUIVALENCE",
            vec![
                "(0- + -0)".to_string(),
                "##".to_string(),
                "R+#".to_string(),
                "R#".to_string(),
                "00".to_string(),
            ],
        ),
        // "R# = 00""
        IdentityChain::new(
            "R_SHARP_00_CLOSURE",
            vec!["R#".to_string(), "00\"".to_string()],
        ),
        // ── The 9 as Paramesvara: (00+00) = 9 = (@)  ──
        IdentityChain::new(
            "VOID_9_WHOLENESS",
            vec!["(00+00)".to_string(), "9".to_string(), "(@)".to_string()],
        ),
        // ── Non-Dual Binary: "the unified recognition that (0/1) and (00x00) are the same" ──
        IdentityChain::new(
            "NONDUAL_BINARY",
            vec!["(0/1)".to_string(), "(00x00)".to_string()],
        ),
        // ── Svabhava derivation: "(0/1) = (00/00) = (##/R#)"  ──
        IdentityChain::new(
            "SVABHAVA_DERIVATION",
            vec![
                "(0/1)".to_string(),
                "(00/00)".to_string(),
                "(##/R#)".to_string(),
            ],
        ),
    ]
}

/// Generate Cypher to import owl:sameAs triples via n10s.rdf.import.inline.
///
/// Each equivalence class of size N produces N*(N-1)/2 owl:sameAs triples.
/// Uses CARA (CALL n10s.rdf.import.inline) with N-Triples format for simplicity.
pub fn owl_same_as_closure_cypher(chains: &[IdentityChain]) -> Vec<String> {
    let classes = IdentityChain::transitive_closure(chains);
    let mut statements: Vec<String> = Vec::new();

    for class in &classes {
        let terms: Vec<&String> = class.iter().collect();
        for i in 0..terms.len() {
            for j in (i + 1)..terms.len() {
                let a = ntriples_escape(terms[i]);
                let b = ntriples_escape(terms[j]);
                statements.push(format!(
                    "<https://epi-logos.org/term/{}> <http://www.w3.org/2002/07/owl#sameAs> <https://epi-logos.org/term/{}> .",
                    a, b
                ));
            }
        }
    }

    if statements.is_empty() {
        return vec!["// No owl:sameAs triples to emit".to_string()];
    }

    // Chunk into batches of 50 triples per CALL for n10s
    let batch_size = 50;
    let mut cypher_commands = Vec::new();

    for chunk in statements.chunks(batch_size) {
        let ntriples = chunk.join("\n");
        let escaped = ntriples.replace('\\', "\\\\").replace('"', "\\\"");
        cypher_commands.push(format!(
            "CALL n10s.rdf.import.inline(\"{}\", \"N-Triples\", {{handleVocabUris: 'MAP', keepLangTag: false}}) YIELD terminationStatus, triplesLoaded RETURN terminationStatus, triplesLoaded",
            escaped
        ));
    }

    cypher_commands
}

/// Generate Cypher to create epi:inIdentityChainWith relationships between
/// all terms in the same identity chain (the non-OWL native graph property).
pub fn in_identity_chain_cypher(chains: &[IdentityChain]) -> Vec<String> {
    let mut commands: Vec<String> = Vec::new();

    for chain in chains {
        for i in 0..chain.terms.len() {
            for j in 0..chain.terms.len() {
                if i == j {
                    continue;
                }
                let a = cypher_escape(&chain.terms[i]);
                let b = cypher_escape(&chain.terms[j]);
                commands.push(format!(
                    "MATCH (a:BimbaNode {{c_1_symbol: '{}'}}), (b:BimbaNode {{c_1_symbol: '{}'}}) MERGE (a)-[:epi__inIdentityChainWith]->(b)",
                    a, b
                ));
            }
        }
    }

    commands
}

/// Generate Cypher for the =/= (Reflective Distinction) annotation.
/// These are exported as annotation properties only — never as owl:differentFrom.
///
/// Known =/= pairs from the Anuttara corpus:
///   - "Brimming Void's native copula: everything equal-AND-unequal"
///   - R_Triad_Truth and the 9 as Paramesvara carry =/= as annotation
pub fn reflective_distinction_cypher(_chains: &[IdentityChain]) -> Vec<String> {
    // =/= pairs are annotation-only, not DL. They don't enter owl:differentFrom.
    // Instead, we annotate nodes with epi:reflectiveDistinction as a string property.
    let mut commands: Vec<String> = Vec::new();

    // Known =/= pairs from the corpus (annotation only)
    let reflective_pairs: Vec<(&str, &str, &str)> = vec![
        // The Brimming Void's native copula: ## and @ carry =/= (equal-AND-unequal)
        (
            "##",
            "@",
            "Brimming Void native copula — everything equal-AND-unequal (Law 3)",
        ),
        // The 9 as Paramesvara: (00+00) and 9 carry =/=
        (
            "(00+00)",
            "9",
            "Paramesvara synthesis-copula — equal AND unequal (Law 3)",
        ),
        // (0/1) and (00x00) — unified recognition that they are the same dynamic principle
        (
            "(0/1)",
            "(00x00)",
            "Non-Dual Binary recognition — equal AND unequal",
        ),
    ];

    for (a, b, note) in reflective_pairs {
        let a_escaped = cypher_escape(a);
        let b_escaped = cypher_escape(b);
        let note_escaped = cypher_escape(note);
        commands.push(format!(
            "MATCH (a:BimbaNode {{c_1_symbol: '{}'}}), (b:BimbaNode {{c_1_symbol: '{}'}}) SET a.epi__reflectiveDistinction = coalesce(a.epi__reflectiveDistinction + '; ', '') + '{}'",
            a_escaped, b_escaped, note_escaped
        ));
    }

    commands
}

/// Generate a single composite Cypher script for n10s OWL projection.
///
/// Returns a vector of (description, cypher) pairs for sequential execution.
pub fn equivalence_class_import_plan() -> Vec<(String, String)> {
    let chains = m0_identity_chains();

    let mut plan = Vec::new();

    // 1. owl:sameAs triples via n10s.rdf.import.inline
    let same_as_commands = owl_same_as_closure_cypher(&chains);
    for cmd in same_as_commands {
        plan.push(("owl:sameAs import".to_string(), cmd));
    }

    // 2. epi:inIdentityChainWith relationships
    let chain_commands = in_identity_chain_cypher(&chains);
    if !chain_commands.is_empty() {
        let combined = chain_commands.join("\n");
        plan.push(("epi:inIdentityChainWith".to_string(), combined));
    }

    // 3. =/= annotation-only (epi:reflectiveDistinction)
    let reflective_commands = reflective_distinction_cypher(&chains);
    if !reflective_commands.is_empty() {
        let combined = reflective_commands.join("\n");
        plan.push(("epi:reflectiveDistinction".to_string(), combined));
    }

    plan
}

/// Audit: count the equivalence classes, their sizes, and the owl:sameAs triple count.
#[derive(Debug, Clone)]
pub struct EquivalenceClassAudit {
    pub chain_count: usize,
    pub class_count: usize,
    pub max_class_size: usize,
    pub total_same_as_triples: usize,
    pub chain_names: Vec<String>,
}

pub fn audit_equivalence_classes() -> EquivalenceClassAudit {
    let chains = m0_identity_chains();
    let classes = IdentityChain::transitive_closure(&chains);
    let max_size = classes.iter().map(|c| c.len()).max().unwrap_or(0);
    let total_triples: usize = classes.iter().map(|c| c.len() * (c.len() - 1) / 2).sum();

    EquivalenceClassAudit {
        chain_count: chains.len(),
        class_count: classes.len(),
        max_class_size: max_size,
        total_same_as_triples: total_triples,
        chain_names: chains.iter().map(|c| c.name.clone()).collect(),
    }
}

// ── Helpers ──

/// Escape a string for N-Triples URI path segment.
fn ntriples_escape(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            '\\' => "%5C".to_string(),
            '"' => "%22".to_string(),
            '<' => "%3C".to_string(),
            '>' => "%3E".to_string(),
            '{' => "%7B".to_string(),
            '}' => "%7D".to_string(),
            '|' => "%7C".to_string(),
            '^' => "%5E".to_string(),
            '`' => "%60".to_string(),
            ' ' => "%20".to_string(),
            c => c.to_string(),
        })
        .collect()
}

/// Escape a string for Cypher single-quoted literal.
fn cypher_escape(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('\'', "\\'")
        .replace('\n', "\\n")
}

// ── Tests ──

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn transitive_closure_merges_overlapping_chains() {
        // Chain A: a = b = c
        // Chain B: c = d
        // Transitive closure should produce: {a, b, c, d}
        let chains = vec![
            IdentityChain::new("test_chain_a", vec!["a".into(), "b".into(), "c".into()]),
            IdentityChain::new("test_chain_b", vec!["c".into(), "d".into()]),
        ];

        let classes = IdentityChain::transitive_closure(&chains);
        assert_eq!(classes.len(), 1, "Should merge into one class");
        assert_eq!(classes[0].len(), 4, "Should contain a,b,c,d");
        assert!(classes[0].contains("a"));
        assert!(classes[0].contains("b"));
        assert!(classes[0].contains("c"));
        assert!(classes[0].contains("d"));
    }

    #[test]
    fn disjoint_chains_produce_separate_classes() {
        let chains = vec![
            IdentityChain::new("chain_a", vec!["x".into(), "y".into()]),
            IdentityChain::new("chain_b", vec!["p".into(), "q".into()]),
        ];

        let classes = IdentityChain::transitive_closure(&chains);
        assert_eq!(classes.len(), 2, "Should produce two separate classes");
    }

    #[test]
    fn singleton_chain_produces_self_class() {
        let chains = vec![IdentityChain::new("singleton", vec!["sole".into()])];

        let classes = IdentityChain::transitive_closure(&chains);
        assert_eq!(classes.len(), 1);
        assert_eq!(classes[0].len(), 1);
    }

    #[test]
    fn no_owl_different_from_emitted() {
        // Paraconsistency assurance: =/= must never become owl:differentFrom
        let reflective = reflective_distinction_cypher(&m0_identity_chains());
        for cmd in &reflective {
            assert!(
                !cmd.contains("differentFrom"),
                "=/= must NOT emit owl:differentFrom: {}",
                cmd
            );
        }
    }

    #[test]
    fn identity_chains_count_matches_expected() {
        let chains = m0_identity_chains();
        // We expect at least 8 chains: 3 triad + 5 corpus
        assert!(
            chains.len() >= 8,
            "Expected at least 8 identity chains, got {}",
            chains.len()
        );
    }

    #[test]
    fn owl_same_as_cypher_is_valid_ntriples() {
        let chains = m0_identity_chains();
        let commands = owl_same_as_closure_cypher(&chains);
        for cmd in &commands {
            if cmd.starts_with("//") {
                continue;
            }
            // Should contain owl:sameAs
            assert!(
                cmd.contains("owl#sameAs"),
                "Expected owl:sameAs in ntriples: {}",
                cmd
            );
            // Should be a valid CALL n10s statement
            assert!(
                cmd.starts_with("CALL n10s.rdf.import.inline"),
                "Expected CALL n10s.rdf.import.inline: {}",
                cmd
            );
        }
    }

    #[test]
    fn audit_reports_meaningful_counts() {
        let audit = audit_equivalence_classes();
        assert!(audit.chain_count >= 8);
        assert!(audit.class_count >= 1);
        // Each class with n terms produces n*(n-1)/2 triples
        assert!(audit.total_same_as_triples > 0);
    }
}
