// ============================================================
//  CONFIG.JS — Edit file ini untuk customisasi konten
// ============================================================

export const config = {
  // --- INFO UTAMA ---
  namaPenerima: "Vanesa",       // Nama yang muncul di judul
  umur: 21,                     // Umur ulang tahun

  pengirim: {
      nama : "V",
      avatar : "/photos/avatar.jpg" ,
      initial : null
  },

  pesanAwal: [
  {
    id: 1,
    teks: "Hai nessa 😊",
    dari: "teman",
    opsi: [
      {
        teks: "Halo juga 🙌",
        nextId: 2,
        balasan: {
          teks: "Njir dibales, kirain ga bakal dibales 😌",
          dari: "teman",
          opsi: [
            { teks: "Gak dong... Yakali", nextId: 2 },
            { teks: "Niatnya emang gitu… 😏", nextId: 2 }
          ]
        }
      },
      {
        teks: "Ini siapa ya?",
        nextId: 3,
        balasan: {
          teks: "adalah pokoknya... wkwkwk",
          dari: "teman",
          opsi: [
            { teks: "yaelahh.. wkwkkwkw", nextId: 6 },
            { teks: "Dih.. kasih tau dong", nextId: 4 }
          ]
        }
      },
    ]
  },

  // FLOW: SUDAH KENAL (NORMAL)
  {
    id: 2,
    teks: "wkwkwk, btw lama gak ngobrol yah",
    dari: "teman",
    opsi: [
      {
        teks: "Iya juga ya",
        nextId: 6
      },
      {
        teks: "Iya nih, pada sibuk masing-masing",
        nextId: 6
      }
    ]
  },

  // FLOW: MINTA CLUE
  {
    id: 4,
    teks: "hmmm harusnya udah tau juga sih...",
    dari: "teman",
    opsi: [
      {
        teks: "wkwkkwkw ywdah deh",
        nextId: 5
      },
      {
        teks: "Masih ga yakin sih 😭",
        nextId: 5
      }
    ]
  },

  // FLOW: UDAH INGET SETELAH LUPA
  {
    id: 5,
    teks: "WKKWKWKWK",
    dari: "teman",
    opsi: [
      {
        teks: "Dih malah ketawa",
        nextId: 6
      },
      
    ]
  },

  // JEMBATAN SEBELUM BIRTHDAY
  {
    id: 6,
    teks: "wkwkwkwk.. btw hari ini kayaknya ada yang spesial deh 👀",
    dari: "teman",
    opsi: [
      {
        teks: "Apaan tuh?",
        nextId: 7
      },
      {
        teks: "Hmm… apa ya 🤔",
        nextId: 7
      }
    ]
  },

  // BIRTHDAY REVEAL (BARU MASUK SINI)
  {
    id: 7,
    teks: "Happy birthday yaa 🎉🎂",
    dari: "teman",
    opsi: [
      {
        teks: "Wah makasih banyak 😆",
        balasan: {
          teks: "Semoga makin dewasa… pelan-pelan aja juga gapapa 😌",
          dari: "teman"
        }
      },
      {
        teks: "Hah serius hari ini?",
        balasan: {
          teks: "Iya lah 😭 masa aku lebih inget dari kamu sendiri",
          dari: "teman",
          opsi: [
            { teks: "Fix aku butuh kalender baru 😂" },
            { teks: "Pura-pura lupa biar dapet ucapan 😎" }
          ]
        }
      }
    ]
  }
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

  wishes: [
  { id: 1, dari: "Eli", teks: "Selamat ulang tahun Nessa! Semoga selalu bahagia dan sehat ya! 🎉" },
  { id: 2, dari: "Tasya", teks: "Happy birthday! Semoga impianmu semua terwujud tahun ini 💖" },
  { id: 3, dari: "Clara", teks: "HBD Nessa! Makin cantik, makin sukses, makin bahagia ya! ✨" },
  { id: 4, dari: "Cia", teks: "Selamat ulang tahun! Semoga panjang umur dan selalu dalam lindungan Allah 🌸" },
],

game: {
  playerSprite: "/photos/char.png", // taruh PNG di sini
},
};
