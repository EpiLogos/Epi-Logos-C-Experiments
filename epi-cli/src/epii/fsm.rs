pub fn dispatch(json: bool) -> Result<String, String> {
    crate::nara::logos::status(json)
}
