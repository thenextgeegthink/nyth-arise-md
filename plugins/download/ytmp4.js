const { f } = require('./../../src/lib/ourin-http')

const pluginConfig = {
    name: 'ytmp4',
    alias: ['youtubemp4', 'ytvideo'],
    category: 'download',
    description: 'Download video YouTube',
    usage: '.ytmp4 <url>',
    example: '.ytmp4 https://youtube.com/watch?v=xxx',
    cooldown: 20,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()
    if (!url) return m.reply(`Contoh: ${m.prefix}ytmp4 https://youtube.com/watch?v=xxx`)
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return m.reply('❌ URL harus YouTube')

    m.react('🕕')

    try {
        const { result } = await f(`https://api.nexray.web.id/downloader/ytmp4?url=${encodeURIComponent(url)}&resolusi=360`)

        await sock.sendButton(m.chat, result.thumbnail, result.title, m, {
          footer: `Silahkan pilih variant resolusi`,
          buttons: [
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '💧 Pilih Resolusi',
                sections: [
                  {
                    title: 'Resolusi tersedia:',
                    rows: [
                      {
                        title: '4K 2160p',
                        id: `${m.prefix}ytmp4-zann ${url} 2160`
                      },
                      {
                        title: '2K 1440p',
                        id: `${m.prefix}ytmp4-zann ${url} 1440`
                      },
                      {
                        title: 'HD 1080p',
                        id: `${m.prefix}ytmp4-zann ${url} 1080`
                      },
                      {
                        title: 'SD 720p',
                        id: `${m.prefix}ytmp4-zann ${url} 720`
                      },
                      {
                        title: 'SD 480p',
                        id: `${m.prefix}ytmp4-zann ${url} 480`
                      },
                      {
                        title: 'SD 360p',
                        id: `${m.prefix}ytmp4-zann ${url} 360`
                      },
                    ]
                  }
                ]
              })
            }
          ]
        })
        m.react('✅')

    } catch (err) {
        console.error('[YTMP4]', err)
        m.react('❌')
        m.reply('Gagal mengunduh video.')
    }
}

module.exports = {
    config: pluginConfig,
    handler
}