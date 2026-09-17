//! GENERATED from Neo4j 5.26.21 `org.neo4j.internal.codec.ShortStringCodec` via
//! `DumpCodecs.java` (reflection over the shipped jar). Do not hand-edit: the
//! tables are the vendor's own decode tables, extracted rather than remembered.
//!
//! Each entry is (codec id, bits per character, decode table indexed by code).

pub struct ShortStringCodec {
    pub name: &'static str,
    pub id: u8,
    pub step: u8,
    pub table: &'static [u8],
}

pub const CODECS: &[ShortStringCodec] = &[
    ShortStringCodec {
        name: "NUMERICAL",
        id: 1,
        step: 4,
        table: &[48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 32, 46, 45, 43, 44, 39],
    },
    ShortStringCodec {
        name: "DATE",
        id: 2,
        step: 4,
        table: &[48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 32, 45, 58, 47, 43, 44],
    },
    ShortStringCodec {
        name: "UPPER",
        id: 3,
        step: 5,
        table: &[32, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 95, 46, 45, 58, 47],
    },
    ShortStringCodec {
        name: "LOWER",
        id: 4,
        step: 5,
        table: &[32, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 95, 46, 45, 58, 47],
    },
    ShortStringCodec {
        name: "EMAIL",
        id: 5,
        step: 5,
        table: &[44, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 95, 46, 45, 43, 64],
    },
    ShortStringCodec {
        name: "URI",
        id: 6,
        step: 6,
        table: &[32, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 95, 46, 45, 58, 47, 43, 44, 39, 64, 124, 59, 42, 63, 38, 37, 35, 40, 41, 36, 60, 62, 61],
    },
    ShortStringCodec {
        name: "ALPHANUM",
        id: 7,
        step: 6,
        table: &[32, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 48, 49, 50, 51, 52, 95, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 53, 54, 55, 56, 57],
    },
    ShortStringCodec {
        name: "ALPHASYM",
        id: 8,
        step: 6,
        table: &[32, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 95, 46, 45, 58, 47, 59, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 43, 44, 39, 64, 124],
    },
    ShortStringCodec {
        name: "EUROPEAN",
        id: 9,
        step: 7,
        table: &[192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 46, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 45, 248, 249, 250, 251, 252, 253, 254, 255, 32, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 48, 49, 50, 51, 52, 95, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 53, 54, 55, 56, 57],
    },
    ShortStringCodec {
        name: "LOWERHEX",
        id: 11,
        step: 4,
        table: &[48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102],
    },
    ShortStringCodec {
        name: "UPPERHEX",
        id: 12,
        step: 4,
        table: &[48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70],
    },
];

/// `ShortStringCodec.ENCODING_UTF8`
pub const ENCODING_UTF8: u8 = 0;
/// `ShortStringCodec.ENCODING_LATIN1`
pub const ENCODING_LATIN1: u8 = 10;
/// `LongerShortString.HEADER_SIZE` — key(24) + type(4) + encoding(5) + length(6).
pub const SHORT_STRING_HEADER_BITS: u32 = 39;

pub fn codec_by_id(id: u8) -> Option<&'static ShortStringCodec> {
    CODECS.iter().find(|c| c.id == id)
}
