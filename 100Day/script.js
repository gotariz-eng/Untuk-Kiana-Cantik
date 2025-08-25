/* ==========================
   SCRIPT - SUDAH DIPERBAIKI + FIREBASE
   ========================== */

// Tanggal mulai
const startDate = new Date('2025-04-13T00:00:00+07:00');

// Helper
const $ = sel => document.querySelector(sel);

// Floating hearts
function spawnFloatingHearts() {
  const wrap = $('.float-hearts');
  if (!wrap) return;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + 'vw';
    s.style.bottom = (-10 + Math.random() * 40) + 'vh';
    s.style.animationDelay = (Math.random() * 12) + 's';
    s.style.opacity = 0.08 + Math.random() * 0.15;
    s.style.transform = `translateY(${Math.random() * 40}vh) rotate(45deg)`;
    wrap.appendChild(s);
  }
}

// Update waktu real-time
function updateLiveCounter() {
  const now = new Date();
  let diff = now - startDate;
  if (diff < 0) diff = 0;
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  $('#days').textContent = days.toLocaleString('id-ID');
  $('#hours').textContent = hours;
  $('#minutes').textContent = minutes;
  $('#seconds').textContent = seconds;
}

// Animasi counter 1 → 124
function acceleratedIntro() {
  const target = $('#acceleratedCount');
  const total = 124;
  const totalTime = 20000;
  const delays = Array.from({ length: total }, (_, i) => {
    const raw = 600 * Math.exp(-i * 0.055);
    return Math.max(raw, 30);
  });
  const scale = totalTime / delays.reduce((a, b) => a + b, 0);
  const adjustedDelays = delays.map(d => d * scale);
  function step(i) {
    if (i >= total) {
      setTimeout(() => {
        const now = new Date();
        const daysDiff = Math.floor((now - startDate) / 86400000);
        target.textContent = daysDiff.toLocaleString('id-ID');
      }, 200);
      return;
    }
    target.textContent = i + 1;
    setTimeout(() => step(i + 1), adjustedDelays[i]);
  }
  step(0);
}

// Smooth scroll
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  const id = a.getAttribute('href');
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
});

// === KATA KUNCI DIPERBARUI ===
const KEY_PATTERNS = {
  kangen: /kangen{1,10}|kangenn+|kangen banget|kangen bgt|kangen pisang|kangen kamu/i,
  maaf: /maa?p{1,4}|maa?f{1,4}|maapppin|maafin|maaf yaa|maaf yaw|maafin aku|sorry/i,
  thanks: /terima\s?kasi?h|terimakasih|makasi?h|makasi|makaci|maaci|makacii|makasii|makaciin|makasihin/i,
  marah: /marah|ngambek|kesel|ilfeel|bosan|bosen/i,
  manis: /manis|maniez|manies|maniz|maniees|maniss|manisss|mnis/i,
  oteyy: /oteyy|otey|ote|oty|otyy/i,
  huum: /hum{1,5}|humm{1,5}|hummm{1,5}|mmm{1,5}|mm{1,5}|hmmm{1,5}/i,
  gajadi: /gak jadi|gajadi|gakjadi|gajadii|gak jadi deh|batal/i,
  ih: /ih{1,5}|ihh{1,5}|aih{1,5}|aihh{1,5}/i,
  mam: /mam{1,5}|makan|makann/i,
  bobo: /bbo|boboo|bobok|bobo|boboin|meremin|bubu/i,
  emot_smile: /:'\)|:\)/,
  emot_cry: /:'\(/,
  emot_hug: /cup cupp|peluk jauh|peluk/i,
  emot_lucu: /ulululu|ululu|gemess|gemes/i,
  duyung: /duyung{1,5}|duyungg|duyunggg|putri duyung|duyung cantik|duyungku|oteyy duyung/i,
  eskrim: /eskrim{1,5}|es krim|ice cream|eskrimku|es krimku|eskrim manis|eskrim kesukaan|es krim kesukaan/i,
};

// Pola tanggal untuk ekstraksi
const DATE_PATTERNS = [
  /(\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:am|pm)\s*-\s*[^:]+:\s*)/i,
  /(\[\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:am|pm)\]\s*[^:]+:\s*)/i,
  /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2})?\s*-\s*[^:]+:\s*)/
];

