const axios = require('axios'),
    rax = require('retry-axios'),
    inquirer = require('inquirer'),
    config = require('./config.json'),
    raxConfig = {
        retry: 5,
        onRetryAttempt: (retry_index) => {
            const currentConfig = rax.getConfig(retry_index)
            console.log(
                `Retry attempt #${currentConfig.currentRetryAttempt}`
            )
        },
    },
    token = config.token,
    guildRoles = [],
    guildChannels = [],
    newChannels = [],
    messages = [],
    channelId = [],
    webhooks = [],
    channelId = [],
    webhookId = []

axios.defaults.baseURL = 'https://discord.com/api/v8'

async function checkToken(user_token = true) {
    const auth = `${!user_token ? 'Bot ' : ''}${token}`
    try {
        const response = await axios('/users/@me', {
            method: 'GET',
            headers: {
                Authorization: auth,
                'Content-Type': 'application/json',
            },
            raxConfig,
        })
        global.headers = {
            Authorization: auth,
            'Content-Type': 'application/json',
        }
        return response
    } catch (error) {
        console.log('Error verifying token info')
        throw error
    }
}

async function getIconFrom(guild_id, icon_id, size = 4096) {
    try {
        const response = await axios.get(
            `https://cdn.discordapp.com/icons/${guild_id}/${icon_id}.png?size=${size}`,
            { responseType: 'arraybuffer' }
        )
        return Buffer.from(response.data, 'binary').toString('base64')
    } catch (error) {
        console.log('error getting guild icon')
        throw error
    }
}

async function getGuild() {
    try {
        const response = await axios(`/guilds/${guildid}`, {
            method: 'GET',
            headers: global.headers,
        })
        console.log('successfully fetched guild')

        global.guildicon = null
        global.copiedguildid = response.data.id
        global.guildfeatures = response.data.features
        global.guildname = response.data.name + ' | Cloned By Social404 On YT'
        global.guildexplicit = response.data.explicit_content_filter
        global.guildnotifications = response.data.default_message_notifications
        global.guildverification = response.data.verification_level
        global.afkid = response.data.afk_channel_id
        global.afktime = response.data.afk_timeout
        global.systemid = response.data.system_channel_id
        global.guildregion = response.data.region
        global.guildrules = response.data.rules_channel_id
        global.guildpublic = response.data.public_updates_channel_id

        if (response.data.icon !== null) {
            global.guildicon = await getIconFrom(response.data.id, response.data.icon)
        }

        return
    } catch (error) {
        console.log('error getting guild' + error)
        throw error
    }
}

async function getRoles() {
    try {
        const response = await axios(`/guilds/${guildid}/roles`, {
            method: 'GET',
            headers: global.headers,
        })

        console.log('successfully fetched roles')
        response.data.map(function (role) {
            guildRoles.push({
                name: role.name,
                permissions: role.permissions,
                id: role.id,
                position: role.position,
                color: role.color,
                hoist: role.hoist,
                mentionable: role.mentionable,
            })
        })

        guildRoles.sort((role_1, role_2) => {
            return role_1.position > role_2.position ? 1 : -1
        })

        return
    } catch (error) {
        console.log('error getting roles' + error)
        throw error
    }
}

async function getChannels() {
    try {
        const response = await axios(`/guilds/${guildid}/channels`, {
            method: 'GET',
            headers: global.headers,
        })

        console.log('successfully fetched channels')
        response.data.map(function (channel) {
            if (channel.type == 5) {
                newChannels.push(channel)
            }
            guildChannels.push(channel)
        })
        guildChannels.sort((channel_1, channel_2) => {
            return channel_1.parent_id > channel_2.parent_id ? 1 : -1
        })
        guildChannels.sort((channel_1, channel_2) => {
            return channel_1.position < channel_2.position ? 1 : -1
        })
        return
    } catch (error) {
        console.log('error getting channels' + error)
        throw error
    }
}

async function createGuild() {
    rax.attach()
    try {
        const response = await axios('/guilds', {
            method: 'POST',
            headers: global.headers,
            raxConfig,
            data: {
                name: guildname,
                icon: guildicon,
                roles: guildRoles,
                channels: guildChannels,
                region: guildregion,
                verification_level: guildverification,
                default_message_notifications: guildnotifications,
                explicit_content_filter: guildexplicit,
                afk_channel_id: afkid,
                afk_timeout: afktime,
                system_channel_id: systemid,
            },
        })
        console.log('created guild')
        global.newguildid = response.data.id
        return
    } catch (error) {
        console.log('error creating guild ' + error)
        throw error
    }
}

