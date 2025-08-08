import Logger from "garylog";
import { WebhookClient } from "discord.js";

import { client } from "./client.js";
import { servers } from "./utils.js";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (servers.some(s => s.channelId === message.channel.id)) {
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
        Logger.warn("Failed to fetch reply reference:", err);
      }
    }

    if (message.stickers.size > 0 && message.content === "") {
      return;
    }

    for (const server of servers) {
      if (server.channelId === message.channel.id) continue;

      const webhookClient = new WebhookClient({ url: server.webhook });

      const filteredContent = message.content
        .replace(/@everyone/g, "@\u200Beveryone")
        .replace(/@here/g, "@\u200Bhere");

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

      webhookClient.send({
        content: `${replyText}\n${filteredContent}`,
        username: safeUsername,
        avatarURL: message.author.displayAvatarURL(),
        files: message.attachments.map(att => att.url),
      });
    }
  }
});