// Ekstrak semua pesan dari teks
function parseChat(text) {
  const entries = [];
  const lines = text.split(/(?=\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:am|pm))/i);
  for (const line of lines) {
    if (!line.trim() || line.includes('You deleted this message')) continue;

    const dateMatch = line.match(DATE_PATTERNS[0]);
    if (!dateMatch) continue;
    const dateStr = dateMatch[0].replace(/ /g, ' ');

    // 🔹 Ekstrak nama pengirim
    const senderMatch = dateStr.match(/-\s*(.+?):/);
    const sender = senderMatch ? senderMatch[1].trim() : 'Unknown';

    const msgText = line.replace(dateStr, '').trim();

    const m = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!m) continue;
    let [_, day, mon, year, hh, mm, ampm] = m;
    day = +day; mon = +mon; year = +year; hh = +hh; mm = +mm;
    if (year < 100) year += 2000;
    if (ampm.toLowerCase() === 'pm' && hh !== 12) hh += 12;
    if (ampm.toLowerCase() === 'am' && hh === 12) hh = 0;
    const date = new Date(year, mon - 1, day, hh, mm);

    entries.push({ date, text: msgText, sender });
  }
  return entries;
}

// Hitung semua kemunculan kata
function countKeywords(text) {
  const result = {};
  for (const [key, regex] of Object.entries(KEY_PATTERNS)) {
    const globalRegex = new RegExp(regex.source, 'gi');
    const matches = text.matchAll(globalRegex);
    result[key] = Array.from(matches).length;
  }
  return result;
}

// Kelompokkan per bulan
function bucketMonthly(entries) {
  const map = new Map();
  for (const { date, text, sender } of entries) {
    if (!date) continue;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    if (!map.has(key)) {
      map.set(key, {});
      for (const k of Object.keys(KEY_PATTERNS)) map.get(key)[k] = 0;
      map.get(key).kianaBubble = 0;
      map.get(key).farizBubble = 0;
    }

    const counts = countKeywords(text);
    const current = map.get(key);
    for (const [k, v] of Object.entries(counts)) {
      current[k] = (current[k] || 0) + v;
    }

    if (sender.includes('Kiana')) current.kianaBubble++;
    else if (sender.includes('riz') || sender === 'Fariz') current.farizBubble++;
  }

  const labels = Array.from(map.keys()).sort();
  const data = {};
  for (const key of [...Object.keys(KEY_PATTERNS), 'kianaBubble', 'farizBubble']) {
    data[key] = labels.map(l => map.get(l)[key] || 0);
  }
  return { labels, data };
}

// Render grafik
let chart = null;
let chartData = null; // 🔹 Simpan data global agar bisa diakses filter

