import { removeServer } from "../db.js";
import { removeServerCache } from "../utils.js";

export default {
  name: "unlink",
  async execute(message) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("You need to be an administrator to use this command.");
    }

    await removeServer(message.guild.id);
    removeServerCache(message.guild.id);

    message.reply("Channel unlinked successfully!");
  },
};
