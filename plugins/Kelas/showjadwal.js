const fs = require('fs');
const path = require('path');

const pluginConfig = {
    name: 'showjadwal',
    alias: [],
    category: 'Kelas',
    description: 'Menampilkan daftar mata kuliah atau informasi detail jadwal.',
    usage: 's jdw | s [courseId]',
    example: 's jdw\ns 040',
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    isEnabled: true
};

async function handler(m, { sock }) {
    const args = m.args || [];
    if (args.length === 0) return;

    const query = args[0].toLowerCase();

    const dbPath = path.join(__dirname, '../../database/class/dbjadwal.json');
    let dbjadwal;
    try {
        if (!fs.existsSync(dbPath)) {
            return m.reply('❌ Database jadwal tidak ditemukan.');
        }
        dbjadwal = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch (e) {
        return m.reply('❌ Gagal membaca database jadwal.');
    }

    if (!dbjadwal.courses || dbjadwal.courses.length === 0) {
        return m.reply('Belum ada data jadwal mata kuliah.');
    }

    if (query === 'jdw' || query === 'jadwal') {
        let text = `📚 *DAFTAR MATA KULIAH*\n\n`;
        
        dbjadwal.courses.forEach((c, idx) => {
            text += `*${idx + 1}. ${c.courseName}*\n`;
            text += `└ ID: ${c.courseId} | ${c.day} | ${c.startTime} - ${c.endTime}\n\n`;
        });
        
        text += `\n> 💡 *Tips:* Ketik *s [ID]* (contoh: *s 040*) untuk melihat info detail.`;
        return m.reply(text.trim());
        
    } else if (!isNaN(query)) {
        const course = dbjadwal.courses.find(c => c.courseId === query);
        if (course) {
            let text = `ℹ️ *DETAIL MATA KULIAH*\n\n`;
            text += `🏷️ *Nama :* ${course.courseName}\n`;
            text += `🆔 *ID   :* ${course.courseId}\n`;
            text += `📅 *Hari :* ${course.day}\n`;
            text += `⏰ *Jam  :* ${course.startTime} - ${course.endTime}\n`;
            text += `👨‍🏫 *Dosen:* ${course.teacher}`;
            return m.reply(text.trim());
        } else {
            return m.reply(`❌ Mata kuliah dengan ID *${query}* tidak ditemukan.`);
        }
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
