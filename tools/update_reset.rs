use std::fs;

fn main() {
    // 1. Récupérer les infos dynamiques
    let cargo_toml = fs::read_to_string("Cargo.toml").unwrap_or_default();
    let main_rs = fs::read_to_string("src/main.rs").unwrap_or_default();

    // Dépendances principales (extraction simple)
    let deps: Vec<_> = cargo_toml
        .lines()
        .filter(|l| !l.trim().is_empty() && !l.starts_with('['))
        .filter(|l| l.contains('='))
        .map(|l| l.trim().to_string())
        .collect();

    // Routes principales (extraction simple)
    let routes: Vec<_> = main_rs
        .lines()
        .filter(|l| l.contains("#[get") || l.contains("route("))
        .map(|l| l.trim().to_string())
        .collect();

    // 2. Générer le texte contextuel
    let prompt = format!(
"Voici le projet yugi-analyzer, une application web écrite en Rust, destinée à l’analyse et la recherche de cartes Yu-Gi-Oh! via une interface web moderne. Le projet est conçu pour être déployé sur Shuttle et vise à offrir un service public fiable, maintenable et évolutif.

Contexte actuel du projet :

- Objectif : Permettre la recherche, l’affichage et la gestion de cartes Yu-Gi-Oh! via une interface web, avec des données issues de l’API ygoprodeck et stockées localement.
- Backend :
  - Rust (actix-web, Tera, Shuttle)
  - src/main.rs : point d’entrée, routes, logique métier
  - Dépendances principales :
    {}
- Frontend :
  - static/script.js : logique JS principale
  - static/style.css : styles principaux
  - static/js/ : scripts additionnels
- Templates :
  - templates/index.html : page d’accueil
  - templates/deck.html : (prévu pour gestion de decks)
  - templates/components/ : composants HTML réutilisables
- Données :
  - assets/cards.json : base locale des cartes Yu-Gi-Oh!
- CI/CD :
  - .github/workflows/shuttle.yml : déploiement automatique sur Shuttle (project-id dans Shuttle.toml)
- Qualité :
  - .githooks/pre-commit : lint (clippy) et tests automatiques avant chaque commit

- Routes principales :
    {}

- Vision : Rendre le service public, pro, maintenable, évolutif, et agréable à utiliser pour la communauté Yu-Gi-Oh! francophone et au-delà.

Instructions IA :
Mets à jour le fichier reset_context.txt pour qu’il reflète fidèlement l’état actuel du projet, en synthétisant les objectifs, la structure, les dépendances, les routes, les fonctionnalités, l’organisation du code, et la vision. Supprime toute information obsolète, complète les évolutions récentes si possible, et veille à ce que ce fichier serve toujours de référence à jour pour réinitialiser le contexte du projet lors de futures conversations ou collaborations.

Génère le nouveau contenu complet et prêt à remplacer l’ancien reset_context.txt.
",
        deps.iter().map(|d| format!("- {}", d)).collect::<Vec<_>>().join("\n    "),
        routes.iter().map(|r| format!("- {}", r)).collect::<Vec<_>>().join("\n    ")
    );

    // 3. Écrire dans update_reset.txt
    fs::write("update_reset.txt", prompt).unwrap();
}