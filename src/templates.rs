use tera::{Tera, Error};
use std::sync::OnceLock;

static COMPILED_TEMPLATE: OnceLock<Tera> = OnceLock::new();

pub fn create_template() -> Result<Tera, Error> {
    let base_template = match Tera::new("templates/**/*") {
        Ok(t) => t,
        Err(e) => {
            eprintln!("Erreur lors de l'initialisation de Tera: {e}");
            panic!();
        }
    };
    Ok(base_template)
}

pub fn get_template() -> Result<&'static Tera, Error> {
    let template = create_template()?;
    Ok(COMPILED_TEMPLATE.get_or_init(|| template))
} 