async function create() {
    await checkToken()
    await getGuild()
    await getRoles()
    await getChannels()
    await createGuild()
}

async function getChannelsData() {
    channelId = []
    try {
        const response = await axios(`/guilds/${copiedguildid}/channels`, {
            method: 'GET',
            headers: global.headers,
        })
        console.log('successfully scraped old channels')
        response.data.map((channel) => {
            if ([0, 5].includes(channel.type)) {
                channelId.push(channel)
            }
        })
        channelId.sort((channel_1, channel_2) => {
            return channel_1.parent_id > channel_2.parent_id ? 1 : -1
        })
        channelId.sort((channel_1, channel_2) => {
            return channel_1.position < channel_2.position ? 1 : -1
        })
        return channelId
    } catch (error) {
        throw error
    }
}

async function getMessagesFrom(channelId, limit = 99) {
    messages = []
    try {
        const response = await axios(
            `/channels/${channelId}/messages?limit=${limit}`,
            {
                method: 'GET',
                headers: global.headers,
                raxConfig
            }
        )

        console.log('successfully fetched messages')
        response.data.map(async function (message_sent) {
            if (![7, 8, 9, 10, 11].includes(message_sent.type)) {
                messages.push({
                    ...message,
                    avatar_url:
                        'https://cdn.discordapp.com/avatars/' +
                        message_sent.author.id +
                        '/' +
                        message_sent.author.avatar +
                        '.png',
                })
            }
        })
        messages.reverse()
        return messages
    } catch (error) {
        console.log('error getting messages' + error)
        throw error
    }
}

async function createWebhook(channelId) {
    try {
        const response = await axios(`/channels/${channelId}/webhooks`, {
            method: 'POST',
            headers: global.headers,
            data: { name: 'Replay' },
        })

        console.log('successfully created webhook')
        return response
    } catch (error) {
        console.log('error creating webhook' + error)
        throw error
    }
}

async function getWebhooksFrom(channelId) {
    webhooks = []
    try {
        const response = await axios(`/channels/${channelId}/webhooks`, {
            method: 'GET',
            headers: global.headers,
        })

        console.log('successfully fetched webhooks')
        response.data.map((webhook) => {
            webhooks.push(
                `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`
            )
            webhookId.push(webhook.id)
        })
        return webhooks
    } catch (error) {
        console.log('error getting webhooks' + error)
        throw error
    }
}

async function sendMessagesUsing(webhooks) {
    if (messages.length == 0) {
        return
    }
    var message_count = 0
    for (var i = 0; i < messages.length; i++) {
        setTimeout(
            async function (i) {
                try {
                    const response = await axios(webhooks, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        data: messages[i],
                        raxConfig
                    })

                    console.log(response.status)
                    message_count++
                    if (message_count >= messages.length) {
                        return
                    }
                } catch (error) {
                    console.log('error sending message' + error)
                    throw error
                }
            },
            2000 * i,
            i
        )
    }
}

async function deleteWebhook(webhookId) {
    try {
        const response = await axios(`/webhooks/${webhookId}`, {
            method: 'DELETE',
            headers: global.headers,
        })
        console.log('Successfully Deleted Webhook')
        return
    } catch (error) {
        console.log('Failed To Delete Webhook')
        throw error
    }
}

async function send() {
    await getChannelsData(copiedguildid)
    await getChannelsData(newguildid)
    for (var i = 0; i < channelId.length; i++) {
        await getMessagesFrom(channelId[i].id)
        await createWebhook(channelId[i])
        await getWebhooksFrom(channelId[i])
        await sendMessagesUsing(webhooks[0])
        await deleteWebhook(webhookId[i])
    }
}

async function make() {
    await create()
    await send()
}

console.log(`Credits I guess...`)

inquirer
    .prompt({
        type: 'input',
        name: 'guild',
        message: 'ID of the Server You Want to Clone : ',
    })
    .then(async function (args) {
        global.guildid = args.guild
        await make()
    })
