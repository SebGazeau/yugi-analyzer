use yugi_analyzer::models::*;
use yugi_analyzer::models::{Card, Query};
use serde_json;

/// Teste la sérialisation et désérialisation de la struct Card
#[test]
fn test_card_serde() {
    let card = Card { name: "Blue-Eyes White Dragon".to_string() };
    // Sérialisation
    let json = serde_json::to_string(&card).expect("Sérialisation Card");
    // Désérialisation
    let card2: Card = serde_json::from_str(&json).expect("Désérialisation Card");
    assert_eq!(card.name, card2.name, "Le nom doit être conservé après (de)sérialisation");
}

/// Teste la désérialisation de la struct Query
#[test]
fn test_query_deserialize() {
    let json = r#"{ "q": "test" }"#;
    let query: Query = serde_json::from_str(json).expect("Désérialisation Query");
    assert_eq!(query.q, "test", "Le champ q doit être correctement désérialisé");
} 