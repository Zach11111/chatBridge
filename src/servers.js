import { db, loadServerData } from "./db.js";

export let servers = [];
export let isServersLoaded = false;

export function initServers() {
  loadServerData().then((data) => {
    servers = data;
    isServersLoaded = true;
  });
}

export function syncServer(serverId) {
  const server = servers.find((s) => s.id === serverId);
  if (!server) return;

  const sql = `INSERT INTO servers (id, channelId, webhook, name)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      channelId = excluded.channelId,
      webhook = excluded.webhook,
      name = excluded.name`;

  db.run(sql, [server.id, server.channelId, server.webhook, server.name ?? null], (err) => {
    if (err) {
      console.error(`Error syncing server ${serverId}:`, err);
    } else {
      console.log(`Server ${serverId} synced successfully.`);
    }
  });
}

export function addServer(id, channelId, webhook, name) {
  const newServer = { id, channelId, webhook, name: name ?? null };
  servers.push(newServer);
  syncServer(id);
}

export function removeServer(id) {
  const index = servers.findIndex((s) => s.id === id);
  if (index !== -1) {
    servers.splice(index, 1);
  }
}

