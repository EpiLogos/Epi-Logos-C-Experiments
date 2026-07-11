//! CCT-17b (e) — the three-layer retrieval composition: ontology-filter
//! then fact-traverse then cosine-rank, in that order, with ranking never
//! resurrecting a filtered passage and facts requiring span anchors.

use epi_s2_graph_services::retrieval::tri_layer::{
    TriLayerPassage, TriLayerRetrievalPlan, TriLayerStage,
};

fn passage(
    coordinate: &str,
    family: Option<&str>,
    spans: &[&str],
    cosine: f64,
) -> TriLayerPassage {
    TriLayerPassage {
        coordinate: coordinate.to_owned(),
        relation_family: family.map(str::to_owned),
        span_pointers: spans.iter().map(|s| s.to_string()).collect(),
        cosine_score: cosine,
    }
}

#[test]
fn tri_layer_retrieval_composition() {
    let plan = TriLayerRetrievalPlan {
        admitted_relation_families: vec!["structural".to_owned()],
        ..TriLayerRetrievalPlan::default()
    };
    assert_eq!(
        plan.stages,
        [
            TriLayerStage::OntologyFilter,
            TriLayerStage::FactTraverse,
            TriLayerStage::CosineRank
        ],
        "the composition order IS the contract"
    );

    let result = plan.compose(vec![
        // Survives all three layers, ranks second by cosine.
        passage("C2-1", Some("structural"), &["World/A.md:3:5"], 0.61),
        // Highest cosine but wrong family — the ontology layer drops it
        // and ranking must NOT resurrect it.
        passage("M5-4", Some("episodic"), &["World/B.md:9:2"], 0.99),
        // Right family but no span anchor — the fact layer drops it.
        passage("C2-2", Some("structural"), &[], 0.87),
        // Survives, ranks first.
        passage("C4", Some("structural"), &["World/C.md:1:1"], 0.75),
    ]);

    assert_eq!(
        result
            .iter()
            .map(|passage| passage.coordinate.as_str())
            .collect::<Vec<_>>(),
        vec!["C4", "C2-1"],
        "filter → traverse → rank; the filtered set is what gets ranked"
    );
}

#[test]
fn empty_admitted_families_admits_all_but_facts_still_need_anchors() {
    let plan = TriLayerRetrievalPlan::default();
    let result = plan.compose(vec![
        passage("C2", None, &["World/A.md:1:1"], 0.2),
        passage("C3", Some("anything"), &[], 0.9),
    ]);
    assert_eq!(result.len(), 1);
    assert_eq!(result[0].coordinate, "C2");
}
