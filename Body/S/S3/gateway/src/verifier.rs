pub use epi_s3_gateway_contract::{
    s0_prime_verifier_methods, M0VerifierKernelState, M0VerifierMembershipRequest,
    M0VerifierOwlQuery, M0VerifierQuestion, M0VerifierReportContract,
    M0VerifierRespondQuestionReceipt, M0VerifierRespondQuestionRequest, M0VerifierSymbolicParse,
    M0VerifierTypedQuery, S0_PRIME_VERIFIER_CHECK_STATE_METHOD,
    S0_PRIME_VERIFIER_EMIT_QUERY_METHOD, S0_PRIME_VERIFIER_METHODS,
    S0_PRIME_VERIFIER_OWL_QUERY_METHOD, S0_PRIME_VERIFIER_RESPOND_QUESTION_METHOD,
    S0_PRIME_VERIFIER_VALIDATE_MEMBERSHIP_METHOD,
};

pub fn is_s0_prime_verifier_method(method: &str) -> bool {
    s0_prime_verifier_methods().contains(&method)
}

pub fn parse_verifier_symbolic_coordinate(raw: &str) -> Result<M0VerifierSymbolicParse, String> {
    let trimmed = raw.trim();
    let body = trimmed
        .strip_prefix("#R")
        .and_then(|value| value.strip_suffix('?'))
        .ok_or_else(|| format!("invalid symbolic coordinate {trimmed:?}"))?;

    let mut tail = body.rsplitn(3, '-');
    let entry_state = tail
        .next()
        .filter(|value| !value.is_empty())
        .ok_or_else(|| format!("invalid symbolic coordinate {trimmed:?}"))?;
    let domain_entry = tail
        .next()
        .filter(|value| !value.is_empty())
        .ok_or_else(|| format!("invalid symbolic coordinate {trimmed:?}"))?;
    let coordinate_head = tail
        .next()
        .filter(|value| !value.is_empty())
        .ok_or_else(|| format!("invalid symbolic coordinate {trimmed:?}"))?;

    let (relation_raw, polar_domain) = coordinate_head
        .split_once('-')
        .ok_or_else(|| format!("invalid symbolic coordinate {trimmed:?}"))?;
    let relation_index = relation_raw
        .parse::<u8>()
        .map_err(|_| format!("invalid symbolic coordinate relation {relation_raw:?}"))?;
    if relation_index > 64 {
        return Err(format!(
            "invalid symbolic coordinate relation {relation_index}; expected 0..64"
        ));
    }

    let mut polar_parts = polar_domain.split('/');
    let left = parse_polar_position(polar_parts.next(), trimmed)?;
    let right = parse_polar_position(polar_parts.next(), trimmed)?;
    let domain_kind = polar_parts
        .next()
        .filter(|value| matches!(*value, "A" | "V" | "C" | "S" | "R"))
        .ok_or_else(|| format!("invalid symbolic coordinate domain in {trimmed:?}"))?;
    if polar_parts.next().is_some() {
        return Err(format!("invalid symbolic coordinate {trimmed:?}"));
    }

    let mut entry_chars = domain_entry.chars();
    let entry_prefix = entry_chars
        .next()
        .filter(|value| matches!(value, 'T' | 'R' | 'P'))
        .ok_or_else(|| format!("invalid symbolic coordinate entry {domain_entry:?}"))?;
    let entry_index_raw = entry_chars.as_str();
    let entry_index = entry_index_raw
        .parse::<u8>()
        .map_err(|_| format!("invalid symbolic coordinate entry {domain_entry:?}"))?;
    if domain_kind == "A" && entry_prefix == 'T' && entry_index > 11 {
        return Err(format!(
            "invalid archetype index {entry_index}; expected 0..11"
        ));
    }

    let state_marker = match entry_state {
        "pending" => "pending",
        "missing" | "unwitnessed" => "unwitnessed",
        "contradiction" => "incoherent",
        "unaligned" => "drift",
        other => {
            return Err(format!(
                "invalid symbolic coordinate state {other:?}; expected pending, missing, contradiction, unaligned, or unwitnessed"
            ))
        }
    };

    Ok(M0VerifierSymbolicParse {
        namespace: "R".to_owned(),
        coordinate: vec![
            relation_index.to_string(),
            format!("{left}/{right}"),
            format!("{domain_kind}-{domain_entry}"),
        ],
        archetype_index: (domain_kind == "A" && entry_prefix == 'T').then_some(entry_index),
        state_marker: state_marker.to_owned(),
        entry_state: entry_state.to_owned(),
    })
}

fn parse_polar_position(value: Option<&str>, raw: &str) -> Result<u8, String> {
    let position = value
        .ok_or_else(|| format!("invalid symbolic coordinate {raw:?}"))?
        .parse::<u8>()
        .map_err(|_| format!("invalid symbolic coordinate {raw:?}"))?;
    if position > 5 {
        return Err(format!(
            "invalid symbolic coordinate polar position {position}; expected 0..5"
        ));
    }
    Ok(position)
}

#[cfg(test)]
mod tests {
    use super::parse_verifier_symbolic_coordinate;

    #[test]
    fn symbolic_parser_matches_the_anuttara_skill_contract() {
        let parsed =
            parse_verifier_symbolic_coordinate("#R0-0/1/A-T7-pending?").expect("canonical parse");
        assert_eq!(parsed.namespace, "R");
        assert_eq!(parsed.coordinate, ["0", "0/1", "A-T7"]);
        assert_eq!(parsed.archetype_index, Some(7));
        assert_eq!(parsed.state_marker, "pending");
        assert_eq!(parsed.entry_state, "pending");
    }

    #[test]
    fn symbolic_parser_normalises_skill_states_for_the_console() {
        let parsed = parse_verifier_symbolic_coordinate("#R12-4/5/V-R9-contradiction?")
            .expect("canonical parse");
        assert_eq!(parsed.coordinate, ["12", "4/5", "V-R9"]);
        assert_eq!(parsed.archetype_index, None);
        assert_eq!(parsed.state_marker, "incoherent");
        assert_eq!(parsed.entry_state, "contradiction");
    }

    #[test]
    fn symbolic_parser_accepts_the_compiled_verifier_domain_tags() {
        let speech = parse_verifier_symbolic_coordinate("#R0-0/1/S-T3-unwitnessed?")
            .expect("compiled speech-layer question parses");
        assert_eq!(speech.coordinate, ["0", "0/1", "S-T3"]);
        assert_eq!(speech.archetype_index, None);
        assert_eq!(speech.state_marker, "unwitnessed");

        let relation = parse_verifier_symbolic_coordinate("#R1-0/1/R-T5-pending?")
            .expect("compiled relationship-layer question parses");
        assert_eq!(relation.coordinate, ["1", "0/1", "R-T5"]);
    }

    #[test]
    fn symbolic_parser_rejects_noncanonical_input() {
        assert!(parse_verifier_symbolic_coordinate("not-a-question").is_err());
        assert!(parse_verifier_symbolic_coordinate("#R65-0/1/A-T7-pending?").is_err());
        assert!(parse_verifier_symbolic_coordinate("#R0-0/6/A-T7-pending?").is_err());
        assert!(parse_verifier_symbolic_coordinate("#R0-0/1/A-T12-pending?").is_err());
    }
}
