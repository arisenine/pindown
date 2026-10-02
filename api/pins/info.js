import * as cheerio from 'cheerio';

async function resolvePinterestUrl(inputUrl) {
    if (!inputUrl) return '';
    let target = inputUrl.trim();
    if (target.includes('pin.it')) {
        try {
            const headRes = await fetch(target, { redirect: 'follow', method: 'GET' });
            if (headRes.url && headRes.url.includes('pinterest.com/pin/')) {
                target = headRes.url;
            }
        } catch {
            // ignore redirect error and use target
        }
    }
    return target;
}

export async function scrapePinterest(url) {
    const resolvedUrl = await resolvePinterestUrl(url);

    const formtoken = new FormData();
    formtoken.append('url', resolvedUrl);
    formtoken.append('lang', 'id');

    const headers = {
        'origin': 'https://ssspin.io',
        'referer': 'https://ssspin.io/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    };

    const tokenResponse = await fetch('https://ssspin.io/action/token', {
        method: 'POST',
        body: formtoken,
        headers
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData || !tokenData.success) {
        throw new Error(tokenData?.message || 'Gagal mendapatkan token untuk pin ini');
    }

    const vtoken = tokenData.vtoken;
    const form = new FormData();
    form.append('lang', 'id');
    form.append('url', resolvedUrl);
    form.append('vtoken', vtoken);

    const response = await fetch('https://ssspin.io/action', {
        method: 'POST',
        body: form,
        headers
    });

    const data = await response.json();
    if (!data || !data.success) {
        throw new Error(data?.message || 'Gagal mengambil media dari Pinterest');
    }

    const $ = cheerio.load(data.html);

    const videoUrl = $('video').attr('src');
    const videoHDUrl = $('.result_actions a[title*="Video HD"]').attr('href');
    const videoUrl2 = $('.result_actions a[title*="Link Download"]').attr('href');
    const coverUrl = $('video').attr('poster');

    const imageUrl = $('.pinterestImage img').attr('src') || (!videoUrl ? $('img').attr('src') : undefined);
    const imageHDUrl = $('.result_actions a[title*="Gambar HD"]').attr('href') || $('.result_actions a[title*="Image"]').attr('href');

    const title = $('.title').text().trim() || 'Pinterest Pin';
    const author = $('.result_author').text().trim() || 'Pinterest User';

    return {
        success: true,
        title,
        author,
        coverUrl,
        imageUrl,
        imageHDUrl,
        videoUrl,
        videoHDUrl,
        videoUrl2
    };
}

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: 'error', message: 'URL is required' });
    }

    try {
        const result = await scrapePinterest(url);
        return res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal Server Error'
        });
    }
}
