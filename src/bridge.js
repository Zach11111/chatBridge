import Logger from "garylog";

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
        const replyContent = referenced.content?.slice(0, 100) || "[embed/attachment]";
        replyText = `\`Replying to **@${replyAuthor}:** "${replyContent}"\``;
      } catch (err) {
        Logger.warn("Failed to fetch reply reference:", err);
      }
    }

    for (const server of servers) {
      if (server.channelId === message.channel.id) continue;

      const webhookClient = new (await import("discord.js")).WebhookClient({ url: server.webhook });

      webhookClient.send({
        content: `${replyText}${message.content}`,
        username: message.member?.displayName || message.author.username,
        avatarURL: message.author.displayAvatarURL(),
        files: message.attachments.map(att => att.url),
      });
    }
  }
});
