# PinDown

Download gambar dan video dari Pinterest dengan mudah.

## Apa itu PinDown?

PinDown adalah website gratis untuk menyimpan gambar dan video dari Pinterest ke HP atau komputer kamu. Tidak perlu install aplikasi apapun, cukup buka website dan paste link Pinterest.

**Fitur:**
- ✅ Download gambar kualitas tinggi (original)
- ✅ Download video Pinterest
- ✅ Gratis tanpa batas
- ✅ Tidak perlu login Pinterest
- ✅ Tidak ada watermark
- ✅ Bisa dipakai di HP dan komputer

## Cara Pakai

### 1. Copy Link Pinterest

Buka Pinterest di HP atau komputer. Cari gambar/video yang mau disimpan, lalu:

**Di HP:**
- Ketuk tombol **Share** atau **Bagikan**
- Pilih **Copy Link** atau **Salin Link**

**Di Komputer:**
- Klik kanan pada gambar/video
- Pilih **Copy Link Address**

### 2. Paste di PinDown

- Buka website PinDown
- Klik tombol **Paste** (ikon clipboard)
- Atau ketik/paste manual linknya

### 3. Download

- Klik tombol **Download**
- Tunggu sebentar
- File akan otomatis tersimpan

## Menjalankan Secara Lokal

Untuk developer yang ingin menjalankan di komputer sendiri:

### Yang Dibutuhkan

- [Node.js](https://nodejs.org/) versi 18 ke atas
- npm (sudah termasuk di Node.js)

### Langkah-langkah

1. **Download project ini**
   ```
   git clone https://github.com/arisenine/pindown.git
   cd pindown
   ```

2. **Install yang dibutuhkan**
   ```
   npm install
   ```

3. **Jalankan**
   ```
   npm run dev
   ```

4. **Buka browser** ke `http://localhost:5173`

### Build untuk Production

```
npm run build
```

Hasilnya ada di folder `dist/`.

## Struktur Project

```
pindown/
├── src/
│   ├── services/       # Fungsi-fungsi utama
│   │   └── pinterest.ts
│   ├── App.tsx         # Tampilan utama
│   ├── main.tsx        # Entry point
│   └── index.css       # Style
├── index.html
├── package.json
└── vite.config.ts
```

## Teknologi

- **React** - Library untuk membuat tampilan
- **TypeScript** - JavaScript dengan type checking
- **Vite** - Build tool yang cepat
- **Tailwind CSS** - Framework CSS
- **Framer Motion** - Animasi
- **Cheerio** - Scraper HTML parsing

## API & Backend

Project ini menggunakan scraper langsung (tanpa perlu API key RapidAPI). Endpoint `/api/pins/info` mengekstrak URL gambar dan video langsung dalam resolusi tinggi.

## Kontribusi

Mau bantu mengembangkan? Caranya:

1. Fork repository ini
2. Buat branch baru
3. Lakukan perubahan
4. Buat Pull Request

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk detail lebih lanjut.

## Lisensi

MIT License - Bebas digunakan untuk apapun.

## FAQ

**Q: Apakah gratis?**  
A: Ya, 100% gratis.

**Q: Apakah aman?**  
A: Ya, tidak ada data yang disimpan di server. Semua proses di browser kamu.

**Q: Kenapa tidak bisa download?**  
A: Pastikan link yang di-paste benar. Format yang didukung: `pin.it/xxxxx` atau `pinterest.com/pin/xxxxx`

**Q: Bisa download video?**  
A: Bisa! Video akan tersimpan dalam format MP4.

**Q: Bisa dipakai di HP?**  
A: Bisa. Buka website di browser HP seperti Chrome atau Safari.

---

Dibuat oleh **Levi Setiadi** • [GitHub](https://github.com/levvweb)
