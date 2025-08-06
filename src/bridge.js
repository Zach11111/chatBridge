import Logger from "garylog";

import { client } from "./client.js";
import { loadServerData } from "./db.js";
import { servers } from "./utils.js";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (servers.some(s => s.channelId === message.channel.id)) {

    for (const server of servers) {
      if (server.channelId === message.channel.id) { 
        continue;
      } else {
        const webhookClient = new (await import("discord.js")).WebhookClient({ url: server.webhook });
        webhookClient.send({
          content: message.content,
          username: message.member ? message.member.displayName : message.author.username,
          avatarURL: message.author.displayAvatarURL(),
          files: message.attachments.map(att => att.url),
        });
      }

    }

  }

});
