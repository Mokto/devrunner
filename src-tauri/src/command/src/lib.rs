use colored::Colorize;
use config::Application;
use crossbeam_channel::{bounded, select, unbounded, Receiver, Sender};
use nanoid::nanoid;
use notify::{Error, Event, RecommendedWatcher, RecursiveMode, Watcher};
use signal_hook::{consts::SIGINT, iterator::Signals};
use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::process::Command as CommandProcess;
use std::process::Stdio;
use std::str;
use std::sync::{Arc, Mutex};
use std::thread;

use tauri::Window;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
    id: String,
    application: String,
}

struct InnerCommand {
    window: Window,
    application: Application,
    env: HashMap<String, String>,
    unwatchers: Mutex<Vec<Sender<()>>>,
}

impl InnerCommand {
    fn log(&self, line: String) {
        let local_self = self.clone();
        println!(
            "{} {}",
            format!("[{}]", local_self.application.name)
                .on_color(local_self.application.color.clone()),
            line
        );
        local_self
            .window
            .emit(
                "log",
                Payload {
                    application: local_self.application.name.clone(),
                    message: line,
                    id: nanoid!(),
                },
            )
            .unwrap();
    }

    fn kill_port(&self) {
        let port = self.application.port;

        let output = CommandProcess::new("lsof")
            .args([format!("-i:{}", port), "-t".to_string()])
            .output()
            .expect("Error killing");

        for port_string in String::from_utf8_lossy(&output.stdout).lines() {
            InnerCommand::kill_stream(port_string.parse::<u32>().unwrap());
        }
    }

    fn kill_stream(process_id: u32) {
        CommandProcess::new("kill")
            .args(["-9", process_id.to_string().as_str()])
            .spawn()
            .expect("Error killing");
    }

    fn watch(&self) -> Option<Sender<()>> {
        match self.application.watch.clone() {
            Some(watches) => {
                let application_directory = self.application.directory.clone();
                let (tx_unwatch, rx_unwatch): (Sender<()>, Receiver<()>) = bounded(1);
                // tx_unwatch.send(());

                thread::spawn(move || {
                    let rx_unwatch = rx_unwatch.clone();
                    let (tx_event, rx_event) = unbounded();

                    let mut watcher = RecommendedWatcher::new(
                        move |result: std::result::Result<Event, Error>| {
                            tx_event.send(result).expect("Failed to send event");
                        },
                    )
                    .expect("Can't create watcher");

                    let mut directories = vec![];

                    for watch in watches {
                        let directory = Path::new(application_directory.as_str())
                            .join(watch.as_str())
                            .as_path()
                            .display()
                            .to_string();
                        directories.push(directory.clone());
                        watcher
                            .watch(Path::new(&directory), RecursiveMode::Recursive)
                            .unwrap();
                    }
                    loop {
                        select! {
                            recv(rx_event) -> msg => {
                                println!("{:?}", msg);
                            },
                            recv(rx_unwatch) -> _ => {
                                break
                            }
                        }
                    }

                    for directory in directories {
                        watcher.unwatch(Path::new(&directory)).unwrap();
                    }
                });

                return Some(tx_unwatch);
            }
            None => None,
        }
    }
}

pub struct Command {
    inner: Arc<InnerCommand>,
}

impl Command {
    pub fn new(application: Application, env: HashMap<String, String>, window: Window) -> Command {
        Command {
            inner: Arc::new(InnerCommand {
                window,
                application,
                env,
                unwatchers: Mutex::new(vec![]),
            }),
        }
    }
    pub fn exec(&self) {
        self.inner.log("Starting application...".to_string());
        self.inner.kill_port();

        let env = self.inner.env.clone();
        let application = self.inner.application.clone();
        let local_self = self.inner.clone();
        thread::spawn(move || {
            let mut cmd = CommandProcess::new(application.binary)
                .current_dir(application.directory)
                .args(&application.args)
                .envs(env)
                .stderr(Stdio::piped())
                .stdout(Stdio::piped())
                .spawn()
                .unwrap();

            {
                let stdout = cmd.stdout.take().unwrap();
                let stderr = cmd.stderr.take().unwrap();

                let mut stdout = BufReader::new(stdout);
                let mut stderr = BufReader::new(stderr);

                loop {
                    let (stdout_bytes, stderr_bytes) = match (stdout.fill_buf(), stderr.fill_buf())
                    {
                        (Ok(stdout), Ok(stderr)) => {
                            let string = str::from_utf8(&stdout).unwrap().to_string()
                                + str::from_utf8(&stderr).unwrap();
                            for line in string.lines() {
                                local_self.log(line.to_string());
                            }

                            (stdout.len(), stderr.len())
                        }
                        other => panic!("Some better error handling here... {:?}", other),
                    };

                    if stdout_bytes == 0 && stderr_bytes == 0 {
                        break;
                    }

                    stdout.consume(stdout_bytes);
                    stderr.consume(stderr_bytes);
                }
            }

            cmd.wait().unwrap();
        });
        let mut signals = Signals::new(&[SIGINT]).expect("Failure");

        let unwatcher = self.inner.watch();
        match unwatcher {
            Some(unwatcher) => self.inner.unwatchers.lock().unwrap().push(unwatcher),
            None => (),
        }

        let local_self = self.inner.clone();
        thread::spawn(move || {
            for _sig in signals.forever() {
                local_self.kill_port();
                for unwatcher in local_self.unwatchers.lock().unwrap().clone() {
                    unwatcher.send(()).unwrap();
                }
            }
        });
    }

    pub fn kill(&self) {
        for watcher in self.inner.unwatchers.lock().unwrap().iter() {
            watcher.send(()).unwrap();
        }
        self.inner.kill_port();
    }
}

// pub fn kill_port(port: u32) {
//     let output = CommandProcess::new("lsof")
//         .args([format!("-i:{}", port), "-t".to_string()])
//         .output()
//         .expect("Error killing");

//     for port_string in String::from_utf8_lossy(&output.stdout).lines() {
//         kill_stream(port_string.parse::<u32>().unwrap());
//     }
// }
