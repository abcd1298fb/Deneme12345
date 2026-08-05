const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const channelId = req.query.id;
    if (!channelId) {
        return res.status(400).json({ error: 'Kanal ID gerekli.' });
    }

    try {
        const targetUrl = `https://dlhd.st/stream/${channelId}.php`;

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://dlhd.st/',
                'Origin': 'https://dlhd.st'
            }
        });

        const html = response.data;
        const m3u8Match = html.match(/(https?:\/\/[^"'s]+\.m3u8[^"'s]*)/i);

        if (m3u8Match && m3u8Match[1]) {
            return res.json({
                success: true,
                streamUrl: m3u8Match[1]
            });
        } else {
            const iframeMatch = html.match(/iframe[^>]+src=["']([^"']+)["']/i);
            if (iframeMatch && iframeMatch[1]) {
                return res.json({
                    success: true,
                    streamUrl: iframeMatch[1],
                    type: 'iframe'
                });
            }
            return res.status(444).json({ error: 'M3U8 linki ayıklanamadı.' });
        }

    } catch (error) {
        console.error('Fetch hatası:', error.message);
        res.status(500).json({ error: 'Yayın çekilirken sunucu hatası oluştu.' });
    }
};
