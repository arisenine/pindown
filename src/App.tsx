import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Loader2,
  AlertCircle,
  X,
  Github,
  Clipboard,
  Check,
  History,
  Trash2,
  Share2,
  Play
} from 'lucide-react';
import type { PinterestData } from './services/pinterest';
import { downloadPinterest, downloadMedia } from './services/pinterest';

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  author?: string;
  thumbnail?: string;
  type: 'video' | 'image';
  downloadUrl: string;
  timestamp: number;
}

const EXAMPLE_VIDEO = 'https://id.pinterest.com/pin/608830443366641592/';
const EXAMPLE_IMAGE = 'https://www.pinterest.com/pin/1073404892456929315/';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<PinterestData | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Muat riwayat dari localStorage saat awal buka
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pindown_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Abaikan jika storage dinonaktifkan
    }
  }, []);

  const saveToHistory = (result: PinterestData, originalUrl: string) => {
    const isVideo = result.videos.length > 0;
    const media = isVideo ? result.videos[0] : result.images[0];
    if (!media) return;

    const newItem: HistoryItem = {
      id: result.id || String(Date.now()),
      url: originalUrl,
      title: result.title || 'Pinterest Media',
      author: result.author?.name,
      thumbnail: media.thumbnail || media.url,
      type: isVideo ? 'video' : 'image',
      downloadUrl: media.downloadUrl || media.url,
      timestamp: Date.now()
    };

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== originalUrl);
      const updated = [newItem, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('pindown_history', JSON.stringify(updated));
      } catch {
        // Abaikan jika kuota storage penuh
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('pindown_history');
    } catch {
      // Abaikan
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      // Izin clipboard ditolak
    }
  };

  const processUrl = async (targetUrl: string) => {
    if (!targetUrl.trim() || loading) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await downloadPinterest(targetUrl.trim());
      setData(result);
      if (result.images.length === 0 && result.videos.length === 0) {
        setError('Media tidak ditemukan atau pin bersifat privat.');
      } else {
        saveToHistory(result, targetUrl.trim());
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data dari Pinterest');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    processUrl(url);
  };

  const handleDownload = async (mediaUrl: string, type: string, index: number) => {
    setDownloadingIndex(index);
    const ext = type === 'video' ? 'mp4' : 'jpg';
    const filename = `pindown_${data?.id || 'media'}_${index + 1}.${ext}`;
    await downloadMedia(mediaUrl, filename);
    setTimeout(() => setDownloadingIndex(null), 1200);
  };

  const copyDirectLink = (linkUrl: string) => {
    navigator.clipboard.writeText(linkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0c0c0e] text-[#f4f4f5] flex flex-col justify-between selection:bg-red-600/30 selection:text-white">
      {/* Header Minimalis */}
      <header className="px-4 sm:px-8 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(230,0,35,0.35)] transition-transform duration-150 group-hover:scale-105 active:scale-[0.96]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white text-white">
              <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.43l1.28-5.43s-.33-.66-.33-1.63c0-1.53.89-2.67 2-2.67.94 0 1.4.7 1.4 1.55 0 .95-.6 2.36-.91 3.67-.26 1.1.55 2 1.63 2 1.96 0 3.46-2.06 3.46-5.04 0-2.63-1.89-4.47-4.59-4.47-3.13 0-4.97 2.35-4.97 4.77 0 .95.36 1.96.82 2.51a.33.33 0 0 1 .08.31l-.31 1.24c-.05.2-.16.24-.37.14-1.39-.65-2.26-2.68-2.26-4.32 0-3.52 2.56-6.75 7.38-6.75 3.87 0 6.88 2.76 6.88 6.44 0 3.85-2.43 6.95-5.8 6.95-1.13 0-2.2-.59-2.56-1.29l-.7 2.66c-.25.97-1.11 2.45-1.65 3.28A12 12 0 1 0 12 0z" />
            </svg>
          </div>
          <span className="font-semibold text-base tracking-tight text-white">
            PinDown
          </span>
        </a>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 active:scale-[0.96] ${
                showHistory
                  ? 'bg-red-600/15 text-red-400 ring-1 ring-red-500/30'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <History className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Riwayat</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                {history.length}
              </span>
            </button>
          )}

          <a
            href="https://github.com/arisenine/pindown"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors duration-150 active:scale-[0.96]"
            title="Lihat di GitHub"
          >
            <Github className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </header>

      {/* Area Utama Pengunduh */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto w-full">
        {/* Brand & Keterangan Singkat */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Unduh Media Pinterest
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Tempel tautan video, reels, atau foto Pinterest untuk mengunduh dalam resolusi asli.
          </p>
        </div>

        {/* Input Bar (Cobalt Style) */}
        <div className="w-full mb-4">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-[#151519] border border-white/10 hover:border-white/20 focus-within:border-red-600/70 focus-within:ring-2 focus-within:ring-red-600/20 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-200"
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Tempel tautan pin.it atau pinterest.com..."
              className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm sm:text-base px-3 py-2.5 outline-none focus:outline-none focus:ring-0 border-none shadow-none min-w-0"
              disabled={loading}
            />

            {/* Tombol Clear (X) jika ada teks */}
            {url.trim() && !loading && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="shrink-0 p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors duration-150 mr-1"
                title="Hapus tautan"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}

            {/* Tombol Tempel (Icon Saja Tanpa Background) */}
            <button
              type="button"
              onClick={handlePaste}
              disabled={loading}
              title="Tempel dari papan klip"
              aria-label="Tempel tautan"
              className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors duration-150 active:scale-[0.96] mr-1 ${
                pasteSuccess
                  ? 'text-emerald-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {pasteSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              ) : (
                <Clipboard className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>

            {/* Tombol Unduh Utama (Icon Downloads Saja) */}
            <button
              type="submit"
              disabled={loading || !url.trim()}
              title="Unduh"
              aria-label="Unduh"
              className="shrink-0 w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white transition-colors duration-150 active:scale-[0.96] flex items-center justify-center shadow-[0_2px_10px_rgba(230,0,35,0.3)]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Download className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          </form>

          {/* Quick Examples Chips */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-zinc-500">
            <span>Coba cepat:</span>
            <button
              type="button"
              onClick={() => {
                setUrl(EXAMPLE_VIDEO);
                processUrl(EXAMPLE_VIDEO);
              }}
              className="text-zinc-400 hover:text-red-400 transition-colors underline underline-offset-4"
            >
              Contoh Video
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => {
                setUrl(EXAMPLE_IMAGE);
                processUrl(EXAMPLE_IMAGE);
              }}
              className="text-zinc-400 hover:text-red-400 transition-colors underline underline-offset-4"
            >
              Contoh Foto
            </button>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full mb-6"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" strokeWidth={1.5} />
                <span className="flex-1">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="shrink-0 p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && (
          <div className="w-full py-8 flex flex-col items-center justify-center gap-3 text-zinc-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" strokeWidth={1.5} />
            <span>Sedang mengekstrak media dari Pinterest...</span>
          </div>
        )}

        {/* Hasil Ekstraksi Media (Result Card) */}
        <AnimatePresence>
          {data && (data.videos.length > 0 || data.images.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full space-y-4 my-4"
            >
              {/* Creator Info Bar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
                    {data.author?.avatar ? (
                      <img src={data.author.avatar} alt={data.author.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] font-bold text-zinc-300">
                        {data.author?.name?.slice(0, 1).toUpperCase() || 'P'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-zinc-300">
                    {data.author?.name || 'Kreator Pinterest'}
                  </span>
                </div>

                <span className="text-xs text-zinc-500 font-mono">
                  {data.videos.length > 0 ? 'Video MP4' : 'Foto HD'}
                </span>
              </div>

              {/* Video Cards */}
              {data.videos.map((video, index) => (
                <div
                  key={`v-${index}`}
                  className="bg-[#141418] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl"
                >
                  {/* Pratinjau Video */}
                  <div className="relative w-full sm:w-40 h-52 sm:h-36 rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shrink-0">
                    <video
                      src={video.url}
                      poster={video.thumbnail}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  </div>

                  {/* Keterangan & Aksi */}
                  <div className="flex-1 min-w-0 text-left w-full">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                      {data.title || 'Video Pinterest'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[11px] text-zinc-300">
                        MP4 Original
                      </span>
                      <span>Audio Aktif</span>
                    </div>

                      {/* Tombol Aksi */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleDownload(video.downloadUrl || video.url, 'video', index)}
                          disabled={downloadingIndex === index}
                          className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors duration-150 active:scale-[0.96]"
                        >
                          {downloadingIndex === index ? (
                            <>
                              <Check className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>Tersimpan</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>Unduh Video</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyDirectLink(video.downloadUrl || video.url)}
                          className="h-9 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.96]"
                          title="Salin tautan unduhan"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
                          <span>{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
                        </button>
                      </div>
                  </div>
                </div>
              ))}

              {/* Image Cards */}
              {data.images.map((image, index) => {
                const realIndex = data.videos.length + index;
                return (
                  <div
                    key={`i-${index}`}
                    className="bg-[#141418] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl"
                  >
                    {/* Pratinjau Foto */}
                    <div className="relative w-full sm:w-40 h-52 sm:h-36 rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shrink-0">
                      <img
                        src={image.url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Keterangan & Aksi */}
                    <div className="flex-1 min-w-0 text-left w-full">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                        {data.title || 'Foto Pinterest'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[11px] text-zinc-300">
                          Resolusi Penuh
                        </span>
                        <span>Tanpa Watermark</span>
                      </div>

                      {/* Tombol Aksi */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleDownload(image.downloadUrl || image.url, 'image', realIndex)}
                          disabled={downloadingIndex === realIndex}
                          className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors duration-150 active:scale-[0.96]"
                        >
                          {downloadingIndex === realIndex ? (
                            <>
                              <Check className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>Tersimpan</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>Unduh Foto</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyDirectLink(image.downloadUrl || image.url)}
                          className="h-9 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.96]"
                          title="Salin tautan gambar"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
                          <span>{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel Riwayat Unduhan (Collapsible History) */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mt-6 border-t border-white/[0.06] pt-6"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                  Riwayat Terakhir ({history.length})
                </span>
                <button
                  onClick={clearHistory}
                  className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                  <span>Hapus Riwayat</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-3 hover:border-white/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0 relative">
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-xs font-medium text-white truncate">{item.title}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{item.author || 'Pinterest'}</div>
                    </div>
                    <button
                      onClick={() => {
                        setUrl(item.url);
                        processUrl(item.url);
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white shrink-0 active:scale-[0.96]"
                      title="Unduh ulang"
                    >
                      <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Minimalis & Rapi */}
      <footer className="w-full px-6 py-6 border-t border-white/[0.06] text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-medium text-zinc-400">PinDown</span>
            <span className="text-zinc-700">&bull;</span>
            <span>Pengunduh Media Pinterest</span>
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap text-zinc-400">
            <a
              href="https://github.com/arisenine/pindown"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <span className="text-zinc-700">&bull;</span>
            <span>Lisensi MIT</span>
            <span className="text-zinc-700">&bull;</span>
            <span className="text-zinc-500">&copy; 2026 Levi Setiadi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
