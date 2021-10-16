const axios = require("axios")
const rax = require("retry-axios")
var inquirer = require("inquirer")
const config = require("./config.json")
let token = config.token
var guildroles = []
var guildchannels = []
var newschannels = []
var webinterval = 2000
var messages = []
var channelids = []
var webhooks = []
var oldchannelids = []
var webid = []
axios.defaults.baseURL = "https://discord.com/api/v8"
async function checktoken() {
    await new Promise(async function (resolve, reject) {
        await axios(`/users/@me`, {
            method: "GET",
            headers: {
                Authorization: "Bot " + token,
                "Content-Type": "application/json",
            },
            raxConfig: {
                retry: 5,
                onRetryAttempt: (error) => {
                    const config = rax.getConfig(error)
                    console.log(
                        `Retry attempt #${config.currentRetryAttempt}`
                    )
                },
            },
        })
            .then((response) => {
                global.mainhead = {
                    Authorization: "Bot " + token,
                    "Content-Type": "application/json",
                }
                global.secondhead = { Authorization: "Bot " + token }
                resolve()
            })
            .catch(async function (error) {
                await axios(`/users/@me`, {
                    method: "GET",
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                    raxConfig: {
                        retry: 5,
                        onRetryAttempt: (error) => {
                            const config = rax.getConfig(error)
                            console.log(
                                `Retry attempt #${config.currentRetryAttempt}`
                            )
                        },
                    },
                })
                    .then((response) => {
                        global.mainhead = {
                            Authorization: token,
                            "Content-Type": "application/json",
                        }
                        global.secondhead = { Authorization: token }
                        resolve()
                    })
                    .catch((error) => {
                        console.log("Error verifying token info")
                        resolve()
                    })
            })
    })
}
async function getguild() {
    await axios(`/guilds/${guildid}`, { method: "GET", headers: mainhead })
        .then(async function (response) {
            console.log("successfully fetched guild")
            if (response.data.icon !== null) {
                await axios
                    .get(
                        `https://cdn.discordapp.com/icons/${response.data.id}/${response.data.icon}.png?size=4096`,
                        { responseType: "arraybuffer" }
                    )
                    .then((response) => {
                        Buffer.from(response.data, "binary").toString(
                            "base64"
                        )
                        global.guildicon =
                            "data:image/png;base64," +
                            Buffer.from(response.data, "binary").toString(
                                "base64"
                            )
                    })
            } else {
                global.guildicon = null
            }
            global.copiedguildid = response.data.id
            global.guildfeatures = response.data.features
            global.guildname =
                response.data.name + " | Cloned By Social404 On YT"
            global.guildexplicit = response.data.explicit_content_filter
            global.guildnotifications =
                response.data.default_message_notifications
            global.guildverification = response.data.verification_level
            global.afkid = response.data.afk_channel_id
            global.afktime = response.data.afk_timeout
            global.systemid = response.data.system_channel_id
            global.guildregion = response.data.region
            global.guildrules = response.data.rules_channel_id
            global.guildpublic = response.data.public_updates_channel_id
        })
        .catch((error) => {
            console.log("error getting guild" + error)
        })
}
async function getroles() {
    await axios(`/guilds/${guildid}/roles`, {
        method: "GET",
        headers: mainhead,
    })
        .then(async function (response) {
            console.log("successfully fetched roles")
            response.data.map(async function (role) {
                guildroles.push({
                    name: role.name,
                    permissions: role.permissions,
                    id: role.id,
                    position: role.position,
                    color: role.color,
                    hoist: role.hoist,
                    mentionable: role.mentionable,
                })
            })
            guildroles.sort((A, B) => {
                return A.position > B.position ? 1 : -1
            })
        })
        .catch((error) => {
            console.log("error getting roles" + error)
        })
}
async function getchannels() {
    await axios(`/guilds/${guildid}/channels`, {
        method: "GET",
        headers: mainhead,
    })
        .then(async function (response) {
            console.log("successfully fetched channels")
            response.data.map(async function (channel) {
                if (channel.type == 4) {
                    guildchannels.push({
                        name: channel.name,
                        type: channel.type,
                        id: channel.id,
                        parent_id: channel.parent_id,
                        permission_overwrites: channel.permission_overwrites,
                        nsfw: channel.nsfw,
                        pos: channel.position,
                    })
                } else {
                    if (channel.type == 0) {
                        guildchannels.push({
                            name: channel.name,
                            type: channel.type,
                            id: channel.id,
                            parent_id: channel.parent_id,
                            permission_overwrites:
                                channel.permission_overwrites,
                            topic: channel.topic,
                            nsfw: channel.nsfw,
                            rate_limit_per_user: channel.rate_limit_per_user,
                            po: channel.position,
                        })
                    } else {
                        if (channel.type == 2) {
                            guildchannels.push({
                                name: channel.name,
                                type: channel.type,
                                id: channel.id,
                                parent_id: channel.parent_id,
                                permission_overwrites:
                                    channel.permission_overwrites,
                                topic: channel.topic,
                                nsfw: channel.nsfw,
                                bitrate: channel.bitrate,
                                user_limit: channel.user_limit,
                                po: channel.position,
                            })
                        } else {
                            if (channel.type == 5) {
                                guildchannels.push({
                                    name: channel.name,
                                    type: 0,
                                    id: channel.id,
                                    parent_id: channel.parent_id,
                                    permission_overwrites:
                                        channel.permission_overwrites,
                                    topic: channel.topic,
                                    nsfw: channel.nsfw,
                                    po: channel.position,
                                })
                                newschannels.push({
                                    name: channel.name,
                                    type: channel.type,
                                    id: channel.id,
                                    parent_id: channel.parent_id,
                                    po: channel.position,
                                })
                            }
                        }
                    }
                }
            })
            guildchannels.sort((A, B) => {
                return A.parent_id > B.parent_id ? 1 : -1
            })
            guildchannels.sort((A, B) => {
                return A.pos < B.pos ? 1 : -1
            })
            guildchannels.sort((A, B) => {
                return A.po > B.po ? 1 : -1
            })
        })
        .catch((error) => {
            console.log("error getting channels" + error)
        })
}
async function createguild() {
    let _0xa744x1f = rax.attach()
    await axios(`guilds`, {
        method: "POST",
        headers: secondhead,
        raxConfig: {
            retry: 5,
            onRetryAttempt: (error) => {
                const config = rax.getConfig(error)
                console.log(`Retry attempt #${config.currentRetryAttempt}`)
            },
        },
        data: {
            name: guildname,
            icon: guildicon,
            roles: guildroles,
            channels: guildchannels,
            region: guildregion,
            verification_level: guildverification,
            default_message_notifications: guildnotifications,
            explicit_content_filter: guildexplicit,
            afk_channel_id: afkid,
            afk_timeout: afktime,
            system_channel_id: systemid,
        },
    })
        .then(async function (response) {
            console.log("created guild")
            global.newguildid = response.data.id
        })
        .catch((error) => {
            console.log("error creating guild " + error)
        })
}
async function addcom() {
    let _0xa744x1f = rax.attach()
    await axios(`guilds/${guildid}`, {
        method: "PATCH",
        headers: secondhead,
        raxConfig: {
            retry: 5,
            onRetryAttempt: (error) => {
                const config = rax.getConfig(error)
                console.log(`Retry attempt #${config.currentRetryAttempt}`)
            },
        },
        data: {
            features: guildfeatures,
            verification_level: guildverification,
            default_message_notifications: guildnotifications,
            explicit_content_filter: guildexplicit,
            rules_channel_id: guildrules,
        },
    })
        .then(async function (response) {
            console.log(response.data)
        })
        .catch((error) => {
            console.log("error adding community " + error)
        })
}
async function create() {
    await checktoken()
    await getguild()
    await getroles()
    await getchannels()
    await createguild()
}
async function scrapeoldc() {
    channelids = []
    await axios(`/guilds/${copiedguildid}/channels`, {
        method: "GET",
        headers: secondhead,
    }).then((response) => {
        console.log("successfully scraped old channels")
        response.data.map((channel) => {
            if (channel.type == 0 || channel.type == 5) {
                oldchannelids.push({
                    name: channel.name,
                    type: channel.type,
                    id: channel.id,
                    parent_id: channel.parent_id,
                    permission_overwrites: channel.permission_overwrites,
                    topic: channel.topic,
                    nsfw: channel.nsfw,
                    rate_limit_per_user: channel.rate_limit_per_user,
                    po: channel.position,
                })
            }
        })
        oldchannelids.sort((A, B) => {
            return A.parent_id > B.parent_id ? 1 : -1
        })
        oldchannelids.sort((A, B) => {
            return A.pos < B.pos ? 1 : -1
        })
        oldchannelids.sort((A, B) => {
            return A.po > B.po ? 1 : -1
        })
    })
}
async function scrapec() {
    channelids = []
    await axios(`/guilds/${newguildid}/channels`, {
        method: "GET",
        headers: secondhead,
    }).then((response) => {
        console.log("successfully scraped channels")
        response.data.map((channel) => {
            if (channel.type == 0 || channel.type == 5) {
                channelids.push(channel.id)
            }
        })
    })
}
async function getmsgs(oldchannelids) {
    messages = []
    await axios(`/channels/${oldchannelids}/messages?limit=99`, {
        method: "GET",
        headers: secondhead,
        raxConfig: {
            retry: 5,
            onRetryAttempt: (error) => {
                const config = rax.getConfig(error)
                console.log(`Retry attempt #${config.currentRetryAttempt}`)
            },
        },
    })
        .then(async function (response) {
            console.log("successfully fetched messages")
            response.data.map(async function (message) {
                if (
                    message.type !== 7 &&
                    message.type !== 8 &&
                    message.type !== 9 &&
                    message.type !== 10 &&
                    message.type !== 11
                ) {
                    messages.push({
                        content: message.content,
                        username: message.author.username,
                        avatar_url:
                            "https://cdn.discordapp.com/avatars/" +
                            message.author.id +
                            "/" +
                            message.author.avatar +
                            ".png",
                        file: message.attachments,
                        embeds: message.embeds,
                        mentions: message.mentions,
                        mention_roles: message.mention_roles,
                        pinned: message.pinned,
                        mention_everyone: message.mention_everyone,
                        tts: message.tts,
                        timestamp: message.timestamp,
                        edited_timestamp: message.edited_timestamp,
                        flags: message.flags,
                        type: message.type,
                    })
                }
            })
            messages.reverse()
        })
        .catch((error) => {
            console.log("error getting messages" + error)
        })
}
async function createwebhook(channelids) {
    await axios(`/channels/${channelids}/webhooks`, {
        method: "POST",
        headers: secondhead,
        data: { name: "Replay" },
    })
        .then(async function (response) {
            console.log("successfully created webhook")
        })
        .catch((error) => {
            console.log("error creating webhook" + error)
        })
}
async function getweb(channelids) {
    var i = 0
    webhooks = []
    await axios(`/channels/${channelids}/webhooks`, {
        method: "GET",
        headers: mainhead,
    })
        .then((response) => {
            console.log("successfully fetched webhooks")
            response.data.map((webhook) => {
                i++
                webhooks.push(
                    `https://discord.com/api/webhooks/${webhook.id}/` +
                        webhook.token
                )
                webid.push(webhook.id)
            })
        })
        .catch((error) => {
            console.log("error getting webhooks" + error)
        })
}
async function sendmsgs(webhooks) {
    return new Promise((resolve, reject) => {
        if (messages.length == 0) {
            resolve()
        }
        var j = 0
        for (var i = 0; i < messages.length; i++) {
            setTimeout(
                async function (i) {
                    axios(webhooks, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        data: messages[i],
                        raxConfig: {
                            retry: 5,
                            onRetryAttempt: (error) => {
                                const config = rax.getConfig(error)
                                console.log(
                                    `Retry attempt #${config.currentRetryAttempt}`
                                )
                            },
                        },
                    })
                        .then(async function (response) {
                            console.log(response.status)
                            j++
                            if (j >= messages.length) {
                                resolve()
                            }
                        })
                        .catch((error) => {
                            console.log("error sending message" + error)
                            j++
                            if (j >= messages.length) {
                                resolve()
                            }
                        })
                },
                2000 * i,
                i
            )
        }
    })
}
async function deleteweb(webid) {
    await axios(`/webhooks/${webid}`, { method: "DELETE", headers: mainhead })
        .then((response) => {
            console.log("Successfully Deleted Webhook")
        })
        .catch((error) => {
            console.log("Failed To Delete Webhook")
        })
}
async function copymsgs() {
    await scrapeoldc()
    await scrapec()
    await getmsgs(oldchannelids[2].id)
    await createwebhook(channelids[2])
    await getweb(channelids[2])
    await sendmsgs(webhooks[0])
    await deleteweb(webid[0])
}
async function copy(oldchannelids, channelids, webhooks, webid) {
    await scrapeoldc()
    await scrapec()
    await getmsgs(oldchannelids)
    await createwebhook(channelids)
    await getweb(channelids)
    await sendmsgs(webhooks)
    await deleteweb(webid)
}
async function execute(oldchannelids, channelids, webhooks, webid) {
    for (var i = 0; i < 10; i++) {
        await copy(
            oldchannelids[i].id,
            channelids[i],
            webhooks[0],
            webid[0]
        )
    }
}
async function send() {
    await scrapeoldc()
    await scrapec()
    for (var i = 0; i < channelids.length; i++) {
        await getmsgs(oldchannelids[i].id)
        await createwebhook(channelids[i])
        await getweb(channelids[i])
        await sendmsgs(webhooks[0])
        await deleteweb(webid[i])
    }
}
async function make() {
    await create()
    await send()
}
console.log(`

	

	



███╗   ██╗ ██████╗██╗      ██████╗ ███╗   ██╗███████╗

████╗  ██║██╔════╝██║     ██╔═══██╗████╗  ██║██╔════╝

██╔██╗ ██║██║     ██║     ██║   ██║██╔██╗ ██║█████╗  

██║╚██╗██║██║     ██║     ██║   ██║██║╚██╗██║██╔══╝  

██║ ╚████║╚██████╗███████╗╚██████╔╝██║ ╚████║███████╗

╚═╝  ╚═══╝ ╚═════╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

Made By Social404

Github: https://github.com/social404     

Youtube: https://www.youtube.com/channel/UCXk0klxbjcVgGvYyKWLgtLg/

Discord Server: https://discord.gg/UzTqHJQPSs                                                                                         

	

	`)
inquirer
    .prompt({
        type: "input",
        name: "guild",
        message: "ID of the Server You Want to Clone : ",
    })
    .then(async function (args) {
        global.guildid = args.guild
        make()
    })