function renderChart({ labels, data }) {
  chartData = data; // ✅ Simpan referensi data
  const ctx = $('#timelineChart');
  if (!ctx) return;
  if (chart) chart.destroy();

  const allDatasets = [
    { key: 'kangen', label: '❤️ Kangen', borderColor: '#ff8fab', backgroundColor: 'rgba(255, 141, 171, 0.2)' },
    { key: 'maaf', label: '🙏 Maaf', borderColor: '#a0d8f1', backgroundColor: 'rgba(160, 216, 241, 0.2)' },
    { key: 'thanks', label: '🎁 Terima Kasih', borderColor: '#c2e7b0', backgroundColor: 'rgba(194, 231, 176, 0.2)' },
    { key: 'marah', label: '😤 Kesel', borderColor: '#f7768e', backgroundColor: 'rgba(247, 118, 142, 0.2)' },
    { key: 'manis', label: '💖 Manis', borderColor: '#ffd6e0', backgroundColor: 'rgba(255, 214, 224, 0.2)' },
    { key: 'oteyy', label: '🐱 Oteyy', borderColor: '#ffcc00', backgroundColor: 'rgba(255, 204, 0, 0.2)' },
    { key: 'huum', label: '🤏 Huum', borderColor: '#b39ddb', backgroundColor: 'rgba(179, 157, 219, 0.2)' },
    { key: 'gajadi', label: '🚫 Gajadi', borderColor: '#ff6b6b', backgroundColor: 'rgba(255, 107, 107, 0.2)' },
    { key: 'ih', label: '🤭 Ih/Aih', borderColor: '#6eceda', backgroundColor: 'rgba(110, 206, 218, 0.2)' },
    { key: 'mam', label: '🍽️ Mam', borderColor: '#8bc34a', backgroundColor: 'rgba(139, 195, 74, 0.2)' },
    { key: 'bobo', label: '😴 Bobo', borderColor: '#9c27b0', backgroundColor: 'rgba(156, 39, 176, 0.2)' },
    { key: 'duyung', label: '🧜‍♀️ Duyung', borderColor: '#00b8d4', backgroundColor: 'rgba(0, 184, 212, 0.2)' },
    { key: 'eskrim', label: '🍦 Eskrim', borderColor: '#f50057', backgroundColor: 'rgba(245, 0, 87, 0.2)' },
    { key: 'kianaBubble', label: '💬 Kiana', borderColor: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.2)' },
    { key: 'farizBubble', label: '💬 Fariz', borderColor: '#ff5722', backgroundColor: 'rgba(255, 87, 34, 0.2)' }
  ];

  const initialDatasets = allDatasets
    .filter(ds => {
      const input = document.querySelector(`.filter-container input[value="${ds.key}"]`);
      return input?.checked;
    })
    .map(ds => ({
      label: ds.label,
      data: data[ds.key],
      borderColor: ds.borderColor,
      backgroundColor: ds.backgroundColor
    }));

  chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: initialDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true }
      }
    }
  });

  // 🔁 Hapus event lama, lalu tambahkan baru
  document.querySelectorAll('.filter-container input[type="checkbox"]').forEach(checkbox => {
    checkbox.onchange = null; // Bersihkan event lama
    checkbox.addEventListener('change', function () {
      const key = this.value;
      const dsConfig = allDatasets.find(ds => ds.key === key);
      if (!dsConfig) return;

      const existingIndex = chart.data.datasets.findIndex(ds => ds.label === dsConfig.label);
      if (this.checked && existingIndex === -1) {
        // Tambahkan dataset
        chart.data.datasets.push({
          label: dsConfig.label,
          data: chartData[key], // ✅ Gunakan data global
          borderColor: dsConfig.borderColor,
          backgroundColor: dsConfig.backgroundColor
        });
      } else if (!this.checked && existingIndex > -1) {
        // Hapus dataset
        chart.data.datasets.splice(existingIndex, 1);
      }
      chart.update();
    });
  });
}

