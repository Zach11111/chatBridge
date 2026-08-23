import { db, loadUserData } from "./db.js";

export let users = [];
export let isUsersLoaded = false;

export function initUsers() {
  loadUserData().then((data) => {
    users = data;
    isUsersLoaded = true;
  });
}

export function syncUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  const sql = `INSERT INTO users (id, username, admin, banned)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      admin = excluded.admin,
      banned = excluded.banned`;

  db.run(sql, [user.id, user.username, user.admin, user.banned], (err) => {
    if (err) {
      console.error(`Error syncing user ${userId}:`, err);
    } else {
      console.log(`User ${userId} synced successfully.`);
    }
  });
}

export function addUser(id, username) {
  const newUser = { id, username, admin: 0, banned: 0 };
  users.push(newUser);
  syncUser(id);
}

export function banUser(id) {
  const user = users.find((u) => u.id === id);
  if (user) {
    user.banned = 1;
    syncUser(id);
  }
}

export function unbanUser(id) {
  const user = users.find((u) => u.id === id);
  if (user) {
    user.banned = 0;
    syncUser(id);
  }
}

export function adminUser(id) {
  const user = users.find((u) => u.id === id);
  if (user) {
    user.admin = 1;
    syncUser(id);
  }
}

export function unadminUser(id) {
  const user = users.find((u) => u.id === id);
  if (user) {
    user.admin = 0;
    syncUser(id);
  }
}

export function updateUsername(id, newUsername) {
  const user = users.find((u) => u.id === id);
  if (user) {
    user.username = newUsername;
    syncUser(id);
  }
}
