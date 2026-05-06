const { getAllPlugins } = require('../../src/lib/ourin-plugins')
const { createCanvas } = require('@napi-rs/canvas')
const config = require('../../config')
const te = require('../../src/lib/ourin-error')

const pluginConfig = {
    name: 'totalfitur',
    alias: ['totalfeature', 'totalcmd', 'countplugin', 'distribusi'],
    category: 'main',
    description: 'Lihat total fitur/command bot',
    usage: '.totalfitur',
    example: '.totalfitur',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const ICONS = {
    main: '🏠', tools: '🔧', downloader: '📥', download: '📥', sticker: '🎨',
    ai: '🤖', media: '📷', game: '🎮', rpg: '⚔️', maker: '🖼️', fun: '🎭',
    group: '👥', owner: '👑', premium: '💎', info: '📊', search: '🔍',
    canvas: '🎨', anime: '🌸', nsfw: '🔞', utility: '🛠️', economy: '💰',
    stalker: '🔎', random: '🎲', religi: '🕌', islamic: '☪️', cek: '✅',
    store: '🛒', panel: '🖥️', convert: '🔄', primbon: '🔮', tts: '🗣️',
    otp: '🔑', vps: '☁️', pushkontak: '📱', jpm: '🎰', ephoto: '📸',
    other: '📦'
}

const PALETTE = [
    '#a78bfa', '#22d3ee', '#f472b6', '#4ade80', '#fbbf24',
    '#fb923c', '#f87171', '#38bdf8', '#c084fc', '#34d399',
    '#e879f9', '#2dd4bf', '#facc15', '#818cf8', '#fb7185',
]

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r) }

