use yugi_analyzer::handlers::{index};
use yugi_analyzer::models::Query;
use actix_web::{test, web, App};
use actix_web::Responder;

/// Teste le handler index (rendu de la page d'accueil)
#[actix_web::test]
async fn test_index_handler() {
    let resp = index().await.respond_to(&test::TestRequest::default().to_http_request());
    assert_eq!(resp.status(), 200, "La page d'accueil doit répondre 200 OK");
}

// Le handler search ne peut pas être testé directement ici car il est transformé en service Actix par l'attribut #[get].
// Pour le tester, il faut écrire un test d'intégration dans le dossier tests/ ou extraire la logique dans une fonction pure testable.
// #[actix_web::test]
// async fn test_search_handler_short_query() {
//     let query = Query { q: "abc".to_string() };
//     let req = test::TestRequest::default().to_http_request();
//     let resp = search(web::Query(query)).await.respond_to(&req);
//     assert_eq!(resp.status(), 400, "Une requête trop courte doit répondre 400 Bad Request");
// } 