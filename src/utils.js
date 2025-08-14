import dotenv from "dotenv";

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
console.log(users)
export function addUserCache(id, username, banned = true) {
  users.push({
    id,
    username,
    banned,
  });
}

export function banUserCache(id) {
  const index = users.findIndex(u => u.id === id);
  users[index].banned = true;
}

export function unbanUserCache(id) {
  const index = users.findIndex(u => u.id === id);
  users[index].banned = false;
}

export function adminUserCache(id) {
  const index = users.findIndex(u => u.id === id);
  users[index].admin = true;
};

export function getAuthorUsernameFromMessage(message) {
  const nameCandidates = [
    message.member?.nickname,
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
