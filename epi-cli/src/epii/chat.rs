pub fn dispatch(prompt: Option<&str>) -> Result<String, String> {
    crate::agent::chat::run(None, prompt).map_err(|err| err.to_string())?;
    Ok(String::new())
}
