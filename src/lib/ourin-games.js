const {
    getRandomItem, createSession, getSession, endSession,
    checkAnswerAdvanced, getHint, hasActiveSession, setSessionTimer,
    getRemainingTime, formatRemainingTime, isSurrender, isReplyToGame,
    getRandomReward, getProgressiveHint
} = require('./ourin-game-data')
const { getDatabase } = require('./ourin-database')
const { addExpWithLevelCheck } = require('./ourin-level')
const { getGameContextInfo, checkFastAnswer } = require('./ourin-context')

let fetchBuffer
try { fetchBuffer = require('./ourin-utils').fetchBuffer } catch {}

const WIN_MESSAGES = [
    '🌟 *GG WP! Otakmu encer!*',
    '✨ *KEREN ABIS! Lu emang pinter!*',
    '🎉 *MANTAPPPP! Jawaban sempurna!*',
    '💫 *EPIC! Gak ada lawan lu!*',
    '🏆 *NGERI! Otak lu kayak Google!*',
    '🔥 *LEGEND! Jawab kek gak ada beban!*'
]

const TIMEOUT_MESSAGES = [
    '⏱️ *Yah telat, waktu habis!*',
    '⏱️ *WAKTU HABIS!*',
    '⏱️ *Telat bro, waktu dah abis!*'
]

