const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const channelId = req.query.id; // örn: stream-51
    if (!channelId) {
        return res.status(400).json({ error: 'Kanal ID gerekli.' });
    }

    // DLHD'nin güncel alan adları üzerinden deneme yapıyoruz
    const possibleDomains = [
        `https://dlhd.sx/stream/${channelId}.php`,
        `https://dlhd.so/stream/${channelId}.php`,
        `https://dlhd.st/stream/${channelId}.php`
    ];

    let html = null;

    for (const targetUrl of possibleDomains) {
        try {
            const response = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Referer': 'https://dlhd.sx/',
                    'Origin': 'https://dlhd.sx'
                },
                timeout: 5000
            });
            if (response.status === 200) {
                html = response.data;
                break;
            }
        } catch (e) {
            // Bu domain çalışmadı, sıradakine geç
        }
    }

    if (!html) {
        return res.status(404).json({ error: 'Yayın kaynağına ulaşılamadı (404 / Alan adı değişmiş olabilir).' });
    }

    // M3U8 veya oynatıcı linkini ayıkla
    let m3u8Match = html.match(/(https?:\/\/[^"'s]+\.m3u8[^"'s]*)/i) ||
                    html.match(/source:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                    html.match(/file:\s*["']([^"']+\.m3u8[^"']*)["']/i);

    if (m3u8Match && m3u8Match[1]) {
        return res.json({
            success: true,
            streamUrl: m3u8Match[1]
        });
    }

    return res.status(422).json({ error: 'Sayfa açıldı fakat M3U8 linki bulunamadı.' });
};
