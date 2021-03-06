import DJS from 'discord.js'
import { VoiceChannel, CategoryChannel, GuildMember } from 'discord.js';
import { ICommand } from "wokcommands";
import channelInfoSchema from '../../models/tempchannelmodels/channelInfoSchema';

const channelInfoData = {} as {
    // guildID: [channel, category]
    [key: string]: [VoiceChannel, CategoryChannel, GuildMember]
}
const actions = ['open', 'close']
export default {
    category: 'tempchannel settings',
    description: `set ${actions.join('/')} Status for the channel`,
    

    minArgs: 1,
    expectedArgs: `<${actions.join('", "')}>`,

    slash: true,
    //testOnly: true,
    ephemeral: false,

    options: [
        {
            name: 'action',
            description: 'The channel status',
            choices: actions.map((actions) => ({
                name: actions,
                value: actions
            })) , 
            required: true,
            type: DJS.Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ guild, message, interaction, args}) => {
        if(!guild){
            return {
                content: 'Please use this command within a server',
                ephemeral: true,
                custom: true
              }
        }
        const member = guild.members.cache.get(interaction.user.id)
        const everyone = guild.roles.everyone.id

        if(!member?.voice.channel){
            return 'you must be connected to a voicechannel'
        }
        if(member.voice.channel){
            let data = channelInfoData[member.voice.channel.id]

            if(!data){
                const results = await channelInfoSchema.findById(member.voice.channel.id)
                if(!results){
                    return
                }
                const {channelId, categoryId, ownerId } = results
                const category = guild.channels.cache.get(categoryId) as CategoryChannel
                const owner = guild.members.cache.get(ownerId) as GuildMember
                const channel = guild.channels.cache.get(channelId) as VoiceChannel

                data = channelInfoData[member.voice.channel.id] = [channel, category, owner]
            }
            const action = args.shift()
            if(!action ||  !actions.includes(action)){
                return `use one off the options given ${actions.join(', ')}`
            }

            if(member === data[2]){
                if(action === 'open'){
                    data[0].permissionOverwrites.create(everyone, {
                        CONNECT: true
                    })
                }
                if(action === 'close'){
                    data[0].permissionOverwrites.create(everyone, {
                        CONNECT: false
                    })
                }
                return {
                    content: 'Status gesetzt',
                    ephemeral: true,
                    custom: true
                }
            }
        }
        return {
            content: 'You must be in a Voicechannel and the creator off it!',
            ephemeral: true,
            custom: true
        }   
    }
} as ICommand
