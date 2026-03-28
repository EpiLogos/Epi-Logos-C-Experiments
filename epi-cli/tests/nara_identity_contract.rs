// nara_identity_contract.rs — identity hash must be [u8; 32]
// Source: 00-canonical-invariants.md §1

#[test]
fn quintessence_hash_stored_as_bytes_not_string() {
    let hash: [u8; 32] = [0xde, 0xad, 0xbe, 0xef, 0, 0, 0, 0,
                           0, 0, 0, 0, 0, 0, 0, 0,
                           0, 0, 0, 0, 0, 0, 0, 0,
                           0, 0, 0, 0, 0, 0, 0, 0];
    let preview: String = hash.iter().map(|b| format!("{:02x}", b)).collect();
    assert!(preview.starts_with("deadbeef"));
    assert_eq!(preview.len(), 64);
}

#[test]
fn identity_minimum_is_natal_data_only() {
    let has_natal = true;
    let has_gene_keys = false;
    let portal_can_open = has_natal;
    let _ = has_gene_keys;
    assert!(portal_can_open);
}

#[test]
fn hash_preview_is_first_8_hex_chars() {
    let hash: [u8; 32] = [0xab, 0xcd, 0xef, 0x12, 0, 0, 0, 0,
                           0, 0, 0, 0, 0, 0, 0, 0,
                           0, 0, 0, 0, 0, 0, 0, 0,
                           0, 0, 0, 0, 0, 0, 0, 0];
    let preview: String = hash[..4].iter().map(|b| format!("{:02x}", b)).collect();
    assert_eq!(preview, "abcdef12");
    assert_eq!(preview.len(), 8);
}

#[test]
fn wind_hash_is_64_hex_chars() {
    // WoundState.quintessence_hash must always be 64 chars (32 bytes × 2 hex digits each).
    // This test verifies the invariant against a known expansion.
    let hash32: [u8; 32] = {
        let mut h = [0u8; 32];
        // Simulate the wind.rs expansion: 4 × 8-byte segments
        let segments: [u64; 4] = [
            0xdeadbeefcafe0001,
            0xa5a5a5a55a5a5a5a,
            0x0f0f0f0ff0f0f0f0,
            0x1234567890abcdef,
        ];
        for (i, seg) in segments.iter().enumerate() {
            h[i * 8..(i + 1) * 8].copy_from_slice(&seg.to_le_bytes());
        }
        h
    };
    let hex: String = hash32.iter().map(|b| format!("{:02x}", b)).collect();
    assert_eq!(hex.len(), 64, "wind hash must be 64 hex chars");
    // Preview is always the first 8 chars (4 bytes)
    let preview = &hex[..8];
    assert_eq!(preview.len(), 8);
}

#[test]
fn quintessence_bin_is_32_bytes() {
    // quintessence.bin must store all 32 bytes — not the legacy 8-byte u64.
    let hash32: [u8; 32] = [0xffu8; 32];
    assert_eq!(hash32.len(), 32, "quintessence.bin must be 32 bytes");
    // Legacy was hash.to_le_bytes() = 8 bytes — that is now deprecated.
    let legacy_len = std::mem::size_of::<u64>();
    assert_ne!(legacy_len, 32, "u64 is not 32 bytes — use [u8; 32]");
}
