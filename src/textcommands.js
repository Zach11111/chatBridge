import fs from "fs";

import { Events, Collection } from "discord.js";
import Logger from "garylog";

import { PREFIX } from "./utils.js";
import { client } from "./client.js";

client.textCommands = new Collection();
const textCommandFiles = fs
  .readdirSync("./src/commands")
  .filter(file => file.endsWith(".js"));

for (const file of textCommandFiles) {
  const command = await import(`./commands/${file}`);
  client.textCommands.set(command.default.name, command.default);
  Logger.info(`Loaded text command: ${command.default.name}`, "TextCommands");
}

client.on(Events.MessageCreate, async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.textCommands.get(commandName);
  if (!command) return;
  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    await message.reply({ content: `There was an error executing this command.\n\`${error.message}\`` });
  }
});
