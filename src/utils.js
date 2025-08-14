import dotenv from "dotenv";

import { client } from "./client.js";
import { loadServerData, loadUserData } from "./db.js";

dotenv.config();

export const {
  TOKEN,
  PREFIX,
  USERID,
} = process.env;

export const servers = await loadServerData();

export function addServerCache(id, channelId, webhook) {
  servers.push({
    id,
    channelId,
    webhook,
  });
}

export function removeServerCache(id) {
  const index = servers.findIndex(s => s.id === id);
  if (index !== -1) {
    servers.splice(index, 1);
  }
}

export const users = await loadUserData();
export function addUserCache(id, username, banned = true) {
  users.push({
    id,
    username,
    banned,
  });
}

export function banUserCache(id) {
  const index = users.findIndex(u => u.id === id);
  users[index].banned = 1;
}

export function unbanUserCache(id) {
  const index = users.findIndex(u => u.id === id);
  users[index].banned = 0;
}

export function adminUserCache(id) {
  const index = users.findIndex(u => u.id === id);
  users[index].admin = 1;
};

export function getAuthorUsernameFromMessage(message) {
  const nameCandidates = [
    message.author.globalName,
    message.author.username,
  ];

  let safeUsername = "censored name";

  for (const name of nameCandidates) {
    if (
      name &&
          name.length >= 2 &&
          name.length <= 32 &&
          !/[@#:]|```|discord|clyde/i.test(name) &&
          !/^(everyone|here)$/i.test(name)
    ) {
      safeUsername = name.trim();
      break;
    }
  }
  return safeUsername;
}

export async function filterMessage(message) {
  let filteredContent = message
    .replace(/@everyone/g, "@\u200Beveryone")
    .replace(/@here/g, "@\u200Bhere");
  
  const mentionRegex = /<@!?(\d+)>/g;
  const matches = [...filteredContent.matchAll(mentionRegex)];
  for (const match of matches) {
    const userId = match[1];
    let username = "Unknown User";
    try {
      const user = await client.users.fetch(userId);
      username = user?.username || username;
      // eslint-disable-next-line no-empty
    } catch {}
    filteredContent = filteredContent.replace(match[0], `@${username}`);
  }

  return filteredContent;
}
