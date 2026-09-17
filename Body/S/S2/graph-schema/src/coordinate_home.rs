use serde::Serialize;
use std::fmt;
use std::ops::Deref;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum CoordinateHome {
    Root,
    C,
    C0,
    C0ThroughC5,
    C1,
    C2,
    C2Prime,
    C3,
    C3Prime,
    C4,
    C4SlashL,
    C4SlashLPrime,
    C5,
    C5Prime,
    CF,
    L,
    L2,
    L2Prime,
    L3Prime,
    L4,
    L5,
    M,
    MCompat,
    M0Prime,
    M1Prime,
    M2Prime,
    M3Prime,
    M4Prime,
    M5,
    M5Prime,
    P,
    P1,
    P2,
    P3,
    Q,
    Q1,
    Q2,
    Q3,
    Q4,
    Q5,
    S,
    S0,
    S0_4,
    S0_5,
    S1_0,
    S1_0Prime,
    S1_1,
    S1_1Prime,
    S1_2,
    S1_4,
    S1_4Prime,
    S1Compat,
    S1SlashS2,
    S2,
    S2_0,
    S2_1,
    S2_3,
    S2_3Prime,
    S2_4,
    S2_4Prime,
    S2_5,
    S2Compat,
    S3_0,
    S3_5,
    S4,
    S4_0,
    S4Prime,
    S5,
    S5Prime,
    T,
    T1,
    T3,
    T5,
    VAK,
}

impl CoordinateHome {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Root => "#",
            Self::C => "C",
            Self::C0 => "C0",
            Self::C0ThroughC5 => "C0..C5",
            Self::C1 => "C1",
            Self::C2 => "C2",
            Self::C2Prime => "C2'",
            Self::C3 => "C3",
            Self::C3Prime => "C3'",
            Self::C4 => "C4",
            Self::C4SlashL => "C4/L",
            Self::C4SlashLPrime => "C4/L'",
            Self::C5 => "C5",
            Self::C5Prime => "C5'",
            Self::CF => "CF",
            Self::L => "L",
            Self::L2 => "L2",
            Self::L2Prime => "L2'",
            Self::L3Prime => "L3'",
            Self::L4 => "L4",
            Self::L5 => "L5",
            Self::M => "M",
            Self::MCompat => "M.compat",
            Self::M0Prime => "M0'",
            Self::M1Prime => "M1'",
            Self::M2Prime => "M2'",
            Self::M3Prime => "M3'",
            Self::M4Prime => "M4'",
            Self::M5 => "M5",
            Self::M5Prime => "M5'",
            Self::P => "P",
            Self::P1 => "P1",
            Self::P2 => "P2",
            Self::P3 => "P3",
            Self::Q => "Q",
            Self::Q1 => "Q1",
            Self::Q2 => "Q2",
            Self::Q3 => "Q3",
            Self::Q4 => "Q4",
            Self::Q5 => "Q5",
            Self::S => "S",
            Self::S0 => "S0",
            Self::S0_4 => "S0-4",
            Self::S0_5 => "S0-5",
            Self::S1_0 => "S1-0",
            Self::S1_0Prime => "S1-0'",
            Self::S1_1 => "S1-1",
            Self::S1_1Prime => "S1-1'",
            Self::S1_2 => "S1-2",
            Self::S1_4 => "S1-4",
            Self::S1_4Prime => "S1-4'",
            Self::S1Compat => "S1.compat",
            Self::S1SlashS2 => "S1/S2",
            Self::S2 => "S2",
            Self::S2_0 => "S2-0",
            Self::S2_1 => "S2-1",
            Self::S2_3 => "S2-3",
            Self::S2_3Prime => "S2-3'",
            Self::S2_4 => "S2-4",
            Self::S2_4Prime => "S2-4'",
            Self::S2_5 => "S2-5",
            Self::S2Compat => "S2.compat",
            Self::S3_0 => "S3-0",
            Self::S3_5 => "S3-5",
            Self::S4 => "S4",
            Self::S4_0 => "S4.0",
            Self::S4Prime => "S4'",
            Self::S5 => "S5",
            Self::S5Prime => "S5'",
            Self::T => "T",
            Self::T1 => "T1",
            Self::T3 => "T3",
            Self::T5 => "T5",
            Self::VAK => "VAK",
        }
    }
}

impl Serialize for CoordinateHome {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.as_str())
    }
}

impl fmt::Display for CoordinateHome {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_str())
    }
}

impl Deref for CoordinateHome {
    type Target = str;

    fn deref(&self) -> &Self::Target {
        self.as_str()
    }
}

impl PartialEq<&str> for CoordinateHome {
    fn eq(&self, other: &&str) -> bool {
        self.as_str() == *other
    }
}

impl PartialEq<CoordinateHome> for &str {
    fn eq(&self, other: &CoordinateHome) -> bool {
        *self == other.as_str()
    }
}
