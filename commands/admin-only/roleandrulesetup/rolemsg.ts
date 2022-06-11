import rolemessageSchame from "../../../models/rolemessage-Schame";
import { TextChannel } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Utility',
    description: 'Sends a message',

    slash: true,
    testOnly: true,
    guildOnly: true,

    minArgs: 2,
    expectedArgs: '<channel> <message>',
    expectedArgsTypes: ['CHANNEL', 'STRING'],

    requiredPermissions: ['ADMINISTRATOR'],

    callback: async ({ guild, message, interaction, args }) => 
    {
        args.shift()

        const text = args.join(' ')

        let channel: TextChannel

        if(message){
            channel = message.mentions.channels.first() as TextChannel
        } else {
            channel = interaction.options.getChannel('channel') as TextChannel
        }

        const sentMessage = await channel.send(text)

        await new rolemessageSchame({
            _id: guild?.id,
            channelId: channel.id,
            messageId: sentMessage.id,
        }).save()

        if(interaction){
            return{
                custom: true,
                content: 'Message sent',
                ephemeral: true,
            }
        }
    }
} as ICommand
