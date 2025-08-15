/* ==========================
   SCRIPT
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
  manis: /manis|maniez|manies|maniz|maniees|maniss|manisss/i,
  oteyy: /oteyy|otey|ote|oty|otyy/i,
  huum: /hum{1,5}|humm{1,5}|hummm{1,5}|mmm{1,5}|mm{1,5}|hmmm{1,5}/i,
  gajadi: /gak jadi|gajadi|gakjadi|gajadii|gak jadi deh|batal/i,
  ih: /ih{1,5}|ihh{1,5}|aih{1,5}|aihh{1,5}/i,
  mam: /mam{1,5}|makan|makann/i,
  bobo: /bbo|boboo|bobok|bobo|boboin|meremin|bubu/i,
  emot_smile: /:'\)|:\)/,
  emot_cry: /:'\(/,
  emot_hug: /cup cupp|peluk jauh|peluk/i,
  emot_lucu: /ulululu|ululu|gemess|gemes/i
};

// Pola tanggal untuk ekstraksi
const DATE_PATTERNS = [
  // 10/08/25, 7:35 pm - riz: ...
  /(\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:am|pm)\s*-\s*[^:]+:\s*)/i,
  // [10/08/25, 7:35 pm] riz: ...
  /(\[\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:am|pm)\]\s*[^:]+:\s*)/i,
  // 2025-08-10 19:35 - riz: ...
  /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2})?\s*-\s*[^:]+:\s*)/
];

// Ekstrak semua pesan dari teks tanpa baris baru
function parseChat(text) {
  const entries = [];

  // Pisahkan berdasarkan pola tanggal
  const lines = text.split(/(?=\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:am|pm))/i);
  
  for (const line of lines) {
    if (!line.trim() || line.includes('You deleted this message')) continue;

    // Coba ekstrak tanggal dan nama pengirim
    const dateMatch = line.match(DATE_PATTERNS[0]);
    if (!dateMatch) continue;

    const dateStr = dateMatch[0].replace(/ /g, ' '); // Fix karakter aneh
    const msgText = line.replace(dateStr, '').trim();

    // Parsing tanggal
    const m = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!m) continue;

    let [_, day, mon, year, hh, mm, ampm] = m;
    day = +day; mon = +mon; year = +year; hh = +hh; mm = +mm;
    if (year < 100) year += 2000;
    if (ampm.toLowerCase() === 'pm' && hh !== 12) hh += 12;
    if (ampm.toLowerCase() === 'am' && hh === 12) hh = 0;

    const date = new Date(year, mon - 1, day, hh, mm);

    entries.push({ date, text: msgText });
  }

  return entries;
}

// Hitung semua kata kunci
function countKeywords(text) {
  const result = {};
  for (const [key, regex] of Object.entries(KEY_PATTERNS)) {
    result[key] = (text.match(regex) || []).length;
  }
  return result;
}

// Kelompokkan per bulan
function bucketMonthly(entries) {
  const map = new Map();
  for (const { date, text } of entries) {
    if (!date) continue;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    if (!map.has(key)) map.set(key, {});
    const counts = countKeywords(text);
    const current = map.get(key);
    for (const [k, v] of Object.entries(counts)) {
      current[k] = (current[k] || 0) + v;
    }
  }

  const labels = Array.from(map.keys()).sort();
  const data = {};
  for (const key of Object.keys(KEY_PATTERNS)) {
    data[key] = labels.map(l => map.get(l)[key] || 0);
  }

  return { labels, data };
}

// Render grafik
let chart = null;
function renderChart({ labels, data }) {
  const ctx = $('#timelineChart');
  if (!ctx) return;
  if (chart) chart.destroy();

  const datasets = [
    { label: 'Kangen', data: data.kangen, borderColor: '#ff8fab', backgroundColor: 'rgba(255, 141, 171, 0.2)' },
    { label: 'Maaf', data: data.maaf, borderColor: '#a0d8f1', backgroundColor: 'rgba(160, 216, 241, 0.2)' },
    { label: 'Terima Kasih', data: data.thanks, borderColor: '#c2e7b0', backgroundColor: 'rgba(194, 231, 176, 0.2)' },
    { label: 'Marah', data: data.marah, borderColor: '#f7768e', backgroundColor: 'rgba(247, 118, 142, 0.2)' },
    { label: 'Manis', data: data.manis, borderColor: '#ffd6e0', backgroundColor: 'rgba(255, 214, 224, 0.2)' },
    { label: 'Oteyy', data: data.oteyy, borderColor: '#ffcc00', backgroundColor: 'rgba(255, 204, 0, 0.2)' },
    { label: 'Huum', data: data.huum, borderColor: '#b39ddb', backgroundColor: 'rgba(179, 157, 219, 0.2)' },
    { label: 'Gak Jadi', data: data.gajadi, borderColor: '#ff6b6b', backgroundColor: 'rgba(255, 107, 107, 0.2)' },
    { label: 'Ih/Aih', data: data.ih, borderColor: '#6eceda', backgroundColor: 'rgba(110, 206, 218, 0.2)' },
    { label: 'Mam', data: data.mam, borderColor: '#8bc34a', backgroundColor: 'rgba(139, 195, 74, 0.2)' },
    { label: 'Bobo', data: data.bobo, borderColor: '#9c27b0', backgroundColor: 'rgba(156, 39, 176, 0.2)' },
    { label: 'Cute Smile', data: data.emot_smile, borderColor: '#ffeb3b', backgroundColor: 'rgba(255, 235, 59, 0.2)' },
    { label: 'Almost Crying', data: data.emot_cry, borderColor: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.2)' },
    { label: 'Peluk & Cium', data: data.emot_hug, borderColor: '#e91e63', backgroundColor: 'rgba(233, 30, 99, 0.2)' },
    { label: 'Lucu', data: data.emot_lucu, borderColor: '#ff9800', backgroundColor: 'rgba(255, 152, 0, 0.2)' }
  ].filter(ds => ds.data.some(v => v > 0));

  chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
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
}

// Muat chat otomatis
async function loadChatData() {
  const status = $('#parseStatus');
  //status.textContent = 'Memuat chat...';

  try {
    const response = await fetch('data/chat.txt');
    if (!response.ok) throw new Error('File tidak ditemukan');

    const text = await response.text();
    const entries = parseChat(text);
    const fullText = entries.map(e => e.text).join(' ');

    const counts = countKeywords(fullText);
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

    const monthly = bucketMonthly(entries);
    renderChart(monthly);

    const items = Object.entries(counts)
      .filter(([k, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v.toLocaleString('id-ID')}`)
      .join(' • ');

   

  } catch (err) {
    status.textContent = 'Gagal memuat chat. Pastikan file ada di folder /data/';
    console.error('Error:', err);
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

});

