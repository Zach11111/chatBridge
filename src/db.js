import fs from "fs";
import path from "path";

import sqlite3 from "sqlite3";

const dataDir = "./data";
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(path.join(dataDir, "servers.sqlite"), (err) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS servers (id TEXT PRIMARY KEY, channelId TEXT, webhook TEXT, name TEXT)"); 
  db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, banned BOOLEAN DEFAULT false, admin BOOLEAN DEFAULT false)");
});

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

export function addUser(id, username) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO users (id, username) VALUES (?, ?)", [id, username], function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function banUser(id) { 
  return new Promise((resolve, reject) => {
    db.run("UPDATE users SET banned = ? WHERE id = ?", [true, id], function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function unbanUser(id) { 
  return new Promise((resolve, reject) => {
    db.run("UPDATE users SET banned = ? WHERE id = ?", [false, id], function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function adminUser(id) { 
  return new Promise((resolve, reject) => {
    db.run("UPDATE users SET admin = ? WHERE id = ?", [true, id], function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function updateUsername(id, username) {
  return new Promise((resolve, reject) => {
    db.run("UPDATE users SET username = ? WHERE id = ?", [username, id], function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

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

export function addServer(id, channelId, webhook, name) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO servers (id, channelId, webhook, name) VALUES (?, ?, ?, ?)", [id, channelId, webhook, name], function(err) {
      if (err) {      
        reject(err);
      }
      resolve();
    });
  });
}

export function removeServer(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM servers WHERE id = ?", [id], function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

