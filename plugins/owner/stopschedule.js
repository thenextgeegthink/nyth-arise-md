const { stopSchedulerByName, getFullSchedulerStatus } = require('../../src/lib/ourin-scheduler');
const { stopSholatScheduler } = require('../../src/lib/ourin-sholat-scheduler');
const { getDatabase } = require('../../src/lib/ourin-database');
const te = require('../../src/lib/ourin-error')

const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: 'Menghentikan scheduler tertentu atau semua',
    usage: '.stopschedule <nama|all>',
    example: '.stopschedule sholat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    try {
        const target = args[0]?.toLowerCase();
        
        if (!target) {
            const helpText = `🛑 *sᴛᴏᴘ sᴄʜᴇᴅᴜʟᴇʀ*

*Usage:*
\`.stopschedule <nama>\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checker
• \`messages\` - Scheduled Messages
• \`sholat\` - Sholat Scheduler
• \`all\` - Semua scheduler

*Example:*
\`.stopschedule sholat\`
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = getDatabase();
            const wasEnabled = db.setting('autoSholat');
            
            if (!wasEnabled) {
                await m.reply(`ℹ️ Sholat Scheduler sudah dalam keadaan nonaktif`);
                return;
            }
            
            stopSholatScheduler();
            db.setting('autoSholat', false);
            
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *Sholat Scheduler*
> Status: ❌ Dihentikan

_Gunakan \`.startschedule sholat\` untuk mengaktifkan kembali_`);
            return;
        }
        
        if (target === 'all') {
            stopSholatScheduler();
            const db = getDatabase();
            db.setting('autoSholat', false);
        }
        
        const result = stopSchedulerByName(target);
        
        if (result.stopped) {
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *${result.name}*
> Status: ❌ Dihentikan

_Gunakan \`.startschedule ${target}\` untuk mengaktifkan kembali_`);
        } else {
            await m.reply(`❌ Scheduler tidak ditemukan atau sudah nonaktif

Gunakan \`.stopschedule\` untuk melihat daftar scheduler`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
