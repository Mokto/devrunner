use std::{collections::HashMap, env, fs};

use regex::Regex;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Deserialize, Serialize, Clone, TS)]
#[ts(export)]
pub struct Application {
    pub port: u32,
    pub directory: String,
    pub binary: String,
    pub name: String,
    pub color: String,
    pub args: Vec<String>,
    pub watch: Option<Vec<String>>,
}

#[derive(Deserialize, Serialize, Clone, TS)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub base_path: String,
    pub applications: Vec<Application>,
    pub env: HashMap<String, String>,
}

impl Config {
    pub fn new() -> Config {
        let contents = fs::read_to_string("../secretconfig.json")
            .expect("Something went wrong reading the file");

        let mut config: Config = serde_json::from_str(&contents).expect("Couldn't deserialize");

        for (key, val) in config.env.clone().into_iter() {
            let new_val = Config::replace_dir(Config::replace_env(val), &config);
            config.env.insert(key, new_val);
        }

        config
    }

    fn replace_env(str: String) -> String {
        let re = Regex::new(r"\{env\.([A-Z]+)\}").unwrap();
        match re.captures(str.as_str()) {
            Some(captures) => {
                let to_be_replaced = captures.get(0).unwrap().as_str();
                let mut env_key = to_be_replaced.to_string();
                env_key.pop();
                env_key = env_key.replace("{env.", "");

                let env_value = match env::var(env_key) {
                    Ok(val) => val,
                    Err(_e) => "".to_string(),
                };

                let new_val = str.replace(to_be_replaced, env_value.as_str());

                Config::replace_env(new_val)
            }
            None => return str,
        }
    }

    fn replace_dir(str: String, config: &Config) -> String {
        let re = Regex::new(r"\{dir}").unwrap();
        match re.captures(str.as_str()) {
            Some(_captures) => str.replace("{dir}", &config.base_path),
            None => return str,
        }
    }
}
