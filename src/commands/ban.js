import { banUser } from "../db.js";
import { client } from "../client.js";
import { users, banUserCache } from "../utils.js";

export default {
  name: "ban",
  description: "ban a user from the bridge",
  async execute(message, args) {

    if (users.some(u => u.id === message.author.id && u.admin === 1)) {
      if (args.length < 1) {
        if (message.reference) {
          const reply = await message.channel.messages.fetch(message.reference.messageId);
          const index = users.findIndex(u => u.username === reply.author.username);
          const userId = users[index].id;
          const username = users[index].username;
          console.log(userId);
          await banUser(userId);
          banUserCache(userId);
          return message.reply(`User ${username} has been banned from the bridge.`);
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
      await banUser(userId);
      banUserCache(userId);
      message.reply(`User ${user.username} has been banned from the bridge.`);
    } else {
      return message.reply("You do not have permission to use this command.");    
    }

  },
};
