import axios from 'axios';

export interface PinterestMedia {
    type: 'image' | 'video' | 'gif';
    url: string;
    downloadUrl?: string;
    width?: number;
    height?: number;
    thumbnail?: string;
}

export interface PinterestData {
    id: string;
    title: string;
    description: string;
    images: PinterestMedia[];
    videos: PinterestMedia[];
    author?: {
        name: string;
        avatar?: string;
    };
}

interface RawMediaItem {
    url?: string;
    width?: number;
    height?: number;
}

export async function downloadPinterest(url: string): Promise<PinterestData> {
    if (!url.includes('pin.it') && !url.includes('pinterest.com') && !url.includes('pinterest')) {
        throw new Error('Masukkan URL Pinterest yang valid');
    }

    try {
        const { data } = await axios.get('/api/pins/info', {
            headers: { 'content-type': 'application/json' },
            params: { url: url.trim() }
        });

        if (!data || data.status !== 'success' || !data.data) {
            throw new Error(data?.message || 'Gagal mengambil data');
        }

        const pinData = data.data;
        const idMatch = url.match(/pin\/(\d+)/);
        const pinId = idMatch ? idMatch[1] : (pinData.id || String(Date.now()));

        const result: PinterestData = {
            id: pinId,
            title: pinData.title || 'Pinterest Media',
            description: pinData.description?.trim() || '',
            images: [],
            videos: [],
            author: pinData.author ? {
                name: typeof pinData.author === 'string' ? pinData.author : (pinData.author.name || 'Pinterest User'),
                avatar: typeof pinData.author === 'object' ? pinData.author.avatar : undefined
            } : (pinData.pinner ? {
                name: pinData.pinner.full_name || pinData.pinner.username || 'Pinterest User',
                avatar: pinData.pinner.image_medium_url || pinData.pinner.image_small_url
            } : undefined)
        };

        // Scraper format
        if (pinData.videoUrl || pinData.videoHDUrl || pinData.videoUrl2) {
            result.videos.push({
                type: 'video',
                url: pinData.videoUrl || pinData.videoUrl2 || pinData.videoHDUrl,
                downloadUrl: pinData.videoHDUrl || pinData.videoUrl || pinData.videoUrl2,
                thumbnail: pinData.coverUrl
            });
        }

        if (pinData.imageUrl || pinData.imageHDUrl) {
            result.images.push({
                type: 'image',
                url: pinData.imageUrl || pinData.imageHDUrl,
                downloadUrl: pinData.imageHDUrl || pinData.imageUrl
            });
        } else if (pinData.coverUrl && result.videos.length > 0) {
            result.images.push({
                type: 'image',
                url: pinData.coverUrl,
                downloadUrl: pinData.coverUrl
            });
        }

        // Backward compatibility if nested media object exists
        if (result.images.length === 0 && result.videos.length === 0 && pinData.media) {
            const mediaType = pinData.media.media_type;
            const items = pinData.media.items;
            if (items && typeof items === 'object') {
                const values = Object.values(items) as RawMediaItem[];
                if (mediaType === 'video') {
                    const firstVideo = values.find((item) => item?.url);
                    if (firstVideo?.url) {
                        result.videos.push({
                            type: 'video',
                            url: firstVideo.url,
                            downloadUrl: firstVideo.url,
                            thumbnail: pinData.thumbnails?.orig?.url
                        });
                    }
                } else {
                    const firstImg = values.find((item) => item?.url);
                    if (firstImg?.url) {
                        result.images.push({
                            type: 'image',
                            url: firstImg.url,
                            downloadUrl: firstImg.url
                        });
                    }
                }
            }
        }

        // De-duplicate
        result.images = result.images.filter((img, index, self) =>
            index === self.findIndex(t => t.url === img.url)
        );
        result.videos = result.videos.filter((vid, index, self) =>
            index === self.findIndex(t => t.url === vid.url)
        );

        return result;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
                throw new Error('Terlalu banyak request. Coba lagi nanti.');
            }
            throw new Error(error.response?.data?.message || 'Gagal mengambil data dari Pinterest');
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Terjadi kesalahan saat memproses URL');
    }
}

export async function downloadMedia(url: string, filename: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
