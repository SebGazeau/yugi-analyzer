use yugi_analyzer::{templates, handlers};
use actix_files::Files;
use actix_web::web::ServiceConfig;
use shuttle_actix_web::ShuttleActixWeb;
use templates::create_template;
use handlers::{index, fetch_cards, search};

#[shuttle_runtime::main]
async fn main() -> ShuttleActixWeb<impl FnOnce(&mut ServiceConfig) + Send + Clone + 'static> {
    let config = move |cfg: &mut ServiceConfig| {
        cfg
            .app_data(create_template())
            .service(
                actix_web::web::scope("")
                    .service(Files::new("/static", "static"))
                    .service(fetch_cards)
                    .service(search)
                    .route("/", actix_web::web::get().to(index)),
            );
    };
    Ok(config.into())
}