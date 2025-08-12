import Logger from "garylog";
import { WebhookClient } from "discord.js";

import { client } from "./client.js";
import { servers, users, addUserCache, getAuthorUsernameFromMessage } from "./utils.js";
import { addUser, updateUsername } from "./db.js";

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    Logger.info("Skipped message: from bot", { userId: message.author.id, username: message.author.username });
    return;
  }

  if (!users.some(u => u.id === message.author.id)) {
    Logger.info("User not in cache, adding", { userId: message.author.id, username: message.author.username });
    const name = getAuthorUsernameFromMessage(message);
    await addUser(message.author.id, name);
    addUserCache(message.author.id, name);
  }

  const currentName = getAuthorUsernameFromMessage(message);
  if (users.some(u => u.id === message.author.id && u.username !== currentName)) {
    Logger.info("Username changed, updating DB/cache", { userId: message.author.id, old: users.find(u => u.id === message.author.id)?.username, new: currentName });
    const index = users.findIndex(u => u.id === message.author.id);
    users[index].username = currentName;
    await updateUsername(message.author.id, users[index].username);
  }

  if (users.some(u => u.id === message.author.id && u.banned)) {
    Logger.info("Skipped message: user banned", { userId: message.author.id, username: currentName });
    return;
  }

  if (!servers.some(s => s.channelId === message.channel.id)) {
    Logger.info("Skipped message: channel not registered", { channelId: message.channel.id, channelName: message.channel.name });
    return;
  }

  let replyText = "";

  if (message.reference) {
    try {
      const referenced = await message.fetchReference();
      const replyAuthor = referenced.member?.displayName || referenced.author.username;
      const rawContent = referenced.content || "[embed/attachment]";
      const cleanedContent = rawContent.replace(/^`Replying to @.*?: ".*?"`\n?/s, "").trim();
      const replyContent = cleanedContent.slice(0, 100);
      replyText = `\`Replying to @${replyAuthor}: "${replyContent}"\``;
    } catch (err) {
      Logger.warn("Failed to fetch reply reference", { error: err, messageId: message.id });
    }
  }

  if (message.stickers.size > 0 && message.content === "") {
    Logger.info("Skipped message: sticker-only", { userId: message.author.id, username: currentName });
    return;
  }

  for (const server of servers) {
    if (server.channelId === message.channel.id) {
      Logger.info("Skipped relay to self", { serverId: server.id, channelId: server.channelId });
      continue;
    }

    const webhookClient = new WebhookClient({ url: server.webhook });

    const filteredContent = message.content
      .replace(/@everyone/g, "@\u200Beveryone")
      .replace(/@here/g, "@\u200Bhere");

    const name = getAuthorUsernameFromMessage(message);

    try {
      await webhookClient.send({
        content: `${replyText}\n${filteredContent}`,
        username: name,
        avatarURL: message.author.displayAvatarURL(),
        files: message.attachments.map(att => att.url),
      });
      Logger.info("Relayed message", { fromUserId: message.author.id, toServerId: server.id, toChannelId: server.channelId });
    } catch (err) {
      Logger.error("Failed to relay message", { error: err, fromUserId: message.author.id, toServerId: server.id });
    }
  }
});
