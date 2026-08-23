import { client } from "../client.js";
import { PREFIX } from "../utils.js";

export default {
  name: "help",
  description: "get instructions for how to use the bot",
  usage: "help",
  async execute(message) {

    const messageContent =
            `
        ChatBridge Instructions:\n
        1. Add the bot to your Discord server.\n
        2. Create a channel in your Discord server that you want to link to the chat bridge.\n
        3. Use the command \`${PREFIX}link <channel>\`  to link it to the chat bridge.\n
        4. To unlink the channel, use the command \`${PREFIX}unlink\`.  
        `;
    message.reply(messageContent);

  },
};
