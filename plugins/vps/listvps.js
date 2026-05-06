const axios = require('axios')
const config = require('../../config')
const te = require('../../src/lib/ourin-error')

const pluginConfig = {
    name: ['listvps', 'listdroplet', 'vpslist'],
    alias: [],
    category: 'vps',
    description: 'List semua VPS DigitalOcean',
    usage: '.listvps',
    example: '.listvps',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function hasAccess(sender, isOwner) {
    if (isOwner) return true
    const cleanSender = sender?.split('@')[0]
    if (!cleanSender) return false
    const doConfig = config.digitalocean || {}
    return (doConfig.sellers || []).includes(cleanSender) || 
           (doConfig.ownerPanels || []).includes(cleanSender)
}

async function handler(m, { sock }) {
    const token = config.digitalocean?.token
    
    if (!token) {
        return m.reply(`⚠️ *ᴅɪɢɪᴛᴀʟᴏᴄᴇᴀɴ ʙᴇʟᴜᴍ ᴅɪsᴇᴛᴜᴘ*`)
    }
    
    if (!hasAccess(m.sender, m.isOwner)) {
        return m.reply(`❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*`)
    }
    
    await m.reply(`🕕 *ᴍᴇɴɢᴀᴍʙɪʟ ᴅᴀᴛᴀ ᴠᴘs...*`)
    
    try {
        const response = await axios.get('https://api.digitalocean.com/v2/droplets', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const droplets = response.data.droplets || []
        
        if (droplets.length === 0) {
            return m.reply(`📋 *ʟɪsᴛ ᴠᴘs*\n\n> Tidak ada VPS yang tersedia.`)
        }
        
        let txt = `📋 *ʟɪsᴛ ᴠᴘs ᴅɪɢɪᴛᴀʟᴏᴄᴇᴀɴ*\n`
        txt += `> Total: ${droplets.length} droplet\n\n`
        
        for (const droplet of droplets) {
            const ip = droplet.networks?.v4?.find(n => n.type === 'public')?.ip_address || '-'
            const status = droplet.status === 'active' ? '🟢' : '🔴'
            
            txt += `╭─────────────\n`
            txt += `┃ ${status} *${droplet.name}*\n`
            txt += `┃ 🆔 ID: \`${droplet.id}\`\n`
            txt += `┃ 🌐 IP: \`${ip}\`\n`
            txt += `┃ 💾 RAM: ${droplet.memory} MB\n`
            txt += `┃ ⚡ CPU: ${droplet.vcpus} vCPU\n`
            txt += `┃ 💿 Disk: ${droplet.disk} GB\n`
            txt += `┃ 📍 Region: ${droplet.region?.slug || '-'}\n`
            txt += `╰─────────────\n\n`
        }
        
        await m.reply(txt)
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
