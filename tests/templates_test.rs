use yugi_analyzer::templates::*;
use yugi_analyzer::templates::create_template;

/// Teste la création du moteur de templates Tera
#[test]
fn test_create_template() {
    let tera = create_template().expect("Création du moteur Tera");
    assert!(tera.get_template_names().count() > 0, "Il doit y avoir au moins un template chargé");
}

/// Teste le rendu d'un template existant (index.html)
#[test]
fn test_render_index_template() {
    let tera = create_template().expect("Création du moteur Tera");
    let mut context = tera::Context::new();
    context.insert("timestamp", &"1234567890");
    let rendered = tera.render("index.html", &context);
    assert!(rendered.is_ok(), "Le rendu du template index.html doit réussir");
} 