const SURRENDER_MESSAGES = [
    '🏳️ *Yahhh nyerah deh...*',
    '🏳️ *MENYERAH!*',
    '🏳️ *Yah sayang banget nyerah...*'
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

class OurinGames {
    constructor() {
        this.registry = new Map()
    }

    register(gameType, cfg) {
        const defaults = {
            dataFile: `${gameType}.json`,
            questionField: 'soal',
            answerField: 'jawaban',
            emoji: '🎮',
            title: gameType.toUpperCase(),
            description: `Game ${gameType}`,
            timeout: 60000,
            cooldown: 5,
            hasImage: false,
            imageField: 'img',
            alias: [],
            hintCount: 2
        }
        this.registry.set(gameType, { ...defaults, ...cfg, gameType })
    }

    get(gameType) {
        return this.registry.get(gameType)
    }

    createHandler(gameType) {
        const cfg = this.registry.get(gameType)
        if (!cfg) throw new Error(`Game "${gameType}" not registered`)

        const handler = async (m, { sock }) => {
            const chatId = m.chat

            if (hasActiveSession(chatId)) {
                const session = getSession(chatId)
                if (session && session.gameType === gameType) {
                    const remaining = getRemainingTime(chatId)
                    const answer = session.question[cfg.answerField]
                    let text = `⚠️ *Eh ada game jalan nih, jawab dulu!*\n\n`
                    if (cfg.questionField && session.question[cfg.questionField]) {
                        text += `\`\`\`${session.question[cfg.questionField]}\`\`\`\n\n`
                    }
                    text += `💡 Hint: *${getHint(answer, cfg.hintCount)}*\n`
                    text += `⏱️ Sisa: *${formatRemainingTime(remaining)}*\n\n`
                    text += `_Jawab langsung atau ketik "nyerah"\nSetiap salah, hint akan bertambah_`
                    await m.reply(text)
                    return
                }
            }

            const question = getRandomItem(cfg.dataFile)
            if (!question) {
                await m.reply('❌ *ᴅᴀᴛᴀ ᴛɪᴅᴀᴋ ᴛᴇʀsᴇᴅɪᴀ*\n\n> Data game tidak tersedia!')
                return
            }

            const answer = question[cfg.answerField]
            let sentMsg

            if (cfg.hasImage && fetchBuffer) {
                let imageBuffer
                try {
                    imageBuffer = await fetchBuffer(question[cfg.imageField])
                } catch {
                    await m.reply('❌ *ɢᴀɢᴀʟ ᴍᴇᴍᴜᴀᴛ ɢᴀᴍʙᴀʀ*\n\n> Coba lagi nanti!')
                    return
                }

                let caption = `${cfg.emoji} *${cfg.title}*\n\n`
                if (cfg.questionField && question[cfg.questionField]) {
                    caption += `> ${question[cfg.questionField]}\n`
                }
                caption += `💡 Hint: *${getHint(answer, cfg.hintCount)}*\n`
                caption += `⏱️ Waktu: *${cfg.timeout / 1000} detik*\n`
                caption += `🎁 Hadiah: *Limit, Koin, EXP (random)*\n\n`
                caption += `_Jawab langsung atau ketik "nyerah"\nSetiap salah, hint akan bertambah_`

                sentMsg = await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption,
                    contextInfo: getGameContextInfo(`${cfg.emoji} ${cfg.title}`, 'Tebak jawabannya!')
                }, { quoted: m })
            } else {
                let text = `${cfg.emoji} *${cfg.title}*\n\n`
                if (cfg.questionField && question[cfg.questionField]) {
                    text += `\`\`\`${question[cfg.questionField]}\`\`\`\n\n`
                }
                text += `💡 Hint: *${getHint(answer, cfg.hintCount)}*\n`
                text += `⏱️ Waktu: *${cfg.timeout / 1000} detik*\n`
                text += `🎁 Hadiah: *Limit, Koin, EXP (random)*\n\n`
                text += `_Jawab langsung atau ketik "nyerah"\nSetiap salah, hint akan bertambah_`

                sentMsg = await sock.sendMessage(chatId, {
                    text,
                    contextInfo: getGameContextInfo(`${cfg.emoji} ${cfg.title}`, 'Jawab pertanyaan!')
                }, { quoted: m })
            }

            createSession(chatId, gameType, question, sentMsg.key, cfg.timeout)

            setSessionTimer(chatId, async () => {
                let text = `${pick(TIMEOUT_MESSAGES)}\n\n`
                text += `Jawaban: *${answer}*\n\n`
                text += `_Gak ada yang bisa jawab nih~_`
                await m.reply(text)
            })
        }

        const answerHandler = async (m, sock) => {
            const chatId = m.chat
            const session = getSession(chatId)

            if (!session || session.gameType !== gameType) return false

            const userAnswer = (m.body || '').trim()
            if (!userAnswer || userAnswer.startsWith('.')) return false

            if (isSurrender(userAnswer)) {
                endSession(chatId)
                const answer = session.question[cfg.answerField]
                let text = `${pick(SURRENDER_MESSAGES)}\n\n`
                text += `Jawaban: *${answer}*\n\n`
                text += `_@${m.sender.split('@')[0]} menyerah_`
                await m.reply(text, { mentions: [m.sender] })
                return true
            }

            if (!isReplyToGame(m, session)) return false

            session.attempts++

            const answer = session.question[cfg.answerField]
            const result = checkAnswerAdvanced(answer, userAnswer)

            if (result.status === 'correct') {
                endSession(chatId)

                const db = getDatabase()
                const user = db.getUser(m.sender)

                const reward = getRandomReward()
                let totalLimit = reward.limit
                let totalBalance = reward.koin
                let totalExp = reward.exp
                let bonusText = ''

                const fastResult = checkFastAnswer(session)
                if (fastResult.isFast) {
                    totalLimit += fastResult.bonus.limit
                    totalBalance += fastResult.bonus.koin
                    totalExp += fastResult.bonus.exp
                    bonusText = `\n\n${fastResult.praise}\n⚡ *BONUS KILAT:* +${fastResult.bonus.limit} Limit, +${fastResult.bonus.koin} Koin\n⏱️ Waktu: *${(fastResult.elapsed / 1000).toFixed(1)}s*`
                }

                db.updateEnergi(m.sender, totalLimit)
                db.updateKoin(m.sender, totalBalance)

                if (!user.rpg) user.rpg = {}
                await addExpWithLevelCheck(sock, m, db, user, totalExp)
                db.save()

                let text = `${pick(WIN_MESSAGES)}\n\n`
                text += `Jawaban: *${answer}*\n`
                text += `Pemenang: *@${m.sender.split('@')[0]}*\n`
                text += `Percobaan: *${session.attempts}x*\n\n`
                text += `🎁 +${totalLimit} Limit, +${totalBalance} Koin, +${totalExp} EXP`
                text += bonusText

                await m.reply(text, { mentions: [m.sender] })
                return true
            }

            if (result.status === 'close') {
                const remaining = getRemainingTime(chatId)
                const percent = Math.round(result.similarity * 100)
                await m.react('🔥')
                await m.reply(`🔥 *Hampir!* Jawabanmu *${percent}%* mirip!\n_Sisa waktu: *${formatRemainingTime(remaining)}*_`)
                return false
            }

            const remaining = getRemainingTime(chatId)
            if (remaining > 0 && session.attempts < 10) {
                await m.react('❌')
                const hint = getProgressiveHint(answer, session.attempts)
                await m.reply(`❌ Belum bener! Hint: *${hint}*\n_Sisa: *${formatRemainingTime(remaining)}*_`)
            }

            return false
        }

        return { handler, answerHandler }
    }

    createPlugin(gameType, overrides = {}) {
        const cfg = this.registry.get(gameType)
        if (!cfg) throw new Error(`Game "${gameType}" not registered`)

        const { handler, answerHandler } = this.createHandler(gameType)

        return {
            config: {
                name: gameType,
                alias: cfg.alias,
                category: 'game',
                description: cfg.description,
                usage: `.${gameType}`,
                example: `.${gameType}`,
                isOwner: false,
                isPremium: false,
                isGroup: false,
                isPrivate: false,
                cooldown: cfg.cooldown,
                energi: 0,
                isEnabled: true,
                ...overrides
            },
            handler,
            answerHandler
        }
    }
}

