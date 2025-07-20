use actix_web::{get, web, HttpResponse, Responder};
use tera::Context;
use crate::models::Query;
use crate::templates::get_template;
use crate::services;

pub async fn index() -> impl Responder {
    let mut context = Context::new();
    context.insert("timestamp", &format!("{}", chrono::Utc::now().timestamp()));
    match get_template().expect("REASON").render("index.html", &context){
        Ok(rendered) => HttpResponse::Ok().content_type("text/html").body(rendered),
        Err(e) => {
            eprintln!("Erreur rendu template : {e}");
            HttpResponse::InternalServerError().body("Erreur de rendu template")
        }
    }
}

#[get("/fetch_cards")]
pub async fn fetch_cards() -> impl Responder {
    let url = "https://db.ygoprodeck.com/api/v7/cardinfo.php?language=fr";
    match services::fetch_cards_from_api(url).await {
        Ok(json) => {
            if let Err(e) = services::save_cards_to_file(&json, "assets/cards.json") {
                return HttpResponse::InternalServerError().body(e);
            }
            HttpResponse::Ok().body("Cartes sauvegardées dans cards.json")
        }
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

// Version pure du handler search, à utiliser dans les tests et dans la macro route
pub async fn search_handler(query: web::Query<Query>) -> impl Responder {
    if query.q.len() < 4 {
        return HttpResponse::BadRequest().body("Minimum 4 caractères");
    }
    match services::load_cards_from_file("assets/cards.json") {
        Ok(json) => {
            let filtered: Vec<serde_json::Value> = services::filter_cards(&json, &query.q);
            HttpResponse::Ok().json(filtered)
        }
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

#[get("/search")]
pub async fn search(query: web::Query<Query>) -> impl Responder {
    search_handler(query).await
} 