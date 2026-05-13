use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum Arcana {
    Major = 0,
    Minor = 1,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum Suit {
    Wands = 0,
    Cups = 1,
    Swords = 2,
    Pentacles = 3,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum Rank {
    Ace = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Page = 11,
    Knight = 12,
    Queen = 13,
    King = 14,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum Element {
    Fire = 0,
    Water = 1,
    Air = 2,
    Earth = 3,
}

#[derive(Clone, Debug, Serialize)]
pub struct TarotCard {
    pub id: u8,
    pub name: &'static str,
    pub arcana: Arcana,
    pub suit: Option<Suit>,
    pub rank: Option<Rank>,
    pub keywords: &'static [&'static str],
    pub element: Option<Element>,
    pub hebrew_letter: Option<&'static str>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TarotCast {
    pub cast_id: String,
    pub spread: TarotSpread,
    pub cards: Vec<DrawnCard>,
    pub origin: CastOrigin,
    pub timestamp: u64,
    pub kairos_snapshot: Option<serde_json::Value>,
    pub composed_quaternion_at_cast: [f32; 4],
    pub source_highlight_id: Option<String>,
    pub interpretation: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TarotSpread {
    Single,
    ThreeCard,
    CelticCross,
    Custom { name: String, positions: u8 },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DrawnCard {
    pub position: u8,
    pub position_meaning: String,
    pub card_id: u8,
    pub reversed: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum CastOrigin {
    LiveDraw,
    RandomnessEngine { seed: u64 },
}

pub fn get_card(id: u8) -> Option<&'static TarotCard> {
    if (id as usize) < RIDER_WAITE_DECK.len() {
        Some(&RIDER_WAITE_DECK[id as usize])
    } else {
        None
    }
}

pub fn cards_for_suit(suit: Suit) -> Vec<&'static TarotCard> {
    RIDER_WAITE_DECK
        .iter()
        .filter(|c| c.suit == Some(suit))
        .collect()
}

pub fn major_arcana() -> Vec<&'static TarotCard> {
    RIDER_WAITE_DECK
        .iter()
        .filter(|c| c.arcana == Arcana::Major)
        .collect()
}

pub static RIDER_WAITE_DECK: [TarotCard; 78] = [
    // === Major Arcana (0-21) ===
    TarotCard { id: 0, name: "The Fool", arcana: Arcana::Major, suit: None, rank: None, keywords: &["beginnings", "innocence", "spontaneity"], element: Some(Element::Air), hebrew_letter: Some("Aleph") },
    TarotCard { id: 1, name: "The Magician", arcana: Arcana::Major, suit: None, rank: None, keywords: &["manifestation", "resourcefulness", "power"], element: Some(Element::Air), hebrew_letter: Some("Beth") },
    TarotCard { id: 2, name: "The High Priestess", arcana: Arcana::Major, suit: None, rank: None, keywords: &["intuition", "mystery", "subconscious"], element: Some(Element::Water), hebrew_letter: Some("Gimel") },
    TarotCard { id: 3, name: "The Empress", arcana: Arcana::Major, suit: None, rank: None, keywords: &["fertility", "beauty", "nature"], element: Some(Element::Earth), hebrew_letter: Some("Daleth") },
    TarotCard { id: 4, name: "The Emperor", arcana: Arcana::Major, suit: None, rank: None, keywords: &["authority", "structure", "control"], element: Some(Element::Fire), hebrew_letter: Some("He") },
    TarotCard { id: 5, name: "The Hierophant", arcana: Arcana::Major, suit: None, rank: None, keywords: &["tradition", "conformity", "education"], element: Some(Element::Earth), hebrew_letter: Some("Vav") },
    TarotCard { id: 6, name: "The Lovers", arcana: Arcana::Major, suit: None, rank: None, keywords: &["love", "harmony", "relationships"], element: Some(Element::Air), hebrew_letter: Some("Zayin") },
    TarotCard { id: 7, name: "The Chariot", arcana: Arcana::Major, suit: None, rank: None, keywords: &["control", "willpower", "success"], element: Some(Element::Water), hebrew_letter: Some("Cheth") },
    TarotCard { id: 8, name: "Strength", arcana: Arcana::Major, suit: None, rank: None, keywords: &["courage", "patience", "compassion"], element: Some(Element::Fire), hebrew_letter: Some("Teth") },
    TarotCard { id: 9, name: "The Hermit", arcana: Arcana::Major, suit: None, rank: None, keywords: &["soul-searching", "introspection", "solitude"], element: Some(Element::Earth), hebrew_letter: Some("Yod") },
    TarotCard { id: 10, name: "Wheel of Fortune", arcana: Arcana::Major, suit: None, rank: None, keywords: &["cycles", "destiny", "turning point"], element: Some(Element::Fire), hebrew_letter: Some("Kaph") },
    TarotCard { id: 11, name: "Justice", arcana: Arcana::Major, suit: None, rank: None, keywords: &["fairness", "truth", "law"], element: Some(Element::Air), hebrew_letter: Some("Lamed") },
    TarotCard { id: 12, name: "The Hanged Man", arcana: Arcana::Major, suit: None, rank: None, keywords: &["pause", "surrender", "new perspective"], element: Some(Element::Water), hebrew_letter: Some("Mem") },
    TarotCard { id: 13, name: "Death", arcana: Arcana::Major, suit: None, rank: None, keywords: &["endings", "transformation", "transition"], element: Some(Element::Water), hebrew_letter: Some("Nun") },
    TarotCard { id: 14, name: "Temperance", arcana: Arcana::Major, suit: None, rank: None, keywords: &["balance", "moderation", "patience"], element: Some(Element::Fire), hebrew_letter: Some("Samekh") },
    TarotCard { id: 15, name: "The Devil", arcana: Arcana::Major, suit: None, rank: None, keywords: &["shadow", "attachment", "bondage"], element: Some(Element::Earth), hebrew_letter: Some("Ayin") },
    TarotCard { id: 16, name: "The Tower", arcana: Arcana::Major, suit: None, rank: None, keywords: &["upheaval", "revelation", "awakening"], element: Some(Element::Fire), hebrew_letter: Some("Pe") },
    TarotCard { id: 17, name: "The Star", arcana: Arcana::Major, suit: None, rank: None, keywords: &["hope", "faith", "rejuvenation"], element: Some(Element::Air), hebrew_letter: Some("Tsade") },
    TarotCard { id: 18, name: "The Moon", arcana: Arcana::Major, suit: None, rank: None, keywords: &["illusion", "fear", "subconscious"], element: Some(Element::Water), hebrew_letter: Some("Qoph") },
    TarotCard { id: 19, name: "The Sun", arcana: Arcana::Major, suit: None, rank: None, keywords: &["positivity", "warmth", "success"], element: Some(Element::Fire), hebrew_letter: Some("Resh") },
    TarotCard { id: 20, name: "Judgement", arcana: Arcana::Major, suit: None, rank: None, keywords: &["rebirth", "inner calling", "absolution"], element: Some(Element::Fire), hebrew_letter: Some("Shin") },
    TarotCard { id: 21, name: "The World", arcana: Arcana::Major, suit: None, rank: None, keywords: &["completion", "integration", "accomplishment"], element: Some(Element::Earth), hebrew_letter: Some("Tav") },
    // === Wands (22-35) ===
    TarotCard { id: 22, name: "Ace of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Ace), keywords: &["inspiration", "new opportunities"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 23, name: "Two of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Two), keywords: &["planning", "decisions"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 24, name: "Three of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Three), keywords: &["progress", "expansion"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 25, name: "Four of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Four), keywords: &["celebration", "harmony"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 26, name: "Five of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Five), keywords: &["conflict", "competition"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 27, name: "Six of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Six), keywords: &["victory", "recognition"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 28, name: "Seven of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Seven), keywords: &["challenge", "perseverance"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 29, name: "Eight of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Eight), keywords: &["speed", "movement"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 30, name: "Nine of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Nine), keywords: &["resilience", "courage"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 31, name: "Ten of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Ten), keywords: &["burden", "responsibility"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 32, name: "Page of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Page), keywords: &["exploration", "excitement"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 33, name: "Knight of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Knight), keywords: &["energy", "passion"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 34, name: "Queen of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::Queen), keywords: &["confidence", "determination"], element: Some(Element::Fire), hebrew_letter: None },
    TarotCard { id: 35, name: "King of Wands", arcana: Arcana::Minor, suit: Some(Suit::Wands), rank: Some(Rank::King), keywords: &["leadership", "vision"], element: Some(Element::Fire), hebrew_letter: None },
    // === Cups (36-49) ===
    TarotCard { id: 36, name: "Ace of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Ace), keywords: &["love", "new feelings"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 37, name: "Two of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Two), keywords: &["partnership", "unity"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 38, name: "Three of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Three), keywords: &["celebration", "friendship"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 39, name: "Four of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Four), keywords: &["contemplation", "apathy"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 40, name: "Five of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Five), keywords: &["loss", "grief"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 41, name: "Six of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Six), keywords: &["nostalgia", "reunion"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 42, name: "Seven of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Seven), keywords: &["fantasy", "choices"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 43, name: "Eight of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Eight), keywords: &["departure", "withdrawal"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 44, name: "Nine of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Nine), keywords: &["satisfaction", "wishes fulfilled"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 45, name: "Ten of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Ten), keywords: &["harmony", "happiness"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 46, name: "Page of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Page), keywords: &["creative opportunity", "curiosity"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 47, name: "Knight of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Knight), keywords: &["romance", "charm"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 48, name: "Queen of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::Queen), keywords: &["compassion", "calm"], element: Some(Element::Water), hebrew_letter: None },
    TarotCard { id: 49, name: "King of Cups", arcana: Arcana::Minor, suit: Some(Suit::Cups), rank: Some(Rank::King), keywords: &["emotional balance", "diplomacy"], element: Some(Element::Water), hebrew_letter: None },
    // === Swords (50-63) ===
    TarotCard { id: 50, name: "Ace of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Ace), keywords: &["clarity", "breakthrough"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 51, name: "Two of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Two), keywords: &["indecision", "stalemate"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 52, name: "Three of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Three), keywords: &["heartbreak", "sorrow"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 53, name: "Four of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Four), keywords: &["rest", "recovery"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 54, name: "Five of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Five), keywords: &["conflict", "defeat"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 55, name: "Six of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Six), keywords: &["transition", "moving on"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 56, name: "Seven of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Seven), keywords: &["deception", "strategy"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 57, name: "Eight of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Eight), keywords: &["restriction", "self-imposed"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 58, name: "Nine of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Nine), keywords: &["anxiety", "worry"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 59, name: "Ten of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Ten), keywords: &["painful ending", "rock bottom"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 60, name: "Page of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Page), keywords: &["curiosity", "restlessness"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 61, name: "Knight of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Knight), keywords: &["ambition", "action"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 62, name: "Queen of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::Queen), keywords: &["independence", "unbiased"], element: Some(Element::Air), hebrew_letter: None },
    TarotCard { id: 63, name: "King of Swords", arcana: Arcana::Minor, suit: Some(Suit::Swords), rank: Some(Rank::King), keywords: &["intellectual", "authority"], element: Some(Element::Air), hebrew_letter: None },
    // === Pentacles (64-77) ===
    TarotCard { id: 64, name: "Ace of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Ace), keywords: &["opportunity", "prosperity"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 65, name: "Two of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Two), keywords: &["balance", "adaptability"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 66, name: "Three of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Three), keywords: &["teamwork", "mastery"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 67, name: "Four of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Four), keywords: &["security", "control"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 68, name: "Five of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Five), keywords: &["hardship", "insecurity"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 69, name: "Six of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Six), keywords: &["generosity", "sharing"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 70, name: "Seven of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Seven), keywords: &["patience", "long-term view"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 71, name: "Eight of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Eight), keywords: &["diligence", "mastery"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 72, name: "Nine of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Nine), keywords: &["abundance", "luxury"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 73, name: "Ten of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Ten), keywords: &["wealth", "inheritance"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 74, name: "Page of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Page), keywords: &["ambition", "desire"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 75, name: "Knight of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Knight), keywords: &["efficiency", "routine"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 76, name: "Queen of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::Queen), keywords: &["nurturing", "practical"], element: Some(Element::Earth), hebrew_letter: None },
    TarotCard { id: 77, name: "King of Pentacles", arcana: Arcana::Minor, suit: Some(Suit::Pentacles), rank: Some(Rank::King), keywords: &["abundance", "discipline"], element: Some(Element::Earth), hebrew_letter: None },
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deck_has_78_cards() {
        assert_eq!(RIDER_WAITE_DECK.len(), 78);
    }

    #[test]
    fn major_arcana_count() {
        assert_eq!(major_arcana().len(), 22);
    }

    #[test]
    fn each_suit_has_14_cards() {
        for suit in [Suit::Wands, Suit::Cups, Suit::Swords, Suit::Pentacles] {
            assert_eq!(cards_for_suit(suit).len(), 14);
        }
    }

    #[test]
    fn card_lookup() {
        assert_eq!(get_card(0).unwrap().name, "The Fool");
        assert_eq!(get_card(21).unwrap().name, "The World");
        assert!(get_card(78).is_none());
    }
}
