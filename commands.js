import { DiscordRequest } from './utils.js';
import {
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';

export async function HasGuildCommands(appId, guildId, commands) {
  if (guildId === '' || appId === '') return;

  commands.forEach((c) => HasGuildCommand(appId, guildId, c));
}

// Checks for a command
async function HasGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;

  try {
    const res = await DiscordRequest(endpoint, { method: 'GET' });
    const data = await res.json();

    if (data) {
      const installedNames = data.map((c) => c['name']);
      // This is just matching on the name, so it's not good for updates
      if (!installedNames.includes(command['name'])) {
        console.log(`Installing "${command['name']}"`);
        InstallGuildCommand(appId, guildId, command);
      } else {
        console.log(`"${command['name']}" command already installed`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function InstallGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'POST', body: command });
  } catch (err) {
    console.error(err);
  }
}

// Aww command
export const AWW_COMMAND = {
  name: 'aww',
  description: 'Show a random cute animal picture.',
  type: 1,
}

export const aww_reactions = [
  { id: 'aww_reaction_surprise', label: '😯' },
  { id: 'aww_reaction_laugh', label: '😂' },
  { id: 'aww_reaction_dog', label: '🐕' },
]

export const aww_reaction_components = [];
aww_reactions.forEach(reaction => {

  aww_reaction_components.push({
    type: MessageComponentTypes.BUTTON,
    custom_id: reaction.id,
    label: reaction.label,
    style: ButtonStyleTypes.PRIMARY,
  });

});
