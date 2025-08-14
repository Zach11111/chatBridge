import Logger from "garylog";
import { WebhookClient } from "discord.js";

import { client } from "./client.js";
import { servers, users, addUserCache, getAuthorUsernameFromMessage, filterMessage } from "./utils.js";
import { addUser, updateUsername } from "./db.js";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!users.some(u => u.id === message.author.id)) {
    const name = getAuthorUsernameFromMessage(message);
    await addUser(message.author.id, name);
    addUserCache(message.author.id, name);
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
    let replyText = "";

    if (message.reference) {
      try {
        const referenced = await message.fetchReference();
        const replyAuthor = referenced.member?.displayName || referenced.author.username;
        let rawContent = referenced.content || "[embed/attachment]";
        const cleanedContent = rawContent.replace(/^`Replying to @.*?: ".*?"`\n?/s, "").trim();
        let replyContent = cleanedContent.slice(0, 100);

        replyContent = await filterMessage(replyContent);

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

      let filteredContent = await filterMessage(message.content);

      const name = getAuthorUsernameFromMessage(message);

      webhookClient.send({
        content: `${replyText}\n${filteredContent}`,
        username: name,
        avatarURL: message.author.displayAvatarURL(),
        files: message.attachments.map(att => att.url),
      });
    }
  }
});
