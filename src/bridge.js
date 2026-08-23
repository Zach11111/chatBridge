import { WebhookClient } from "discord.js";
import Logger from "garylog";

import { client } from "./client.js";
import { recordMessageBridge } from "./messageLog.js";
import { removeServer, servers } from "./servers.js";
import { addUser, updateUsername, users } from "./users.js";
import { getAuthorUsernameFromMessage, filterMessage } from "./utils.js";
import { PREFIX } from "./utils.js";
import { getReplicateMessageId } from "./messageLog.js";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) return;
  if (!users.some(u => u.id === message.author.id)) {
    const name = getAuthorUsernameFromMessage(message);
    addUser(message.author.id, name);
  }

  if (users.some(u => u.id === message.author.id && u.username !== getAuthorUsernameFromMessage(message))) {
    const index = users.findIndex(u => u.id === message.author.id);
    users[index].username = getAuthorUsernameFromMessage(message);
    await updateUsername(message.author.id, users[index].username);
  }

  if (users.some(u => u.id === message.author.id && u.banned === 1)) {
    return;
  }
  if (servers.some(s => s.channelId === message.channel.id)) {
    let referencedMessage = null;
    let replyAuthor = "";
    let replyContent = "";

    if (message.reference) {
      try {
        referencedMessage = await message.fetchReference();
        replyAuthor = referencedMessage.member?.displayName || referencedMessage.author.username;
        let rawContent = referencedMessage.content || "[embed/attachment]";
        const cleanedContent = rawContent.replace(/^`Replying to @.*?: ".*?"`\n?/s, "").trim();
        let filtered = cleanedContent.slice(0, 100);
        replyContent = await filterMessage(filtered);
      } catch (err) {
        Logger.warn("Failed to fetch reply reference:", err);
      }
    }

    let totalAttachmentSize = 0;
    message.attachments.forEach(att => {
      if (att.size) totalAttachmentSize += att.size;
    });
    if (totalAttachmentSize > 8388608) {
      Logger.warn(`Message from ${message.author.id} blocked: attachments exceed 8MB total.`);
      return;
    }

    for (const server of servers) {
      if (server.channelId === message.channel.id) continue;

      const webhookClient = new WebhookClient({ url: server.webhook });

      let replyText = "";
      if (message.reference && referencedMessage) {
        try {
          const targetMessageId = await getReplicateMessageId(referencedMessage.id, server.channelId);
          if (targetMessageId) {
            const messageUrl = `https://discord.com/channels/${server.id}/${server.channelId}/${targetMessageId}`;
            replyText = `\`Replying to @${replyAuthor}:\` ${messageUrl}`;
          } else {
            replyText = `\`Replying to @${replyAuthor}: "${replyContent}"\``;
          }
        } catch (err) {
          Logger.warn("Failed to check message bridge log, using fallback:", err);
          replyText = `\`Replying to @${replyAuthor}: "${replyContent}"\``;
        }
      }

      let filteredContent = await filterMessage(message.content);

      const name = getAuthorUsernameFromMessage(message);
      const stickers = message.stickers?.filter(s => s.type !== 1 && !s.url.endsWith(".json")).map(s => `${s.url}?size=160`) || [];
      const webhookFiles = message.attachments.map(att => att.url);
      let finalContent = replyText ? `${replyText}\n${filteredContent}` : filteredContent;

      if (stickers.length > 0) {
        finalContent += `\n${stickers.join("\n")}`;
      }

      if (!finalContent.trim() && webhookFiles.length === 0) {
        continue;
      }

      webhookClient.send({
        content: finalContent.trim() || undefined,
        username: name,
        avatarURL: message.author.displayAvatarURL(),
        files: webhookFiles,
      }).then((sentMessage) => {
        recordMessageBridge(message.id, message.channel.id, server.channelId, sentMessage.id);
      }).catch(async (err) => {
        Logger.error("Failed to send webhook for server: " + (server.name || "Unknown") + " (ID: " + server.id + ")");
        if (err.code === 10015 || err.code === 50027) {
          await removeServer(server.id);
        }
      });
    }
  }
});

client.on("guildDelete", async (guild) => {
  await removeServer(guild.id);
});