// Muat chat otomatis
let globalChatText = '';
async function loadChatData() {
  const status = $('#parseStatus');
  status.textContent = 'Memuat chat...';
  try {
    const response = await fetch('data/chat.txt');
    if (!response.ok) throw new Error('File tidak ditemukan');
    const text = await response.text();
    globalChatText = text;
    const entries = parseChat(text);

    // 🔢 Hitung jumlah pesan per orang
    let kianaCount = 0, farizCount = 0;
    for (const entry of entries) {
      const sender = entry.sender.toLowerCase();
      if (sender.includes('kiana')) kianaCount++;
      else if (sender.includes('riz') || sender === 'fariz') farizCount++;
    }
    $('#cKianaBubble').textContent = kianaCount.toLocaleString('id-ID');
    $('#cFarizBubble').textContent = farizCount.toLocaleString('id-ID');

    // 🔢 Hitung total kata
    const fullText = entries.map(e => e.text).join(' ');
    const counts = countKeywords(fullText);

    // Update Word Counter
    $('#cKangen').textContent = counts.kangen.toLocaleString('id-ID');
    $('#cMaaf').textContent = counts.maaf.toLocaleString('id-ID');
    $('#cThanks').textContent = counts.thanks.toLocaleString('id-ID');
    $('#cMarah').textContent = counts.marah.toLocaleString('id-ID');
    $('#cManis').textContent = counts.manis.toLocaleString('id-ID');
    $('#cOteyy').textContent = counts.oteyy.toLocaleString('id-ID');
    $('#cHuum').textContent = counts.huum.toLocaleString('id-ID');
    $('#cGajadi').textContent = counts.gajadi.toLocaleString('id-ID');
    $('#cIh').textContent = counts.ih.toLocaleString('id-ID');
    $('#cMam').textContent = counts.mam.toLocaleString('id-ID');
    $('#cBobo').textContent = counts.bobo.toLocaleString('id-ID');
    $('#cDuyung').textContent = counts.duyung.toLocaleString('id-ID');
    $('#cEskrim').textContent = counts.eskrim.toLocaleString('id-ID');

    // Render grafik
    const monthly = bucketMonthly(entries);
    renderChart(monthly);

    // Update status
    const items = Object.entries(counts)
      .filter(([k, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v.toLocaleString('id-ID')}`)
      .join(' • ');
    status.textContent = `Inii kataaa yang aku itung: ${items}. Harusnya segini kalo ga kelewatt.`;

  } catch (err) {
    status.textContent = 'Gagal memuat chat. Pastikan file ada di folder /data/';
    console.error('Error:', err);
  }
}

// 🔍 Pencarian Kata Dinamis (5 detik)
function searchWord() {
  const input = document.getElementById('searchInput');
  const loadingDiv = document.getElementById('searchLoading');
  const resultsDiv = document.getElementById('searchResults');
  const word = input.value.trim().toLowerCase();
  
  if (!word) {
    resultsDiv.innerHTML = '<span style="color:#ff6b6b">❌ Masukkan kata yang ingin dicari</span>';
    return;
  }

  // Tampilkan animasi loading
  loadingDiv.style.opacity = 1;
  loadingDiv.className = 'typewriter';
  loadingDiv.textContent = 'bentar yaa aku itung duluuu...';

  // Gunakan globalChatText
  const entries = parseChat(globalChatText);
  let count = 0;

  // ✅ Hitung hanya dari isi pesan
  for (const entry of entries) {
    if (entry.text.toLowerCase().includes(word)) {
      count++;
    }
  }

  // Hapus loading setelah 5 detik
  setTimeout(() => {
    loadingDiv.style.opacity = 0;
    loadingDiv.textContent = '';

    // Buat elemen hasil
    const resultItem = document.createElement('div');
    resultItem.style.padding = '8px';
    resultItem.style.margin = '4px 0';
    resultItem.style.backgroundColor = count > 0 ? 'rgba(255, 141, 171, 0.2)' : '#333';
    resultItem.style.borderRadius = '6px';
    resultItem.style.fontSize = '0.95em';

    if (count === 0) {
      resultItem.innerHTML = `<strong>"${word}"</strong>: <span style="color:#ff6b6b">Tidak ditemukan</span>`;
    } else {
      resultItem.innerHTML = `<strong>"${word}"</strong>: <span style="color:#b2ff59">${count} kali muncul</span>`;
    }

    // Tambahkan ke atas daftar
    resultsDiv.prepend(resultItem);

    // Bersihkan input
    input.value = '';
  }, 5000); // 5 detik
}

// 🔥 Inisialisasi Firebase (dengan pengecekan)
let database = null;

if (typeof firebase !== 'undefined') {
  const firebaseConfig = {
    apiKey: "AIzaSyAw8GC5-_HnZk-FXV8TWL-GyvlNOjDzwWo",
    authDomain: "fariz-kiana-880b5.firebaseapp.com",
    databaseURL: "https://fariz-kiana-880b5-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fariz-kiana-880b5",
    storageBucket: "fariz-kiana-880b5.firebasestorage.app",
    messagingSenderId: "43234289410",
    appId: "1:43234289410:web:704c439dc97e899898041b"
  };

  try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('✅ Firebase berhasil diinisialisasi');
  } catch (error) {
    console.warn('❌ Firebase gagal diinisialisasi:', error);
  }
} else {
  console.warn('⚠️ Firebase SDK belum dimuat');
}

// 💘 Fitur: Seberapa Kangen Kamu? (Real-time)
// 💘 Fitur: Seberapa Kangen Kamu? (Real-time)
if (database) {
  const kangenRef = database.ref('kangenCount');
  const kangenCountEl = document.getElementById('kangenCount');
  const loveBtn = document.querySelector('.love-btn');

  // Tampilkan angka dari Firebase
  kangenRef.on('value', (snapshot) => {
    const count = snapshot.val() || 0;
    if (kangenCountEl) {
      kangenCountEl.textContent = count.toLocaleString('id-ID');
    }

    // Cek milestone
    showMilestone(count);
  });

  // Saat tombol ❤️ diklik
  loveBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Cegah event ke parent

    // Tambah 1 di Firebase
    kangenRef.transaction(currentValue => (currentValue || 0) + 1);

    // Animasi detup tombol
    loveBtn.classList.add('pulse');
    setTimeout(() => {
      loveBtn.classList.remove('pulse');
    }, 600);

    // Munculkan hati besar di tengah layar
    const heart = document.createElement('span');
    heart.textContent = '❤️';
    heart.classList.add('heart-pop');
    heart.style.left = '50vw';
    heart.style.top = '50vh';
    document.body.appendChild(heart);

    // Hapus dari DOM setelah animasi
    setTimeout(() => {
      heart.remove();
    }, 1000);
  });
}

// 🎁 Tampilkan pesan milestone
function showMilestone(count) {
  const messages = {
    10: "Sepuluhhh?",
    50: "Segitu aja kahh🙃",
    100: "Gaa kepaksaaa kann maniess😅",
    200: "Benerannn?? hwaaa😫",
    300: "Miss u moreee, cantikkk💖"
  };

  if (messages[count]) {
    const popup = document.createElement('div');
    popup.className = 'milestone-popup';
    popup.textContent = messages[count];
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 10000);
  }
}

// On Load
document.addEventListener('DOMContentLoaded', () => {
  spawnFloatingHearts();
  acceleratedIntro();
  updateLiveCounter();
  setInterval(updateLiveCounter, 1000);
  $('#year').textContent = new Date().getFullYear();
  loadChatData();

  // ✅ Tambahkan event listener setelah DOM siap
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', searchWord);
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') searchWord();
    });
  }

  // Event listener untuk tombol clear
  const clearBtn = document.getElementById('clearSearchResults');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      const resultsDiv = document.getElementById('searchResults');
      resultsDiv.innerHTML = '';
    });
  }
});

// 🎮 XOX GAME - Multiplayer LDR Mode (Fariz vs Kiana)
document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  const message = document.getElementById('message');
  const playerTurn = document.getElementById('playerTurn');
  const resetBtn = document.getElementById('resetBtn');
  const scoreKiana = document.getElementById('scoreKiana');
  const scoreFariz = document.getElementById('scoreFariz');
  const scoreDraw = document.getElementById('scoreDraw'); // Tambahkan elemen ini

  if (!board || !message || !playerTurn || !resetBtn || !scoreKiana || !scoreFariz || !scoreDraw) {
    console.warn('⚠️ XOX: Salah satu elemen tidak ditemukan. Pastikan HTML sudah benar.');
    return;
  }

  // Simbol pemain
  const PLAYER_KIANA = '👧🏻';
  const PLAYER_FARIZ = '👦🏻';

  // Pilih peran kamu
  let mySymbol = null;
  const choice = confirm("Pilihh  (Fariz OK = 👦🏻Cancel) (Kiana= 👧🏻)");
  mySymbol = choice ? PLAYER_FARIZ : PLAYER_KIANA;

  // Referensi Firebase
  let gameRef = null;
  let scoresRef = null;

  if (typeof database !== 'undefined') {
    gameRef = database.ref('xoxGame');
    scoresRef = database.ref('xoxScores');
  } else {
    console.warn('⚠️ Firebase tidak tersedia. Game berjalan offline.');
  }

  // Muat skor dari Firebase
  if (scoresRef) {
    scoresRef.on('value', (snap) => {
      const val = snap.val() || { kiana: 0, fariz: 0, draw: 0 };
      scoreKiana.textContent = val.kiana;
      scoreFariz.textContent = val.fariz;
      scoreDraw.textContent = val.draw; // Update skor seri
    });
  }

  // Fungsi: Buat papan
  function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.dataset.index = i;
      cell.style.cssText = `
        width: 80px; height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a2e;
        border-radius: 8px;
        font-size: 2em;
        cursor: pointer;
        user-select: none;
        outline: none;
      `;
      cell.addEventListener('click', handleCellClick);
      board.appendChild(cell);
    }
    board.style.cssText = 'display: grid; grid-template-columns: repeat(3, 80px); gap: 8px; margin: 20px auto;';
  }

  // Fungsi: Klik kotak
  function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (!index || e.target.textContent !== '') return;

    if (gameRef) {
      gameRef.transaction(currentGame => {
        const game = currentGame || {
          board: ['', '', '', '', '', '', '', '', ''],
          currentPlayer: PLAYER_KIANA, // Kiana mulai duluan di game pertama
          winner: '',
          lastMove: Date.now()
        };

        if (game.winner || game.board[index] !== '' || game.currentPlayer !== mySymbol) {
          return; // Batalkan transaksi
        }

        // Update papan
        game.board[index] = mySymbol;

        // Cek menang
        const winPatterns = [
          [0,1,2], [3,4,5], [6,7,8],
          [0,3,6], [1,4,7], [2,5,8],
          [0,4,8], [2,4,6]
        ];

        let hasWinner = false;
        for (const [a,b,c] of winPatterns) {
          if (game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
            game.winner = mySymbol === PLAYER_KIANA ? 'Kiana' : 'Fariz';
            hasWinner = true;
          }
        }

        // Cek seri
        const isDraw = game.board.every(cell => cell !== '') && !hasWinner;

        // Jika menang atau seri → reset otomatis setelah 2 detik
        if (hasWinner || isDraw) {
          setTimeout(() => {
            // Tentukan siapa yang mulai di game berikutnya
            const nextStarter = game.currentPlayer === PLAYER_KIANA ? PLAYER_FARIZ : PLAYER_KIANA;

            gameRef.set({
              board: ['', '', '', '', '', '', '', '', ''],
              currentPlayer: nextStarter, // Giliran gantian
              winner: '',
              lastMove: Date.now()
            });

            // Tambah skor hanya sekali
            if (hasWinner) {
              const winner = mySymbol === PLAYER_KIANA ? 'Kiana' : 'Fariz';
              scoresRef.child(winner.toLowerCase()).transaction(v => (v || 0) + 1);
            } else if (isDraw) {
              scoresRef.child('draw').transaction(v => (v || 0) + 1);
            }
          }, 2000);
        } else {
          // Ganti giliran
          game.currentPlayer = mySymbol === PLAYER_KIANA ? PLAYER_FARIZ : PLAYER_KIANA;
        }

        game.lastMove = Date.now();
        return game;
      });
    }
  }

  // Update UI dari Firebase
  if (gameRef) {
    gameRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const boardData = data.board || ['', '', '', '', '', '', '', '', ''];
      const currentPlayer = data.currentPlayer || PLAYER_KIANA;
      const winner = data.winner || '';

      // Update tampilan kotak
      const cells = document.querySelectorAll('#board div');
      cells.forEach((cell, i) => {
        cell.textContent = boardData[i] || '';
      });

      playerTurn.textContent = currentPlayer === PLAYER_KIANA ? '🐱 Kiana' : '🐦 Fariz';
      playerTurn.style.color = currentPlayer === PLAYER_KIANA ? '#ff8fab' : '#a0d8f1';

      if (winner) {
        message.textContent = `🎉 ${winner} menang!`;
      } else if (boardData.every(cell => cell !== '')) {
        message.textContent = '🤝 Seri!';
      } else {
        message.textContent = '';
      }
    });
  }

  // Tombol reset manual
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset game?')) {
      if (gameRef) {
        gameRef.set({
          board: ['', '', '', '', '', '', '', '', ''],
          currentPlayer: PLAYER_KIANA, // Mulai dari Kiana
          winner: '',
          lastMove: Date.now()
        });
      }
    }
  });

  // Cegah fokus otomatis
  board.addEventListener('mousedown', e => {
    if (e.target.dataset.index) e.preventDefault();
  });

  // Inisialisasi
  createBoard();
});