async function renderChart(cats, total, enabled) {
    const sorted = Object.entries(cats).sort((a, b) => b[1].total - a[1].total)
    const top10 = sorted.slice(0, 10)
    const maxVal = Math.max(...top10.map(([, d]) => d.total))

    const W = 920, H = 620
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#0f0a1e')
    bg.addColorStop(0.3, '#0d1117')
    bg.addColorStop(0.7, '#0a1628')
    bg.addColorStop(1, '#12101f')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    const g1 = ctx.createRadialGradient(150, 300, 0, 150, 300, 350)
    g1.addColorStop(0, '#7c3aed10'); g1.addColorStop(1, 'transparent')
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)
    const g2 = ctx.createRadialGradient(W - 150, 200, 0, W - 150, 200, 300)
    g2.addColorStop(0, '#06b6d40c'); g2.addColorStop(1, 'transparent')
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H)
    const g3 = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 400)
    g3.addColorStop(0, '#ec489908'); g3.addColorStop(1, 'transparent')
    ctx.fillStyle = g3; ctx.fillRect(0, 0, W, H)

    ctx.save(); ctx.globalAlpha = 0.015
    for (let i = 0; i < W; i += 35) { ctx.strokeStyle = '#a78bfa'; ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke() }
    for (let i = 0; i < H; i += 35) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke() }
    ctx.globalAlpha = 1; ctx.restore()

    ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'left'
    ctx.fillText('📊 FEATURE DISTRIBUTION', 30, 40)
    ctx.fillStyle = '#64748b'; ctx.font = '10px Arial'
    ctx.fillText(`${config.bot?.name || 'Nyth Arise'} • Command Statistics`, 30, 60)

    const badges = [
        { label: 'TOTAL', val: total, c: '#a78bfa' },
        { label: 'ACTIVE', val: enabled, c: '#4ade80' },
        { label: 'CATEGORIES', val: sorted.length, c: '#22d3ee' },
    ]
    badges.forEach((b, i) => {
        const bx = W - 390 + i * 125
        ctx.save()
        rr(ctx, bx, 18, 115, 48, 10)
        ctx.fillStyle = `${b.c}12`; ctx.fill()
        ctx.strokeStyle = `${b.c}40`; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle = b.c; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'
        ctx.shadowColor = b.c; ctx.shadowBlur = 10
        ctx.fillText(b.val, bx + 57, 40); ctx.shadowBlur = 0
        ctx.fillStyle = '#94a3b8'; ctx.font = '8px Arial'
        ctx.fillText(b.label, bx + 57, 56)
        ctx.restore()
    })

    const sep = ctx.createLinearGradient(30, 76, W - 30, 76)
    sep.addColorStop(0, '#7c3aed50'); sep.addColorStop(0.5, '#22d3ee30'); sep.addColorStop(1, '#f472b650')
    ctx.strokeStyle = sep; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(30, 76); ctx.lineTo(W - 30, 76); ctx.stroke()

    const pcx = 155, pcy = 265, pr = 100

    ctx.save()
    const outerGlow = ctx.createRadialGradient(pcx, pcy, pr, pcx, pcy, pr + 30)
    outerGlow.addColorStop(0, '#a78bfa08'); outerGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = outerGlow; ctx.beginPath(); ctx.arc(pcx, pcy, pr + 30, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    let sa = -Math.PI / 2
    top10.forEach(([, data], i) => {
        const angle = (data.total / total) * Math.PI * 2
        const c = PALETTE[i % PALETTE.length]
        ctx.save()
        ctx.beginPath(); ctx.moveTo(pcx, pcy); ctx.arc(pcx, pcy, pr, sa, sa + angle); ctx.closePath()
        ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 10; ctx.fill()
        ctx.restore()
        ctx.beginPath(); ctx.moveTo(pcx, pcy); ctx.arc(pcx, pcy, pr, sa, sa + angle); ctx.closePath()
        ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2; ctx.stroke()
        sa += angle
    })
    if (sorted.length > 10) {
        const rest = sorted.slice(10).reduce((a, [, d]) => a + d.total, 0)
        const angle = (rest / total) * Math.PI * 2
        ctx.save()
        ctx.beginPath(); ctx.moveTo(pcx, pcy); ctx.arc(pcx, pcy, pr, sa, sa + angle); ctx.closePath()
        ctx.fillStyle = '#475569'; ctx.fill()
        ctx.restore()
    }

    ctx.save()
    ctx.beginPath(); ctx.arc(pcx, pcy, 42, 0, Math.PI * 2)
    ctx.fillStyle = '#0d1117'; ctx.fill()
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(total.toString(), pcx, pcy - 4)
    ctx.fillStyle = '#94a3b8'; ctx.font = '8px Arial'; ctx.fillText('COMMANDS', pcx, pcy + 14)
    ctx.restore()

    const barX = 310, barW = 300, barH = 22, barGap = 38
    let barY = 100

    top10.forEach(([cat, data], i) => {
        const y = barY + i * barGap
        const pct = ((data.total / total) * 100).toFixed(1)
        const fw = (data.total / maxVal) * barW
        const c = PALETTE[i % PALETTE.length]
        const icon = ICONS[cat] || '📦'

        ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
        ctx.fillText(`${icon} ${cat.toUpperCase()}`, barX - 10, y + barH / 2)

        rr(ctx, barX, y, barW, barH, 5); ctx.fillStyle = '#1e293b'; ctx.fill()

        if (fw > 6) {
            ctx.save()
            const barGrad = ctx.createLinearGradient(barX, 0, barX + fw, 0)
            barGrad.addColorStop(0, c); barGrad.addColorStop(1, `${c}80`)
            rr(ctx, barX, y, fw, barH, 5); ctx.fillStyle = barGrad; ctx.shadowColor = c; ctx.shadowBlur = 6; ctx.fill()
            ctx.restore()
            if (fw > 30) { ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'left'; ctx.fillText(data.total.toString(), barX + 8, y + barH / 2) }
        }

        ctx.fillStyle = '#94a3b8'; ctx.font = '9px Arial'; ctx.textAlign = 'left'
        ctx.fillText(`${pct}%`, barX + barW + 10, y + barH / 2)
    })

    const lgX = 660, lgY = 90
    ctx.save()
    rr(ctx, lgX, lgY, 235, Math.min(sorted.length * 19 + 40, H - lgY - 30), 10)
    const lgBg = ctx.createLinearGradient(lgX, lgY, lgX, lgY + 400)
    lgBg.addColorStop(0, '#1e293b40'); lgBg.addColorStop(1, '#0f172a30')
    ctx.fillStyle = lgBg; ctx.fill()
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.7; ctx.stroke()
    ctx.beginPath(); ctx.moveTo(lgX, lgY + 10); ctx.arcTo(lgX, lgY, lgX + 10, lgY, 10); ctx.lineTo(lgX + 35, lgY)
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0
    ctx.restore()

    ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'left'
    ctx.fillText('ALL CATEGORIES', lgX + 14, lgY + 18)

    let ly = lgY + 38
    sorted.forEach(([cat, data], i) => {
        const c = PALETTE[i % PALETTE.length]
        const icon = ICONS[cat] || '📦'
        const pct = ((data.total / total) * 100).toFixed(0)

        ctx.beginPath(); ctx.arc(lgX + 14, ly, 4, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill()
        ctx.fillStyle = '#e2e8f0'; ctx.font = '9px Arial'; ctx.textAlign = 'left'
        ctx.fillText(`${icon} ${cat}`, lgX + 24, ly + 3)
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'right'
        ctx.fillText(`${data.total} (${pct}%)`, lgX + 222, ly + 3)
        ly += 19
    })

    ctx.save()
    rr(ctx, 0, H - 45, W, 45, 0)
    const footGrad = ctx.createLinearGradient(0, H - 45, 0, H)
    footGrad.addColorStop(0, '#a78bfa08'); footGrad.addColorStop(1, '#a78bfa02')
    ctx.fillStyle = footGrad; ctx.fill()
    ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'
    ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 12
    ctx.fillText(`⚡ ${total} FEATURES AVAILABLE`, W / 2, H - 24); ctx.shadowBlur = 0
    ctx.fillStyle = '#64748b'; ctx.font = '8px Arial'
    ctx.fillText(`${config.bot?.name || 'Ourin'} • ${require('moment-timezone')().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm')} WIB`, W / 2, H - 8)
    ctx.restore()

    return canvas.toBuffer('image/png')
}

async function handler(m, { sock }) {
    try {
        const allPlugins = getAllPlugins()
        const cats = {}
        let total = 0, enabled = 0

        for (const p of allPlugins) {
            if (!p.config) continue
            const cat = p.config.category || 'other'
            if (!cats[cat]) cats[cat] = { total: 0, enabled: 0 }
            cats[cat].total++
            total++
            if (p.config.isEnabled !== false) { cats[cat].enabled++; enabled++ }
        }

        await m.react('📊')
        const img = await renderChart(cats, total, enabled)

        let dbUsers = 0, dbGroups = 0
        try { const db = require('../../src/lib/ourin-database').getDatabase(); if (db?.data) { dbUsers = Object.keys(db.data.users || {}).length; dbGroups = Object.keys(db.data.groups || {}).length } } catch { }

        const sorted = Object.entries(cats).sort((a, b) => b[1].total - a[1].total)

        let caption =
            `*Statistik*\n` +
            `- Total: *${total}*\n` +
            `- Aktif: *${enabled}*\n` +
            `- Nonaktif: *${total - enabled}*\n` +
            `- Kategori: *${sorted.length}*\n\n` +
            `*Database*\n` +
            `- Users: *${dbUsers}*\n` +
            `- Groups: *${dbGroups}*\n\n` +
            `*Kategori*\n`

        sorted.forEach(([cat, data]) => {
            const pct = ((data.total / total) * 100).toFixed(1)
            const icon = ICONS[cat] || '📦'
            caption += `${icon} \`${cat.toUpperCase()}\`: *${data.total}* _(${pct}%)_\n`
        })

        caption += `\n\n> ⚡ *${total}* fitur tersedia`

        await sock.sendMessage(m.chat, {
            image: img, caption,
            contextInfo: { forwardingScore: 99, isForwarded: true }
        }, { quoted: m })

    } catch (error) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

module.exports = { config: pluginConfig, handler }
