import 'dotenv/config';
import express from 'express';
import {
    InteractionType,
    InteractionResponseType,
    MessageComponentTypes,
} from 'discord-interactions';
import { aww_reactions, aww_reaction_components, HasGuildCommands } from './commands.js';
import { VerifyDiscordRequest } from './utils.js';
import { AWW_COMMAND } from './commands.js';
import fetch from 'node-fetch';

// Create an express app
const app = express();
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
    // Interaction type and data
    const { type, id, data } = req.body;

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        // "aww" command
        if (name === AWW_COMMAND.name) {
            const response = await fetch('https://www.reddit.com/r/aww/new/.json');

            if (response.status !== 200) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'oops, something went wrong ... ',
                    }
                });
            }

            const parsed = await response.json();
            if (!parsed.data || !parsed.data.children) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'oops, something went wrong ... ',
                    }
                });
            }

            const filtered = parsed.data.children
                .filter(element => element.data.url_overridden_by_dest && element.data.url_overridden_by_dest.endsWith('jpg'));
            if (filtered.length < 1) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'can not find a picture at the moment ... ',
                    }
                });
            }

            const random = filtered[Math.floor(Math.random() * filtered.length)];
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: random.data.url_overridden_by_dest,
                    components: [
                        {
                            type: MessageComponentTypes.ACTION_ROW,
                            components: aww_reaction_components,
                        },
                    ],
                }
            });
        }
    }

    /**
     * Handle requests from interactive components
     * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
     */
    if (type === InteractionType.MESSAGE_COMPONENT) {
        // custom_id set in payload when sending message component
        const componentId = data.custom_id;

        if (componentId.startsWith('aww_reaction')) {
            const found = aww_reactions.find(reaction => reaction.id === componentId);
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `<@${req.body.member.user.id}> is reacting with ${found.label}`,
                },
            });
        }
    }
});

app.listen(3000, () => {
    console.log('Chatbot started ...');

    // Check if guild commands from commands.js are installed (if not, install them)
    HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
        AWW_COMMAND
    ]);
});