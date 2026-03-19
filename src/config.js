// ============================================================
//  CONFIG.JS — Edit file ini untuk customisasi konten
// ============================================================

export const config = {
  // --- INFO UTAMA ---
  namaPenerima: "Vanesa",       // Nama yang muncul di judul
  umur: 21,                     // Umur ulang tahun

  // --- SKRIP PERCAKAPAN ---
  // "teman" = kamu (pengirim hadiah) → bubble KIRI
  // "dia"   = Vanesa (penerima)      → bubble KANAN
  // Alur:
  //   1. pesanAwal muncul otomatis dari kiri (dari kamu)
  //   2. Vanesa bisa ketik balasan → muncul di kanan
  //   3. Setelah Vanesa balas 2x → chat dikunci + pesanAkhir muncul di kiri
  pesanAwal: [
    // Pesan 1 dari kamu → kiri, muncul langsung
    { id: 1, teks: "Hai nessa!", dari: "teman" },
    // Pesan 2 dari kamu → kiri, muncul setelah jeda
    { id: 2, teks: "happy birthday ya!🎉", dari: "teman"},
  ],

  // Pesan akhir dari kamu → kiri, muncul setelah Vanesa balas 2x
  pesanAkhir: { teks: "Hehe... abis ini lanjut ke bagian selanjutnya yaa, hope you like it", dari: "teman" },

  // --- FOTO GALERI ---
  foto: [
    { id: 1, src: "/photos/photo1.jpg", label: "Foto 1" },
    { id: 2, src: "/photos/photo2.webp", label: "Foto 2" },
    { id: 3, src: "/photos/photo3.jpg", label: "Foto 3" },
    { id: 4, src: null, label: "Foto 4" },
    { id: 5, src: null, label: "Foto 5" },
    { id: 6, src: null, label: "Foto 6" },
  ],

  // --- LAGU (taruh file MP3 di folder public/music/) ---
  laguDefault: [
     {
      judul: "you!",
      artis: "LANY",
      youtubeId: "HEAn4FqXFY4",
      thumbnail: null, // otomatis pakai thumbnail YouTube
    },
    { 
      judul: "Always", 
      artis: "Daniel Caesar", 
      youtubeId: "pKFd12id5oQ",
      thumbnail : null 
    },
    {
      judul : "Best Part",
      artis : "Daniel Caesar feat. H.E.R.",
      youtubeId : "zNhtz0Lygik",
      thumbnail : null,
    },
    {
      judul : "Prettiest Thing I've Ever Seen",
      artis : "LANY",
      youtubeId : "U7kUGqGCNpw",
      thumbnail : null,
    }
  ],
};
