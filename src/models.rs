use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Card {
    pub name: String,
    // autres champs selon besoin
}

#[derive(Deserialize)]
pub struct Query {
    pub q: String,
} 