use std::{fs::File, sync::OnceLock};
use std::io::Write;
use actix_files::Files;
use serde_json::Value;
use actix_web::{get, web::{self, ServiceConfig}, HttpResponse, Responder};

use tera::{Context, Error, Tera};
use serde::{Deserialize, Serialize};
use std::fs;
use shuttle_actix_web::ShuttleActixWeb;

#[derive(Deserialize, Serialize)]
struct Card {
    name: String,
    // autres champs selon besoin
}

#[derive(Deserialize)]
struct Query {
    q: String,
}
static COMPILED_TEMPLATE: OnceLock<Tera> = OnceLock::new();
// function to create the tera template, handling any errors and returning them to the caller
fn create_template() -> Result<Tera, Error> {
    let base_template =match Tera::new("templates/**/*"){
        Ok(t) => t,
        Err(e) => {
            eprintln!("Erreur lors de l'initialisation de Tera: {e}");
            panic!();
        }
    };
    Ok(base_template)
}

// function to build the Tera template, returns a Result type, where
// the Ok variant is the rendered template and the error is the Error type provided by Tera
fn get_template() -> Result<&'static Tera, Error> {
    let template = create_template()?;
    Ok(COMPILED_TEMPLATE.get_or_init(|| template))
}

// function which renders the Tera templates, returns a Result type, where
// the Ok variant is a string of HTML and the error is the Error type provided by Tera
// fn render_template() -> Result<String, Error> {
//     let mut context = Context::new();

//     get_template()?.render("index.html", &context)
// }
async fn index() -> impl Responder {
    let mut context = Context::new();
    context.insert("timestamp", &format!("{}", chrono::Utc::now().timestamp()));
    match get_template().expect("REASON").render("index.html", &context){
        Ok(rendered) => HttpResponse::Ok().content_type("text/html").body(rendered),
        Err(e) => {
            eprintln!("Erreur rendu template : {e}");
            HttpResponse::InternalServerError().body("Erreur de rendu template")
        }
    }
    // HttpResponse::Ok().content_type("text/html").body(s)
}
#[shuttle_runtime::main]
async fn main() -> ShuttleActixWeb<impl FnOnce(&mut ServiceConfig) + Send + Clone + 'static> {

    let config = move |cfg: &mut ServiceConfig| {

        cfg
        .app_data(create_template())
        .service(
            web::scope("")
                .service(Files::new("/static", "static"))
                .service(fetch_cards)
                .service(search)
                .route("/", web::get().to(index)),
        );
    };
    Ok(config.into())
}



#[get("/fetch_cards")]
async fn fetch_cards() -> impl Responder {
    // Exemple d'URL — à adapter selon ton API
    let url = "https://db.ygoprodeck.com/api/v7/cardinfo.php?language=fr";

    let response = match reqwest::get(url).await {
        Ok(resp) => match resp.json::<Value>().await {
            Ok(json) => json,
            Err(_) => return HttpResponse::InternalServerError().body("Erreur JSON"),
        },
        Err(_) => return HttpResponse::InternalServerError().body("Erreur de requête"),
    };

    // Sauvegarder le JSON dans un fichier
    match File::create("assets/cards.json") {
        Ok(mut file) => {
            if file.write_all(response.to_string().as_bytes()).is_err() {
                return HttpResponse::InternalServerError().body("Erreur d’écriture fichier");
            }
        }
        Err(_) => return HttpResponse::InternalServerError().body("Erreur de création fichier"),
    }

    HttpResponse::Ok().body("Cartes sauvegardées dans cards.json")
}

#[get("/search")]
async fn search(query: web::Query<Query>) -> impl Responder {
    if query.q.len() < 4 {
        return HttpResponse::BadRequest().body("Minimum 4 caractères");
    }
let empty_vec = &vec![];
let query_lower = query.q.to_lowercase();
    let file = fs::read_to_string("assets/cards.json").expect("Erreur lecture fichier");
    let json: serde_json::Value = serde_json::from_str(&file).expect("Erreur parsing JSON");

    let filtered: Vec<&serde_json::Value> = json["data"]
        .as_array()
        .unwrap_or(empty_vec)
        .iter()
        .filter(|card| {
            if let Some(name) = card["name"].as_str() {
                name.to_lowercase().contains(&query_lower)
            } else {
                false
            }
        })
        .collect();

    HttpResponse::Ok().json(filtered)
}