use std::{
    env, fs, io,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};

pub const DEFAULT_GATEWAY_PORT: u16 = 18794;
pub const DEFAULT_LOG_LEVEL: &str = "info";
pub const SETTINGS_PATH_ENV: &str = "EPI_S0_SETTINGS_PATH";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Settings {
    pub gateway_port: u16,
    pub log_level: String,
    pub data_dir: PathBuf,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            gateway_port: DEFAULT_GATEWAY_PORT,
            log_level: DEFAULT_LOG_LEVEL.to_owned(),
            data_dir: default_data_dir(),
        }
    }
}

impl Settings {
    pub fn load() -> io::Result<Self> {
        let path = env::var_os(SETTINGS_PATH_ENV)
            .map(PathBuf::from)
            .unwrap_or_else(default_config_path);
        Self::load_from_path(path)
    }

    pub fn load_from_path(path: impl AsRef<Path>) -> io::Result<Self> {
        let mut settings = Self::default();
        let contents = match fs::read_to_string(path.as_ref()) {
            Ok(contents) => contents,
            Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(settings),
            Err(error) => return Err(error),
        };

        for (line_index, raw_line) in contents.lines().enumerate() {
            apply_line(&mut settings, raw_line, line_index + 1)?;
        }

        Ok(settings)
    }
}

fn default_data_dir() -> PathBuf {
    env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join(".epi")
}

fn default_config_path() -> PathBuf {
    default_data_dir().join("s0-settings.conf")
}

fn apply_line(settings: &mut Settings, raw_line: &str, line_number: usize) -> io::Result<()> {
    let line = raw_line.trim();
    if line.is_empty() || line.starts_with('#') {
        return Ok(());
    }

    let (key, value) = line
        .split_once('=')
        .ok_or_else(|| invalid_config(line_number, "expected `key = value` setting assignment"))?;
    let key = key.trim();
    let value = unquote(value.trim());

    match key {
        "gateway_port" => {
            settings.gateway_port = value.parse::<u16>().map_err(|_| {
                invalid_config(
                    line_number,
                    "`gateway_port` must be an unsigned 16-bit port",
                )
            })?;
        }
        "log_level" => {
            if value.is_empty() {
                return Err(invalid_config(line_number, "`log_level` must not be empty"));
            }
            settings.log_level = value.to_owned();
        }
        "data_dir" => {
            if value.is_empty() {
                return Err(invalid_config(line_number, "`data_dir` must not be empty"));
            }
            settings.data_dir = PathBuf::from(value);
        }
        _ => {
            return Err(invalid_config(
                line_number,
                format!("unknown settings key `{key}`"),
            ));
        }
    }

    Ok(())
}

fn unquote(value: &str) -> &str {
    value
        .strip_prefix('"')
        .and_then(|inner| inner.strip_suffix('"'))
        .or_else(|| {
            value
                .strip_prefix('\'')
                .and_then(|inner| inner.strip_suffix('\''))
        })
        .unwrap_or(value)
}

fn invalid_config(message_line: usize, message: impl Into<String>) -> io::Error {
    io::Error::new(
        io::ErrorKind::InvalidData,
        format!(
            "invalid S0 settings line {message_line}: {}",
            message.into()
        ),
    )
}

#[cfg(test)]
mod tests {
    use std::{env, fs, path::PathBuf};

    use super::{Settings, SETTINGS_PATH_ENV};

    #[test]
    fn defaults_match_s0_settings_contract_and_load_succeeds() {
        let previous_settings_path = env::var_os(SETTINGS_PATH_ENV);
        env::remove_var(SETTINGS_PATH_ENV);

        let defaults = Settings::default();

        assert_eq!(defaults.gateway_port, 18794);
        assert_eq!(defaults.log_level, "info");
        assert!(!defaults.data_dir.as_os_str().is_empty());

        let loaded = Settings::load().expect("settings should load with defaults fallback");
        assert_eq!(loaded, defaults);

        if let Some(value) = previous_settings_path {
            env::set_var(SETTINGS_PATH_ENV, value);
        }
    }

    #[test]
    fn load_from_path_overlays_real_config_file_on_defaults() {
        let config_path = temp_config_path("s0-settings-overrides.conf");
        fs::write(
            &config_path,
            "\
gateway_port = 18801
log_level = \"debug\"
data_dir = state/s0
",
        )
        .expect("write settings fixture");

        let settings = Settings::load_from_path(&config_path).expect("load settings fixture");

        assert_eq!(settings.gateway_port, 18801);
        assert_eq!(settings.log_level, "debug");
        assert_eq!(settings.data_dir, PathBuf::from("state/s0"));

        fs::remove_file(config_path).expect("remove settings fixture");
    }

    fn temp_config_path(file_name: &str) -> PathBuf {
        env::temp_dir().join(format!(
            "epi-s0-settings-{}-{file_name}",
            std::process::id()
        ))
    }
}
