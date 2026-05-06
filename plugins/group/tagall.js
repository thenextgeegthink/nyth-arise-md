const { getParticipantJid, getParticipantJids } = require('../../src/lib/ourin-lid')
const te = require('../../src/lib/ourin-error')

const pluginConfig = {
    name: 'tagall',
    alias: ['all', 'everyone'],
    category: 'group',
    description: 'Tag semua member grup',
    usage: '.tagall <pesan>',
    example: '.tagall Halo semua!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

async function handler(m, { sock }) {
    const text = m.text || 'Tag All Members'

    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []

        if (participants.length === 0) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ada member di grup ini.`)
            return
        }

        const mentions = getParticipantJids(participants)
        const memberList = participants.map((p, i) => `@${getParticipantJid(p).split('@')[0]}`).join('\n').trim()

        await m.reply(`*Pesan:* ${text}\n\n` +
            `\`\`\`━━━ ${participants.length} MEMBER TOTAL ━━━\`\`\`\n` +
            memberList, { mentions: mentions })

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
