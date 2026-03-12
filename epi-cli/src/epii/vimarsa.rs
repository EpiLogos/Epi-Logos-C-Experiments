pub fn dispatch(cmd: &crate::vimarsa::VimarsaCmd) -> Result<String, String> {
    crate::vimarsa::dispatch(cmd);
    Ok(String::new())
}