const games = new OurinGames()

games.register('asahotak',      { alias: ['asah', 'quiz'],                  emoji: '🧠', title: 'ASAH OTAK',       description: 'Game asah otak - tebak jawaban' })
games.register('caklontong',    { alias: ['cak', 'lontong'],                emoji: '🤔', title: 'CAK LONTONG',     description: 'Game cak lontong - jawaban receh' })
games.register('tekateki',      { alias: ['teka'],                          emoji: '🧩', title: 'TEKA-TEKI',       description: 'Game teka-teki tradisional' })
games.register('tebakkata',     { alias: ['tk', 'guessword'],               emoji: '📝', title: 'TEBAK KATA',      description: 'Tebak kata dari petunjuk' })
games.register('tebakkalimat',  { alias: ['tkl', 'peribahasa'],             emoji: '📖', title: 'TEBAK KALIMAT',   description: 'Tebak kalimat atau peribahasa' })
games.register('tebakfilm',     { alias: ['tf', 'guessmovie'],              emoji: '🎬', title: 'TEBAK FILM',      description: 'Tebak judul film' })
games.register('tebaklagu',     { alias: ['tl', 'guesssong'],               emoji: '🎵', title: 'TEBAK LAGU',      description: 'Tebak judul lagu' })
games.register('tebaklirik',    { alias: [],                                emoji: '🎤', title: 'TEBAK LIRIK',     description: 'Tebak lirik lagu' })
games.register('tebakhewan',    { alias: ['th', 'guessanimal'],             emoji: '🐾', title: 'TEBAK HEWAN',     description: 'Tebak nama hewan' })
games.register('tebaknegara',   { alias: ['tn', 'guesscountry'],            emoji: '🌍', title: 'TEBAK NEGARA',    description: 'Tebak nama negara' })
games.register('tebakprofesi',  { alias: ['tp', 'guessjob'],                emoji: '👨‍💼', title: 'TEBAK PROFESI',  description: 'Tebak nama profesi' })
games.register('tebaktebakan',  { alias: ['tbt', 'tebak2an', 'receh'],      emoji: '😄', title: 'TEBAK-TEBAKAN',   description: 'Tebak-tebakan receh' })
games.register('siapakahaku',   { alias: ['siapa', 'whoami'],               emoji: '🎭', title: 'SIAPAKAH AKU',    description: 'Tebak dari deskripsi' })
games.register('riddle',        { alias: ['rd', 'tebaktebak', 'riddles'],   emoji: '❓', title: 'RIDDLE',           description: 'Riddle/tebak-tebakan' })
games.register('kataacak',      { alias: ['ka', 'acakkata'],                emoji: '🔤', title: 'KATA ACAK',        description: 'Susun huruf acak' })
games.register('susunkata',     { alias: ['susun', 'scramble'],             emoji: '🔠', title: 'SUSUN KATA',       description: 'Susun kata dari huruf' })
games.register('tebakkimia',    { alias: ['kimia', 'chemistry', 'unsur'],   emoji: '🧪', title: 'TEBAK KIMIA',     description: 'Tebak unsur kimia', answerField: 'lambang' })

games.register('tebakbendera',  { alias: ['tbendera', 'flag'],              emoji: '🏳️', title: 'TEBAK BENDERA',  description: 'Tebak negara dari bendera', dataFile: 'tebakbendera2.json', answerField: 'name', hasImage: true })
games.register('tebakgambar',   { alias: ['tg', 'guessimage'],              emoji: '🖼️', title: 'TEBAK GAMBAR',   description: 'Tebak kata dari gambar', timeout: 90000, hasImage: true, questionField: null, hintCount: 3 })
games.register('tebakepep',     { alias: ['epep', 'freefire', 'ff'],        emoji: '🔫', title: 'TEBAK EPEP',      description: 'Tebak karakter Free Fire', hasImage: true })
games.register('tebakjkt48',    { alias: ['jkt48', 'jkt'],                  emoji: '🎀', title: 'TEBAK JKT48',     description: 'Tebak member JKT48', hasImage: true })
games.register('tebakdrakor',   { alias: ['drakor', 'kdrama'],              emoji: '🇰🇷', title: 'TEBAK DRAKOR',   description: 'Tebak judul drama Korea', hasImage: true })
games.register('tebakmakanan',  { alias: ['makanan', 'food'],               emoji: '🍲', title: 'TEBAK MAKANAN',   description: 'Tebak nama makanan', hasImage: true })

module.exports = { OurinGames, games }
