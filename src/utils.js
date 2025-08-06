import dotenv from "dotenv";

import { loadServerData } from "./db.js";

dotenv.config();

export const {
  TOKEN,
  PREFIX,
} = process.env;

export const servers = await loadServerData();

export const addServerCache = (id, channelId, webhook, name) => {
  servers.push({
    id,
    channelId,
    webhook,
    name,
  });
};

export const removeServerCache = (id) => {
  const index = servers.findIndex(s => s.id === id);
  if (index !== -1) {
    servers.splice(index, 1);
  }
};
