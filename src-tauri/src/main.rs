#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{env, path::Path, sync::Mutex, vec};

use command;
use config::{Application, Config};
use tauri::Window;

struct Commands {
    commands: Mutex<Vec<command::Command>>,
}

fn main() {
    let config = config::Config::new();
    let commands = Commands {
        commands: Mutex::new(vec![]),
    };

    tauri::Builder::default()
        .manage(config)
        .manage(commands)
        .invoke_handler(tauri::generate_handler![run, kill, get_applications])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn run(window: Window, config_state: tauri::State<Config>, commands: tauri::State<Commands>) {
    let applications = config_state.applications.clone();
    for mut application in applications {
        let path = Path::new(config_state.base_path.as_str()).join(application.directory.clone());
        application.directory = path.into_os_string().into_string().unwrap().clone();
        let c = command::Command::new(
            application.clone(),
            config_state.env.clone(),
            window.clone(),
        );
        c.exec();

        commands.commands.lock().unwrap().push(c);
    }
}

#[tauri::command]
fn kill(commands: tauri::State<Commands>) {
    for command in commands.commands.lock().unwrap().iter_mut() {
        command.kill();
    }
}

#[tauri::command]
fn get_applications(config_state: tauri::State<Config>) -> Vec<Application> {
    return config_state.applications.clone();
}
