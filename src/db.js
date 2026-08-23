import fs from "fs";
import path from "path";

import Logger from "garylog";
import sqlite3 from "sqlite3";

const dataDir = "./data";
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(path.join(dataDir, "servers.sqlite"), (err) => {
  if (err) {
    Logger.error(`Could not connect to database: ${err}`, "Database");
  } else {
    Logger.info("Connected to the SQLite database.", "Database");
  }
});

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS servers (id TEXT PRIMARY KEY, channelId TEXT, webhook TEXT, name TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, banned BOOLEAN DEFAULT false, admin BOOLEAN DEFAULT false)");
});

export function loadServerData() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM servers", [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

export function loadUserData() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

