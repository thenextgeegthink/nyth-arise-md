const { findParticipantByNumber } = require('../../src/lib/ourin-lid')
const te = require('../../src/lib/ourin-error')

const pluginConfig = {
    name: 'kick',
    alias: ['remove', 'tendang'],
    category: 'group',
    description: 'Kick member dari grup, dengan opsi kick khusus oleh owner',
    usage: '.kick @user | pesan (opsional)',
    example: '.kick @user | bye bye',
    isOwner: false,
    isPremium: false,
    isGroup: false,      // Changed from true to allow kicking from outside
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: false,      // Handled manually script-side since we can interact from outside
    isBotAdmin: false    // Handled manually script-side
}

async function handler(m, { sock }) {
    let text = m.args.join(" ") || '';
    let [mainArgs, customMessage] = text.split('|').map(v => v ? v.trim() : '');
    let parts = (mainArgs || '').split(' ').filter(v => v);

    let targetGroup = m.chat;
    let isAll = false;

    // Check if first arg is a group JID
    if (parts.length > 0 && parts[0].endsWith('@g.us')) {
        targetGroup = parts[0];
        parts.shift();
    } else if (!m.isGroup) {
        return m.reply(`❌ *Gagal*\n\n> Masukkan JID group jika menggunakan fitur ini di private chat!\n> Contoh: \`${m.prefix}kick 120363xxx@g.us all\``);
    }

    if (targetGroup !== m.chat && !m.isOwner) {
        return m.reply("❌ *Akses Ditolak*\n\n> Hanya Owner yang bisa kick dari luar grup!");
    }

    if (parts.length > 0 && parts[0].toLowerCase() === 'all') {
        isAll = true;
        parts.shift();
        if (!m.isOwner) {
            return m.reply("❌ *Akses Ditolak*\n\n> Hanya Owner yang bisa kick all!");
        }
    }

    const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

    let groupMeta;
    try {
        groupMeta = m.chat === targetGroup && m.groupMetadata ? m.groupMetadata : await sock.groupMetadata(targetGroup);
    } catch (e) {
        return m.reply("❌ *Gagal*\n\n> Grup tidak ditemukan atau bot bukan member di grup tersebut.");
    }

    const botParticipant = findParticipantByNumber(groupMeta.participants, botNumber);
    if (!botParticipant || !botParticipant.admin) {
        return m.reply(`❌ *Gagal*\n\n> Bot harus menjadi admin grup!`);
    }

    if (!m.isOwner && m.chat === targetGroup) {
        const senderParticipant = findParticipantByNumber(groupMeta.participants, m.sender);
        if (!senderParticipant || !senderParticipant.admin) {
            return m.reply("👮 Admin grup only!");
        }
    }

    if (isAll) {
        if (customMessage) {
            await sock.sendMessage(targetGroup, { text: customMessage });
            await new Promise(resolve => setTimeout(resolve, 5000)); // Jeda 5 detik
        }
        
        let membersToKick = groupMeta.participants.filter(p => !p.admin && p.id !== botNumber && p.id !== m.sender);
        
        let initialMsg = await sock.sendMessage(m.chat, { text: `Memulai kick ${membersToKick.length} member non-admin...` }, { quoted: m });
        
        let count = 0;
        let batchSize = 5;
        for (let i = 0; i < membersToKick.length; i += batchSize) {
            let batch = membersToKick.slice(i, i + batchSize).map(p => p.id);
            await sock.groupParticipantsUpdate(targetGroup, batch, 'remove').catch(() => {});
            count += batch.length;
            if (i + batchSize < membersToKick.length) {
                await new Promise(resolve => setTimeout(resolve, 3000)); // Jeda 3 detik setiap 5 member
            }
        }
        await m.reply(`✅ Selesai kick ${count} member dari ${groupMeta.subject || targetGroup}.`);
        return;
    }

    // Normal Kick
    let targetJid = null;
    if (m.quoted) {
        targetJid = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0];
    } else if (parts.length > 0) {
        targetJid = parts[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    }

    if (!targetJid) {
        await m.reply(
            `❌ *ᴛᴀʀɢᴇᴛ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n` +
            `> Reply pesan user atau mention!\n` +
            `> Contoh: \`${m.prefix}kick @user\``
        );
        return;
    }

    const targetNumber = targetJid.replace(/@.*$/, '');

    if (targetJid === botNumber || targetNumber === botNumber.replace(/@.*$/, '')) {
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak bisa kick bot sendiri!`);
        return;
    }

    if (targetJid === m.sender) {
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak bisa kick diri sendiri!`);
        return;
    }

    try {
        const targetParticipant = findParticipantByNumber(groupMeta.participants, targetJid)
        
        if (!targetParticipant) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> User tidak ditemukan dalam grup!`)
            return
        }
        
        if (targetParticipant.admin) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak bisa kick admin grup!`)
            return
        }
        
        if (customMessage) {
            await sock.sendMessage(targetGroup, { text: customMessage, mentions: [targetJid] });
            await new Promise(resolve => setTimeout(resolve, 5000)); // Jeda 5 detik
        }

        await sock.groupParticipantsUpdate(targetGroup, [targetParticipant.id], 'remove')

        await sock.sendMessage(m.chat, {
            text: `✅ @${targetNumber} telah dikeluarkan dari grup ${targetGroup !== m.chat ? (groupMeta.subject || targetGroup) : "ini"}.`,
            mentions: [targetJid]
        }, { quoted: m });

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
