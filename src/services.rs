use serde_json::Value;
use std::fs;
use std::fs::File;
use std::io::Write;

pub async fn fetch_cards_from_api(api_url: &str) -> Result<Value, String> {
    let response = reqwest::get(api_url).await.map_err(|_| "Erreur de requête".to_string())?;
    let json = response.json::<Value>().await.map_err(|_| "Erreur JSON".to_string())?;
    Ok(json)
}

pub fn save_cards_to_file(json: &Value, path: &str) -> Result<(), String> {
    let mut file = File::create(path).map_err(|_| "Erreur de création fichier".to_string())?;
    file.write_all(json.to_string().as_bytes()).map_err(|_| "Erreur d’écriture fichier".to_string())?;
    Ok(())
}

pub fn load_cards_from_file(path: &str) -> Result<Value, String> {
    let file = fs::read_to_string(path).map_err(|_| "Erreur lecture fichier".to_string())?;
    let json: Value = serde_json::from_str(&file).map_err(|_| "Erreur parsing JSON".to_string())?;
    Ok(json)
}

pub fn filter_cards(json: &Value, query: &str) -> Vec<Value> {
    let query_lower = query.to_lowercase();
    json["data"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .filter(|card| {
            if let Some(name) = card["name"].as_str() {
                name.to_lowercase().contains(&query_lower)
            } else {
                false
            }
        })
        .cloned()
        .collect()
} 