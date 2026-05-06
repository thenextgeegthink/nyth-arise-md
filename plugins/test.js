const fs = require('fs')
const config = require('../config')

const pluginConfig = {
    name: 'testing',
    alias: ['test'],
    category: 'main',
    description: 'Test plugin - Send PTV to newsletter',
    usage: '.test',
    isOwner: true,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    await m.react('🕕')
    await sock.sendMessage(m.chat, {
                        text: `*Halo @${m.pushName} 👋*`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 9,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterName: "Zinn Zunn Zann",
                                newsletterJid: "-@newsletter"
                            },
                            externalAdReply: {
                                title: `WELCOME TO ${m.sender.toUpperCase()}`,
                                body: `Join Our Community`,
                                thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                                sourceUrl: config.info?.grupwa || '',
                                mediaUrl: config.info?.grupwa || '',
                                mediaType: 2,
                                // renderLargerThumbnail: true
                            }
                        }
                    })
}

module.exports = {
    config: pluginConfig,
    handler
}