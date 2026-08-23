import { deleteMessage } from "../messageLog.js";

export default {
  name: "delete",
  description: "Delete a message and its corresponding webhook messages",
  usage: "delete <messageId>",
  allowedRank: "admin",
  async execute(message, args) {
    let messageId;

    if (message.reference) {
      messageId = message.reference.messageId;
    } else {
      messageId = args[0];
    }
    const channelId = message.channel.id;

    if (!messageId) {
      message.reply("Please provide a message ID to delete.");
      return;
    }

    const success = await deleteMessage(messageId, channelId);
    if (success) {
      message.reply("Message deleted successfully.");
    } else {
      message.reply("Failed to delete the message.");
    }
  },
};
