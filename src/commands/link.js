import { addServer } from "../db.js"; 
import { PREFIX } from "../utils.js";
import { client } from "../client.js";
import { servers, addServerCache } from "../utils.js";

export default {
  name: "link",
  description: "link your channel to the bridge",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("You need to be an administrator to use this command.");
    }

    if (args.length < 1) {
      return message.reply(`Usage: ${PREFIX}link <channel>`);
    }

    const channelText = args[0];

    if (!/^<#\d+>$/.test(channelText)) {
      return message.reply("Please provide a valid channel mention.");
    }

    const channelId = channelText.slice(2, -1);
    const serverId = message.guild.id;

    if (servers.some(s => s.serverId === serverId)) {
      return message.reply("This server is already linked.");
    }

    const serverName = message.guild.name;
    const server = client.guilds.cache.get(serverId);
    const channel = server.channels.cache.get(channelId);
    const webhook = await channel.createWebhook({ name: "ChatBridge Webhook" });

    console.log(channelId, serverId, serverName, webhook.url);
    await addServer(serverId, channelId, webhook.url, serverName);
    addServerCache(serverId, channelId, webhook.url, serverName);
    message.reply("Channel linked successfully!");
  },
};
