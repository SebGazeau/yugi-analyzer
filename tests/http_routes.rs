use actix_web::{test, web, App};
use yugi_analyzer::handlers::{index, search_handler};

#[actix_web::test]
async fn test_index_route() {
    // Teste la route GET /
    let app = test::init_service(
        App::new().route("/", web::get().to(index))
    ).await;

    let req = test::TestRequest::get().uri("/").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success(), "La route / doit répondre 200 OK");
}

#[actix_web::test]
async fn test_search_route_short_query() {
    // Teste la route GET /search avec une requête trop courte
    let app = test::init_service(
        App::new().route("/search", web::get().to(search_handler))
    ).await;

    let req = test::TestRequest::get().uri("/search?q=abc").to_request();
    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 400, "Une requête trop courte doit répondre 400 Bad Request");
} 