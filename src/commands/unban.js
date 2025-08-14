import { unbanUser } from "../db.js";
import { unbanUserCache } from "../utils.js";
import { client } from "../client.js";
import { users } from "../utils.js";

export default {
  name: "unban",
  description: "unban a user from the bridge",
  async execute(message, args) {
    if (users.some(u => u.id === message.author.id && u.admin === 1)) {
      if (args.length < 1) {
        if (message.reference) {
          const reply = await client.channels.cache.get(message.channel.id).messages.fetch(message.reference.messageId);
          const userId = reply.author.id;
          await unbanUser(userId);
          unbanUserCache(userId);
          message.reply(`User ${user.username} has been unbanned from the bridge.`);
        }
      }
      const userText = args[0];
      if (!/^<@!?(\d+)>$/.test(userText)) {
        return message.reply("Please provide a valid user mention.");
      }
      const userId = userText.replace(/^<@!?(\d+)>$/, "$1");
      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) {
        return message.reply("User not found.");
      }
      await unbanUser(userId, user.username, false);
      unbanUserCache(userId);
      message.reply(`User ${user.username} has been unbanned from the bridge.`);
    } else {
      return message.reply("You do not have permission to use this command.");
    }
  },
};
