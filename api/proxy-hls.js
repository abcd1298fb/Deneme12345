const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const streamUrl = req.query.url;
    if (!streamUrl) return res.status(400).send('URL gerekli');

    try {
        const streamRes = await axios({
            method: 'get',
            url: streamUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://dlhd.st/',
                'Origin': 'https://dlhd.st'
            }
        });

        res.setHeader('Content-Type', streamRes.headers['content-type'] || 'application/x-mpegURL');
        streamRes.data.pipe(res);
    } catch (err) {
        res.status(500).send('Proxy hatası');
    }
};
