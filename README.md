# 🎂 Birthday Music Player

Retro-style birthday web app dengan tema maroon & gold.

## Cara Pakai

### 1. Install & Jalankan
```bash
npm install
npm run dev
```

### 2. Customisasi Konten → `src/config.js`
- `namaPenerima` — nama sahabatmu
- `pesanAwal` — pesan chat awal yang sudah muncul
- `foto` — ganti `src: null` dengan path foto atau URL
- `laguDefault` — lagu yang langsung muncul tanpa upload

**Contoh tambah foto:**
```js
foto: [
  { id: 1, src: "/assets/foto1.jpg", label: "Bareng kemarin" },
  { id: 2, src: "https://i.imgur.com/xxxxx.jpg", label: "Foto liburan" },
],
```

**Contoh lagu default (taruh MP3 di `public/music/`):**
```js
laguDefault: [
  { judul: "Kamu", artis: "Yovie & Nuno", src: "/music/kamu.mp3" },
],
```

### 3. Ganti Warna → `src/index.css`
```css
:root {
  --maroon:      #6B1A1A;  /* ganti warna utama */
  --accent:      #D4A017;  /* ganti aksen */
  --screen-bg:   #c8e8a8;  /* ganti warna layar */
}
```

### 4. Deploy ke Vercel
```bash
npm run build
# lalu drag folder dist/ ke vercel.com
# atau: npx vercel
```

## Struktur File
```
src/
├── config.js              ← EDIT INI untuk konten
├── index.css              ← EDIT INI untuk warna
├── App.jsx
├── main.jsx
└── components/
    ├── BirthdayPlayer.jsx ← komponen utama
    ├── TabPesan.jsx       ← tab chat/pesan
    ├── TabGaleri.jsx      ← tab foto & video
    ├── TabMusik.jsx       ← tab musik player
    └── Confetti.jsx       ← efek confetti
```
