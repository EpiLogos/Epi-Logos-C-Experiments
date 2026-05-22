use std::future::Future;
use std::pin::pin;
use std::sync::Arc;
use std::task::{Context, Poll, Wake, Waker};

use epi_s1_hen_compiler_core::artifact_evidence::collect_artifact_evidence;
use epi_s1_hen_compiler_core::relation_inference::{
    build_relation_inference_request, PiAgentRelationInferenceProvider, RelationInferenceProvider,
};

#[test]
#[ignore = "requires live PI agent runtime, managed model/auth profile, and explicit approval for provider network access"]
fn pi_agent_returns_registered_relation_candidates() {
    let provider = match PiAgentRelationInferenceProvider::from_env() {
        Ok(provider) => provider,
        Err(error) => {
            eprintln!("skipping live PI relation inference test: {error}");
            return;
        }
    };
    let source = collect_artifact_evidence(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\ntitle: Current\n---\nThis elaborates [[C0/T4]] and contrasts [[C1]].",
    )
    .unwrap();
    let request = build_relation_inference_request(&source, &[]).unwrap();

    let candidates = block_on(provider.infer(&request)).unwrap();
    let request_targets = request
        .link_evidence
        .iter()
        .map(|evidence| evidence.target_text.as_str())
        .collect::<Vec<_>>();

    assert!(
        candidates.iter().any(|candidate| {
            candidate.evidence_kind == "wikilink"
                && candidate
                    .target_text
                    .as_deref()
                    .is_some_and(|target| request_targets.contains(&target))
        }),
        "provider returned no candidate grounded in request wikilink evidence"
    );
    assert!(
        candidates
            .iter()
            .any(|candidate| !candidate.evidence_text.is_empty()),
        "provider returned no candidate with evidence text"
    );
    assert!(
        candidates
            .iter()
            .any(|candidate| candidate.confidence > 0.0 && candidate.confidence <= 1.0),
        "provider returned no candidate with usable confidence"
    );
}

fn block_on<F: Future>(future: F) -> F::Output {
    let waker = Waker::from(Arc::new(NoopWake));
    let mut context = Context::from_waker(&waker);
    let mut future = pin!(future);

    loop {
        match Future::poll(future.as_mut(), &mut context) {
            Poll::Ready(output) => return output,
            Poll::Pending => std::thread::yield_now(),
        }
    }
}

struct NoopWake;

impl Wake for NoopWake {
    fn wake(self: Arc<Self>) {}
}
