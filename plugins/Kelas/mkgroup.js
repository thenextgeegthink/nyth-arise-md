const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const moment = require('moment-timezone')
const config = require('../../config')

const pluginConfig = {
    name: 'mkgroup',
    alias: ['mkg'],
    category: 'Kelas',
    description: 'Membuat kelompok belajar secara acak berdasarkan database',
    usage: 'mkg [courseId] org <jumlah> | mkg [courseId] kel <jumlah> | mkg get <id>',
    example: 'mkg org 3\nmkg kel 5\nmkg 029 org 3\nmkg get a1b2c3',
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || [];
    if (args.length < 2) {
        return m.reply(`Format salah!\n\nContoh:\n- *mkg org 3* (membuat kelompok dengan masing-masing 3 orang)\n- *mkg kel 5* (membagi kelas menjadi 5 kelompok)\n- *mkg 029 org 3* (dengan Course ID jadwal)\n- *mkg get <id>* (memanggil kelompok yang sudah tersimpan)`)
    }

    const botName = config.bot?.name || 'Nyth Arise';
    const saluranId = config.saluran?.id || '120363427172686797@newsletter';
    const saluranName = config.saluran?.name || botName;

    const dbkelompokPath = path.join(__dirname, '../../database/class/dbkelompok.json');

    // Handle panggil database kelompok
    if (args[0].toLowerCase() === 'get' && args[1]) {
        const groupId = args[1];
        if (!fs.existsSync(dbkelompokPath)) {
            return m.reply('Belum ada database kelompok yang tersimpan.');
        }
        
        try {
            const dbkelompok = JSON.parse(fs.readFileSync(dbkelompokPath, 'utf-8'));
            if (dbkelompok.groups && dbkelompok.groups[groupId]) {
                const text = dbkelompok.groups[groupId];
                
                const copyButtons = [{
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: `📋 Salin Kelompok`,
                        copy_code: text
                    })
                }];

                return await sock.sendMessage(m.chat, {
                    text: text,
                    footer: botName,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: saluranId,
                            newsletterName: saluranName,
                            serverMessageId: 127
                        }
                    },
                    interactiveButtons: copyButtons
                }, { quoted: m });
            } else {
                return m.reply(`Kelompok dengan ID *${groupId}* tidak ditemukan.`);
            }
        } catch (e) {
            return m.reply('Gagal membaca database kelompok.');
        }
    }

    let courseId = null;
    let type = '';
    let amount = 0;

    // Cek apakah argumen pertama adalah angka (courseId)
    if (!isNaN(args[0]) && args.length >= 3) {
        courseId = args[0];
        type = args[1].toLowerCase();
        amount = parseInt(args[2]);
    } else {
        type = args[0].toLowerCase();
        amount = parseInt(args[1]);
    }

    if (isNaN(amount) || amount <= 0) {
        return m.reply('Jumlah harus berupa angka lebih dari 0.');
    }

    if (type !== 'org' && type !== 'kel') {
        return m.reply('Tipe harus "org" atau "kel".');
    }

    // Load DB
    const dbmhsPath = path.join(__dirname, '../../database/class/dbmhs.json');
    const dbjadwalPath = path.join(__dirname, '../../database/class/dbjadwal.json');
    
    let students = [];
    let courseName = '';

    try {
        const dbmhs = JSON.parse(fs.readFileSync(dbmhsPath, 'utf-8'));
        students = dbmhs.students.map(s => {
            // Special case for Rahman
            if (s.name.includes('Rahman Hanafi')) return 'Rahman';
            return s.name.split(' ')[0]; // Ambil nama depan
        });
    } catch (e) {
        return m.reply('Gagal membaca database mahasiswa.');
    }

    if (courseId) {
        try {
            const dbjadwal = JSON.parse(fs.readFileSync(dbjadwalPath, 'utf-8'));
            const course = dbjadwal.courses.find(c => c.courseId === courseId);
            if (course) {
                courseName = course.courseName;
            } else {
                return m.reply(`Mata Kuliah dengan ID ${courseId} tidak ditemukan.`);
            }
        } catch (e) {
            return m.reply('Gagal membaca database jadwal.');
        }
    }

    // Total groups
    let totalGroups = type === 'kel' ? amount : Math.ceil(students.length / amount);
    if (totalGroups < 1) totalGroups = 1;
    if (totalGroups > students.length) totalGroups = students.length;

    let groups = Array.from({ length: totalGroups }, () => []);
    
    let pool = [...students];
    const rahmanIdx = pool.findIndex(name => name === 'Rahman');
    const almiraIdx = pool.findIndex(name => name === 'Almira');

    // 80% chance Rahman and Almira are in the same group
    if (rahmanIdx !== -1 && almiraIdx !== -1 && Math.random() < 0.8) {
        pool = pool.filter(name => name !== 'Rahman' && name !== 'Almira');
        
        let randomGroup = Math.floor(Math.random() * totalGroups);
        groups[randomGroup].push('Rahman', 'Almira');
    }

    // Shuffle remaining pool
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Distribute evenly by adding to the group with the least members
    for (let student of pool) {
        let minGroup = 0;
        let minSize = groups[0].length;
        for (let i = 1; i < totalGroups; i++) {
            if (groups[i].length < minSize) {
                minSize = groups[i].length;
                minGroup = i;
            }
        }
        groups[minGroup].push(student);
    }

    const dateStr = moment().tz('Asia/Jakarta').format('DD MMMM YYYY');
    const groupId = crypto.randomBytes(3).toString('hex');

    let text = ``;
    if (courseName) {
        text += `📚 *Mata Kuliah:* ${courseName}\n`;
    } else {
        text += `📚 *Pembagian Kelompok*\n`;
    }
    text += `🆔 *ID Grup:* ${groupId}\n`;
    text += `📅 *Tanggal Dibentuk:* ${dateStr}\n`;
    text += `👥 *Total Kelompok:* ${totalGroups}\n`;
    text += `🧮 *Sistem Pembagian:* Acak (Random)\n\n`;

    for (let i = 0; i < totalGroups; i++) {
        text += `*Kelompok ${i + 1}*\n`;
        for (let member of groups[i]) {
            text += `- ${member}\n`;
        }
        text += `\n`;
    }
    
    text = text.trim();

    // Simpan ke database
    try {
        let dbkelompok = { groups: {} };
        if (fs.existsSync(dbkelompokPath)) {
            dbkelompok = JSON.parse(fs.readFileSync(dbkelompokPath, 'utf-8'));
        }
        if (!dbkelompok.groups) dbkelompok.groups = {};
        dbkelompok.groups[groupId] = text;
        fs.writeFileSync(dbkelompokPath, JSON.stringify(dbkelompok, null, 2));
    } catch (e) {
        console.error('Gagal menyimpan database kelompok:', e);
    }

    const copyButtons = [{
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
            display_text: `📋 Salin Kelompok`,
            copy_code: text
        })
    }];

    await sock.sendMessage(m.chat, {
        text: text,
        footer: botName,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: saluranId,
                newsletterName: saluranName,
                serverMessageId: 127
            }
        },
        interactiveButtons: copyButtons
    }, { quoted: m });
}

module.exports = {
    config: pluginConfig,
    handler
}
