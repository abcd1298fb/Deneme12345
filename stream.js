const http = require('http');

module.exports = (req, res) => {
  // Hedef IPTV Yayın Adresi
  const targetUrl = 'http://185.243.7.47/live/play/WW5ZMVExWlNhVFJ0YVVsclpTdFlTbTE2U0RReFFXMUlPWHB2ZDB0alRUaHJlRWRSYzFKc01rdzJhejA9/1626874';

  // İstenen özel header'lar
  const options = {
    headers: {
      'User-Agent': 'XP Player',
      'Accept': '*/*',
      'Connection': 'keep-alive'
    }
  };

  http.get(targetUrl, options, (stream) => {
    // CORS (Cross-Origin) engellerini kaldırıyoruz
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', stream.headers['content-type'] || 'video/mp2t');

    // Yayın akışını istemciye aktar
    stream.pipe(res);
  }).on('error', (err) => {
    console.error('Yayın çekme hatası:', err.message);
    res.status(500).send('Stream Proxy Error: ' + err.message);
  });
};
