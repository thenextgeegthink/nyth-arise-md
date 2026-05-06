const { f } = require('../../src/lib/ourin-http')
const te = require('../../src/lib/ourin-error')

const pluginConfig = {
    name: 'matematika',
    alias: ['mathgpt', 'math', 'mathsolver'],
    category: 'ai',
    description: 'AI untuk menyelesaikan soal matematika',
    usage: '.matematika <soal> atau reply gambar soal',
    example: '.matematika 2+2 berapa?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')

    if (!text) {
        return m.reply(`📐 *ᴍᴀᴛʜ ɢᴘᴛ*\n\n> Masukkan soal matematika\n\n\`Contoh: ${m.prefix}matematika 2+2 berapa?\``)
    }
    
    m.react('🕕')
    
    try {
        let url = `https://api.nexray.web.id/ai/mathgpt?text=${encodeURIComponent(text || 'solve this')}`
        const data = await f(url)

        const answer = data.result
        
        m.react('✅')
        await m.reply(`${answer}`)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
