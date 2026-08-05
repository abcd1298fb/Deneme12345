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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://dlhd.st/',
                'Origin': 'https://dlhd.st',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            },
            timeout: 8000
        });

        const html = response.data;

        // 1. Doğrudan m3u8 linkini ara
        let m3u8Match = html.match(/(https?:\/\/[^"'s]+\.m3u8[^"'s]*)/i);

        // 2. Alternatif Clappr/Player kalıplarını ara
        if (!m3u8Match) {
            m3u8Match = html.match(/source:\s*["']([^"']+\.m3u8[^"']*)["']/i) || 
                        html.match(/file:\s*["']([^"']+\.m3u8[^"']*)["']/i);
        }

        if (m3u8Match && m3u8Match[1]) {
            return res.json({
                success: true,
                streamUrl: m3u8Match[1]
            });
        }

        // 3. Iframe içine gömülü başka bir kaynak var mı?
        const iframeMatch = html.match(/iframe[^>]+src=["']([^"']+)["']/i);
        if (iframeMatch && iframeMatch[1]) {
            return res.json({
                success: true,
                streamUrl: iframeMatch[1],
                type: 'iframe'
            });
        }

        // Çözülemezse HTML'in küçük bir özetini dön ki hatayı görelim
        return res.status(422).json({ 
            error: 'M3U8 ayıklanamadı.', 
            title: html.match(/<title>(.*?)<\/title>/i)?.[1] || 'Başlık Yok'
        });

    } catch (error) {
        return res.status(500).json({ 
            error: 'Sunucu hatası', 
            details: error.message 
        });
    }
};
