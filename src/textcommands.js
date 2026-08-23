import fs from "fs";

import { Events, Collection } from "discord.js";
import Logger from "garylog";

import { client } from "./client.js";
import { users } from "./users.js";
import { PREFIX } from "./utils.js";

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

  switch (command?.allowedRank) {
    case "owner":
      if (message.author.id !== process.env.USERID) {
        return message.reply("You do not have permission to use this command.");
      }
      break;
    case "serveradmin":
      if (!message.member.permissions.has("Administrator")) {
        return message.reply("You do not have permission to use this command.");
      }
      break;
    case "admin":
      if (!users.some(u => u.id === message.author.id && u.admin === 1)) {
        return message.reply("You do not have permission to use this command.");
      }
      break;
    default:
      break;
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    Logger.error(error, "TextCommands");
    await message.reply({ content: `There was an error executing this command.\n\`${error.message}\`` });
  }
});
