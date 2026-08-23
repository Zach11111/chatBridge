import { client } from "../client.js";
import { PREFIX } from "../utils.js";

export default {
  name: "commands",
  description: "list all commands",
  usage: "commands",
  async execute(message) {
    const commands = client.textCommands.map(command => {
      return `**${command.name}**: ${command.description} \nUsage: ${PREFIX}${command.usage}`;
    }).join("\n\n");

    message.reply(commands);

  },
};
