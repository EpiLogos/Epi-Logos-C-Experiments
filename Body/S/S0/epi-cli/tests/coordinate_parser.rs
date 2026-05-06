use epi_logos::graph::coordinate_array_parser::{CoordLayer, CoordinateArrayParser};

#[test]
fn test_parse_all_psychoids() {
    for i in 0..=5 {
        let coord = format!("#{}", i);
        let p = CoordinateArrayParser::parse_one(&coord).unwrap();
        assert_eq!(p.layer, CoordLayer::Psychoid);
        assert_eq!(p.ql_position, Some(i));
    }
}

#[test]
fn test_parse_all_families() {
    for fam in &["C", "P", "L", "S", "T", "M"] {
        for pos in 0..=5 {
            // Normal
            let coord = format!("{}{}", fam, pos);
            let p = CoordinateArrayParser::parse_one(&coord).unwrap();
            assert_eq!(p.layer, CoordLayer::Family);
            assert_eq!(p.family.as_deref(), Some(*fam));
            assert_eq!(p.ql_position, Some(pos));
            assert!(!p.inverted);

            // Inverted
            let coord_inv = format!("{}{}'", fam, pos);
            let p_inv = CoordinateArrayParser::parse_one(&coord_inv).unwrap();
            assert!(p_inv.inverted);
            assert_eq!(p_inv.coordinate, coord_inv);
        }
    }
}

#[test]
fn test_parse_all_context_frames() {
    let cfs = [
        "CF_VOID",
        "CF_BINARY",
        "CF_TRIKA",
        "CF_QUATERNAL",
        "CF_FRACTAL",
        "CF_SYNTHESIS",
        "CF_MOBIUS",
    ];
    for (i, cf) in cfs.iter().enumerate() {
        let p = CoordinateArrayParser::parse_one(cf).unwrap();
        assert_eq!(p.layer, CoordLayer::ContextFrame);
        assert_eq!(p.ql_position, Some(i as u8));
    }
}

#[test]
fn test_parse_all_vak() {
    let vaks = ["CPF", "CT", "CP", "CF", "CFP", "CS"];
    for (i, vak) in vaks.iter().enumerate() {
        let p = CoordinateArrayParser::parse_one(vak).unwrap();
        assert_eq!(p.layer, CoordLayer::Vak);
        assert_eq!(p.ql_position, Some(i as u8));
    }
}

#[test]
fn test_wikilink_extraction_complex() {
    let content = r#"
---
c_0_ground: "[[Bimba/Seeds/C/C0|Bimba]]"
p_3_pattern: "See [[P3]] and [[Bimba/Seeds/P/P3|Pattern]]"
---
Body with [[M4|Nara]] reference and [[#4]] link.
"#;
    let links = CoordinateArrayParser::extract_wikilinks(content);
    assert_eq!(links.len(), 5);
}

#[test]
fn test_frontmatter_array_parsing() {
    let yaml_str = r#"
coordinate: "M4"
ql_position: 4
family: "M"
c_0_ground: "[[Bimba/Seeds/C/C0|Bimba]]"
p_3_pattern: "[[P3|Pattern]]"
t_5_insight:
  - "[[T5|Insight]]"
  - "[[Bimba/Seeds/T/T5]]"
name: "Nara"
"#;
    let yaml: serde_yaml::Value = serde_yaml::from_str(yaml_str).unwrap();
    let arrays = CoordinateArrayParser::parse_frontmatter_arrays(&yaml);
    assert_eq!(arrays.len(), 3);

    // Verify key names
    let keys: Vec<&str> = arrays.iter().map(|(k, _)| k.as_str()).collect();
    assert!(keys.contains(&"c_0_ground"));
    assert!(keys.contains(&"p_3_pattern"));
    assert!(keys.contains(&"t_5_insight"));
}
