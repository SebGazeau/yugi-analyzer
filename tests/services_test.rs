use yugi_analyzer::services::*;
use serde_json::json;

/// Teste la récupération de cartes depuis une API fictive (mock ou URL invalide)
#[tokio::test]
async fn test_fetch_cards_from_api_failure() {
    // On teste une URL qui ne répond pas pour vérifier la gestion d'erreur
    let result = fetch_cards_from_api("http://localhost:12345/404").await;
    assert!(result.is_err(), "L'appel à une mauvaise URL doit échouer");
}

/// Teste la sauvegarde et la lecture d'un fichier JSON
#[test]
fn test_save_and_load_cards_to_file() {
    let json = json!({"data": [{"name": "Dark Magician"} ]});
    let path = "assets/test_cards.json";
    // Sauvegarde
    assert!(save_cards_to_file(&json, path).is_ok(), "La sauvegarde doit réussir");
    // Lecture
    let loaded = load_cards_from_file(path).expect("Lecture du fichier");
    assert_eq!(loaded["data"][0]["name"], "Dark Magician");
    // Nettoyage
    std::fs::remove_file(path).unwrap();
}

/// Teste le filtrage des cartes par nom (cas positif)
#[test]
fn test_filter_cards_found() {
    let json = json!({"data": [
        {"name": "Blue-Eyes White Dragon"},
        {"name": "Dark Magician"}
    ]});
    let result = filter_cards(&json, "blue-eyes");
    assert_eq!(result.len(), 1, "Une seule carte doit correspondre");
    assert_eq!(result[0]["name"], "Blue-Eyes White Dragon");
}

/// Teste le filtrage des cartes par nom (aucun résultat)
#[test]
fn test_filter_cards_not_found() {
    let json = json!({"data": [
        {"name": "Blue-Eyes White Dragon"},
        {"name": "Dark Magician"}
    ]});
    let result = filter_cards(&json, "Red-Eyes");
    assert!(result.is_empty(), "Aucune carte ne doit correspondre");
} 