import { Client, GatewayIntentBits } from "discord.js";
import Logger from "garylog";

import { TOKEN } from "./utils.js";

if (!TOKEN) {
  Logger.error("No token provided in .env file", "Client");
  process.exit(1);
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  Logger.info(`Logged in as ${client.user.tag}`, "Client");
});

client.login(TOKEN);
