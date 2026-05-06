const config = require('../../config')
const fs = require('fs')
const path = require('path')

const pluginConfig = {
    name: 'script',
    alias: ['sc', 'sourcecode', 'source'],
    category: 'main',
    description: 'Dapatkan source code bot',
    usage: '.script',
    example: '.script',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: false
}

async function handler(m, { sock }) {
    try {
        const botName = config.bot?.name || 'Nyth Arise'
        const footer = config.settings?.footer || `© ${botName} 2026`
        const saluranId = config.saluran?.id || '120363427172686797@newsletter'
        const saluranName = config.saluran?.name || botName
        const saluranUrl = config.saluran?.url || 'https://chat.whatsapp.com/IHMJBi1NRdbL2myhIv7fxB'
        const scriptUrl = "https://github.com/thenextgeegthink/nyth-arise-md"
        const scriptPrice = 0

        const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg')
        let thumbBuffer = null
        if (fs.existsSync(thumbPath)) {
            thumbBuffer = fs.readFileSync(thumbPath)
        }

        await sock.sendMessage(m.chat, {
            productMessage: {
                title: `${botName}`,
                description: `Source code WhatsApp Bot ${botName}\n\nFitur:\n• Multi-device support\n• 500+ Commands\n• Anti-spam & Anti-link\n• Game & RPG System\n• Panel Management\n• Auto-update`,
                thumbnail: thumbBuffer ? { url: thumbPath } : undefined,
                productId: 'SCRIPT001',
                retailerId: botName,
                url: scriptUrl,
                body: `Dapatkan script ${botName} sekarang!`,
                footer: footer,
                priceAmount1000: scriptPrice * 1000,
                currencyCode: 'IDR',
                buttons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📦 Download di GitHub',
                            url: scriptUrl
                        })
                    }
                ]
            },
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 99,
                isForwarded: true,
            }
        }, { quoted: m })

    } catch (error) {
        console.error('[Script] Error:', error.message)

        const botName = config.bot?.name || 'Nyth Arise'
        const scriptUrl = config.script?.url || 'https://github.com/thenextgeegthink/nyth-arise-md'
        const saluranUrl = config.saluran?.url || 'https://chat.whatsapp.com/IHMJBi1NRdbL2myhIv7fxB'

        await m.reply(
            `📦 *${botName} Source Code*\n\n` +
            `Nama : ${botName}\n` +
            `Harga : ${config.script?.price ? `Rp ${config.script.price.toLocaleString('id-ID')}` : 'FREE'}\n` +
            `GitHub : ${scriptUrl}\n` +
            `Saluran : ${saluranUrl}\n` +
            `\n` +
            `> Hubungi owner untuk info lebih lanjut`
        )
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
