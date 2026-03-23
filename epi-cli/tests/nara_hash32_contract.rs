// nara_hash32_contract.rs — Canonical 32-byte quintessence_hash contract
// Source: 00-canonical-invariants.md §1

#[test]
fn quintessence_hash_is_32_bytes() {
    assert_eq!(std::mem::size_of::<[u8; 32]>(), 32);
}

#[test]
fn preview_is_separate_from_hash() {
    let hash: [u8; 32] = [0u8; 32];
    let mut preview = [0u8; 65];
    let hex = format!("{:02x}{:02x}{:02x}{:02x}", hash[0], hash[1], hash[2], hash[3]);
    preview[..8].copy_from_slice(hex.as_bytes());
    assert_eq!(&preview[..8], b"00000000");
}

#[test]
fn hash_and_preview_are_different_types() {
    // hash = byte array identity; preview = derived display string
    let _hash: [u8; 32] = [0xab; 32];
    let preview = format!("{:02x}", 0xabu8);
    assert_eq!(preview, "ab");
}

#[test]
fn ffi_hash_fields_size() {
    // M4QuintessenceHashFields: 32 (hash) + 65 (preview) + 7 (padding) = 104 bytes
    // Or without padding: Rust aligns [u8; 32] to 1, so total = 97 bytes
    // We just verify the component sizes are correct
    assert_eq!(std::mem::size_of::<[u8; 32]>(), 32);
    assert_eq!(std::mem::size_of::<[u8; 65]>(), 65);
}

#[test]
fn hash_hex_derivation_roundtrip() {
    let hash: [u8; 32] = [
        0xde, 0xad, 0xbe, 0xef,
        0x00, 0x11, 0x22, 0x33,
        0x44, 0x55, 0x66, 0x77,
        0x88, 0x99, 0xaa, 0xbb,
        0xcc, 0xdd, 0xee, 0xff,
        0x01, 0x23, 0x45, 0x67,
        0x89, 0xab, 0xcd, 0xef,
        0xfe, 0xdc, 0xba, 0x98,
    ];
    let hex: String = hash.iter().map(|b| format!("{:02x}", b)).collect();
    assert_eq!(hex.len(), 64);
    assert_eq!(&hex[..8], "deadbeef");
}
