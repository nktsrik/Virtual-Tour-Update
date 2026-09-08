'use client';
import { useState } from 'react';
import { rencanaKunjunganService } from '../lib/services/rencanaKunjungan';

const TIPS_TRIP = {
  solo: [
    'Bawa earphone untuk menikmati audio guide virtual tour',
    'Catat hal menarik di setiap lokasi untuk kenangan pribadi',
    'Manfaatkan waktu lebih fleksibel untuk eksplorasi mendalam',
    'Foto selfie di setiap spot ikonik',
  ],
  kelompok: [
    'Tentukan satu orang sebagai pemandu kelompok',
    'Pastikan semua anggota berkumpul sebelum pindah lokasi',
    'Bagi tugas dokumentasi agar semua momen terekam',
    'Siapkan snack bersama untuk istirahat di tengah perjalanan',
  ],
};

// Kecepatan jalan kaki rata-rata: ~4 km/jam = 0.0667 km/menit
// Koordinat map dalam satuan % (0-100), 1 unit ≈ 15 meter (estimasi area kebun raya ~1.5km x 1.5km)
const SKALA_METER_PER_UNIT = 15;
const KECEPATAN_MENIT_PER_METER = 1 / (4000 / 60); // 4 km/jam

function hitungWaktuJalan(coordA, coordB) {
  const dx = (coordA.x - coordB.x) * SKALA_METER_PER_UNIT;
  const dy = (coordA.y - coordB.y) * SKALA_METER_PER_UNIT;
  const jarakMeter = Math.sqrt(dx * dx + dy * dy);
  const menit = Math.round(jarakMeter * KECEPATAN_MENIT_PER_METER);
  return Math.max(3, Math.min(menit, 20)); // min 3 menit, max 20 menit
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function diffMinutes(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function formatTanggal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Koordinat Gate 1 sebagai titik start (pintu masuk utama)
const GATE_START = { x: 24.98, y: 73.75 };

function jarak(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// Greedy Nearest Neighbor dari Gate 1
// Pakai koordinat x/y dari data lokasi langsung (map_x/map_y dari database)
function urutkanLokasiTerdekat(locations) {
  // Koordinat fallback per nama lokasi jika x/y tidak tersedia
  const FALLBACK = {
    'Gate Kebun Raya':    { x: 24.98, y: 73.75 },
    'Patung Rama Sinta':  { x: 32.10, y: 58.47 },
    'Patung Kumbakarna':  { x: 33.98, y: 40.51 },
    'Taman Mawar':        { x: 41.32, y: 44.51 },
    'Taman Rhododendron': { x: 41.09, y: 34.11 },
    'Taman Cyathea':      { x: 47.35, y: 36.07 },
    'Taman Anggrek':      { x: 45.82, y: 24.73 },
    'Rumah Kaca Kaktus':  { x: 38.53, y: 24.15 },
    'Taman Akuatik':      { x: 41.89, y: 16.15 },
    'Taman Usada':        { x: 49.12, y: 22.69 },
    'Taman Bambu':        { x: 52.93, y: 40.58 },
  };

  const withCoord = locations.map(loc => {
    // Prioritas: x/y dari data (disimpan saat addLokasi di InteractiveMap)
    const x = parseFloat(loc.x);
    const y = parseFloat(loc.y);
    const hasCoord = !isNaN(x) && !isNaN(y) && x > 0 && y > 0;
    const nama = loc.name || loc.nama || '';
    const coord = hasCoord
      ? { x, y }
      : (FALLBACK[nama] || { x: 50, y: 50 });
    return { ...loc, _coord: coord };
  });

  const hasil = [];
  const sisa = [...withCoord];
  let posisi = GATE_START;

  while (sisa.length > 0) {
    let idxTerdekat = 0;
    let jarakMin = Infinity;
    sisa.forEach((loc, idx) => {
      const d = jarak(posisi, loc._coord);
      if (d < jarakMin) { jarakMin = d; idxTerdekat = idx; }
    });
    const dipilih = sisa.splice(idxTerdekat, 1)[0];
    hasil.push(dipilih);
    posisi = dipilih._coord;
  }

  return hasil;
}

export default function VisitPlanModal({ locations, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    tanggal: '',
    jamMulai: '08:00',
    jamSelesai: '16:00',
    tipeTrip: 'solo',
    jumlahOrang: 1,
    catatan: '',
  });
  const [errors, setErrors] = useState({});

  const JAM_BUKA = '08:00';
  const JAM_TUTUP = '16:00';
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validateJam = (mulai, selesai) => {
    const errs = {};
    if (mulai < JAM_BUKA) errs.jamMulai = `Kebun Raya buka mulai ${JAM_BUKA} WITA`;
    else if (mulai >= JAM_TUTUP) errs.jamMulai = `Jam mulai harus sebelum ${JAM_TUTUP} WITA`;
    if (selesai > JAM_TUTUP) errs.jamSelesai = `Kebun Raya tutup pukul ${JAM_TUTUP} WITA`;
    else if (selesai <= mulai) errs.jamSelesai = 'Jam selesai harus lebih dari jam mulai';
    return errs;
  };

  const handleJamChange = (field, val) => {
    const next = { ...form, [field]: val };
    setForm(next);
    setErrors(validateJam(next.jamMulai, next.jamSelesai));
  };

  const handleGenerate = () => {
    const errs = validateJam(form.jamMulai, form.jamSelesai);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const totalMenit = diffMinutes(form.jamMulai, form.jamSelesai);

    // Urutkan lokasi dari Gate 1 menggunakan Nearest Neighbor
    const lokasiUrut = urutkanLokasiTerdekat(locations);

    // Durasi dari database (estimasi_durasi), fallback 30 menit
    const lokasiDenganDurasi = lokasiUrut.map((loc) => ({
      ...loc,
      durasi: parseInt(loc.estimasi_durasi) || 30,
    }));

    // Hitung waktu jalan antar lokasi dari koordinat nyata
    const waktuJalan = lokasiUrut.map((loc, idx) => {
      if (idx === lokasiUrut.length - 1) return 0;
      const coordA = loc._coord || { x: parseFloat(loc.map_x) || 50, y: parseFloat(loc.map_y) || 50 };
      const coordB = lokasiUrut[idx + 1]._coord || { x: parseFloat(lokasiUrut[idx + 1].map_x) || 50, y: parseFloat(lokasiUrut[idx + 1].map_y) || 50 };
      return hitungWaktuJalan(coordA, coordB);
    });

    const totalDurasiDibutuhkan =
      lokasiDenganDurasi.reduce((sum, l) => sum + l.durasi, 0) +
      waktuJalan.reduce((sum, w) => sum + w, 0);

    const rasio = totalMenit / totalDurasiDibutuhkan;

    let currentTime = form.jamMulai;
    const jadwal = lokasiDenganDurasi.map((loc, idx) => {
      const durasiAktual = Math.max(5, Math.round(loc.durasi * rasio));
      const mulai = currentTime;
      const selesai = addMinutes(mulai, durasiAktual);
      const jalanKeBerikutnya = Math.round(waktuJalan[idx] * rasio);
      currentTime = addMinutes(selesai, jalanKeBerikutnya);
      return { ...loc, mulai, selesai, durasiAktual, jalanKeBerikutnya };
    });

    setPlan({
      tanggal: form.tanggal,
      jamMulai: form.jamMulai,
      jamSelesai: form.jamSelesai,
      tipeTrip: form.tipeTrip,
      jumlahOrang: form.jumlahOrang,
      catatan: form.catatan,
      jadwal,
      totalMenit,
      rasio,
      cukupWaktu: totalMenit >= totalDurasiDibutuhkan,
    });
    setStep(2);
  };

  const handlePrint = () => {
    if (!plan) return;
    const win = window.open('', '_blank', 'width=820,height=700');

    // Peta statis: gambar peta + SVG overlay garis + titik bernomor
    // Koordinat x/y dalam % (0-100), peta ditampilkan 500x500px
    const MAP_W = 500;
    const MAP_H = 500;
    const BASE_URL = (typeof window !== 'undefined' ? window.location.origin : '');

    // Titik Gate 1 sebagai start
    const gateCoord = { x: 24.98, y: 73.75 };
    const allPoints = [
      { ...gateCoord, label: 'Gate 1', isGate: true },
      ...plan.jadwal.map((item, idx) => ({
        x: item._coord?.x ?? parseFloat(item.map_x) ?? 50,
        y: item._coord?.y ?? parseFloat(item.map_y) ?? 50,
        label: String(idx + 1),
        nama: item.name || item.nama,
        isGate: false,
      }))
    ];

    // Garis SVG antar titik
    const garisHTML = allPoints.slice(0, -1).map((p, i) => {
      const next = allPoints[i + 1];
      const x1 = (p.x / 100) * MAP_W;
      const y1 = (p.y / 100) * MAP_H;
      const x2 = (next.x / 100) * MAP_W;
      const y2 = (next.y / 100) * MAP_H;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#16a34a" stroke-width="2" stroke-dasharray="6,3" opacity="0.85"/>`;
    }).join('');

    // Titik bernomor SVG
    const titikHTML = allPoints.map((p) => {
      const cx = (p.x / 100) * MAP_W;
      const cy = (p.y / 100) * MAP_H;
      if (p.isGate) {
        return `
          <circle cx="${cx}" cy="${cy}" r="10" fill="#1d4ed8" stroke="white" stroke-width="2"/>
          <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="8" font-weight="bold" fill="white">G</text>
        `;
      }
      return `
        <circle cx="${cx}" cy="${cy}" r="11" fill="#16a34a" stroke="white" stroke-width="2"/>
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="9" font-weight="bold" fill="white">${p.label}</text>
      `;
    }).join('');

    // Legend nama lokasi
    const legendHTML = plan.jadwal.map((item, idx) => `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <div style="width:20px;height:20px;border-radius:50%;background:#16a34a;color:white;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${idx + 1}</div>
        <span style="font-size:11px;color:#374151;">${item.name || item.nama}</span>
      </div>
    `).join('');

    const petaHTML = `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:13px;font-weight:700;color:#1f2937;margin-bottom:8px;">Peta Rute Kunjungan</h2>
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <div style="position:relative;width:${MAP_W}px;height:${MAP_H}px;flex-shrink:0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <img src="${BASE_URL}/peta-kebun-raya-bali.jpg" style="width:100%;height:100%;object-fit:cover;display:block;" />
            <svg style="position:absolute;top:0;left:0;" width="${MAP_W}" height="${MAP_H}" xmlns="http://www.w3.org/2000/svg">
              ${garisHTML}
              ${titikHTML}
            </svg>
          </div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
              <div style="width:20px;height:20px;border-radius:50%;background:#1d4ed8;color:white;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;">G</div>
              <span style="font-size:11px;color:#374151;">Gate 1 (Pintu Masuk)</span>
            </div>
            ${legendHTML}
            <div style="margin-top:8px;display:flex;align-items:center;gap:6px;">
              <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#16a34a" stroke-width="2" stroke-dasharray="6,3"/></svg>
              <span style="font-size:10px;color:#6b7280;">Jalur kunjungan</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const jadwalHTML = plan.jadwal.map((item, idx) => {
      const deskripsi = item.deskripsi
        ? (item.deskripsi.length > 100 ? item.deskripsi.substring(0, 100) + '...' : item.deskripsi)
        : '';
      const garis = idx < plan.jadwal.length - 1
        ? '<div style="width:2px;flex:1;background:#bbf7d0;margin:3px auto;"></div>' : '';
      const vrLink = (item.virtualTour || item.virtualTourId)
        ? `<a href="/virtual-tour?tour_id=${item.virtualTour?.id || item.virtualTourId}" style="display:inline-block;margin-top:6px;font-size:11px;color:#1d4ed8;">Virtual Tour &rarr;</a>` : '';
      return [
        '<div style="display:flex;gap:12px;margin-bottom:10px;">',
          '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">',
            `<div style="width:26px;height:26px;border-radius:50%;background:#16a34a;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">${idx + 1}</div>`,
            garis,
          '</div>',
          '<div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;margin-bottom:2px;">',
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">',
              '<div>',
                `<p style="font-weight:600;font-size:13px;color:#1f2937;margin-bottom:2px;">${item.name || item.nama}</p>`,
                item.gate ? `<p style="font-size:11px;color:#9ca3af;">${item.gate}</p>` : '',
                deskripsi ? `<p style="font-size:11px;color:#6b7280;margin-top:3px;">${deskripsi}</p>` : '',
              '</div>',
              '<div style="text-align:right;flex-shrink:0;">',
                `<p style="font-size:11px;font-weight:700;color:#15803d;">${item.mulai} &ndash; ${item.selesai}</p>`,
                `<p style="font-size:11px;color:#9ca3af;margin-top:2px;">${item.durasiAktual} menit</p>`,
              '</div>',
            '</div>',
            vrLink,
          '</div>',
        '</div>',
      ].join('');
    }).join('');

    const tipsHTML = (plan.tipeTrip === 'solo' ? TIPS_TRIP.solo : TIPS_TRIP.kelompok)
      .map(t => `<li style="margin-bottom:5px;">${t}</li>`).join('');

    win.document.write(`
      <html>
        <head>
          <title>Rencana Kunjungan - Kebun Raya Eka Karya Bali</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px 36px; line-height: 1.5; }
            h1 { font-size: 17px; font-weight: 700; color: #166534; margin-bottom: 4px; }
            h2 { font-size: 13px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
            .subtitle { font-size: 11px; color: #6b7280; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
            .card-green { background: #f0fdf4; border-color: #bbf7d0; }
            .card-amber { background: #fffbeb; border-color: #fde68a; }
            .card-blue { background: #eff6ff; border-color: #bfdbfe; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-top: 10px; }
            .info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 2px; }
            .info-value { font-size: 13px; font-weight: 600; color: #1f2937; }
            .divider { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
            ul { padding-left: 16px; }
            li { font-size: 12px; color: #b45309; }
            .info-list p { font-size: 12px; color: #1e40af; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>Rencana Kunjungan</h1>
          <p class="subtitle">Kebun Raya Eka Karya Bali</p>

          <div class="section card card-green">
            <h2>Informasi Kunjungan</h2>
            <div class="info-grid">
              <div><p class="info-label">Tanggal</p><p class="info-value">${formatTanggal(plan.tanggal)}</p></div>
              <div><p class="info-label">Waktu</p><p class="info-value">${plan.jamMulai} &ndash; ${plan.jamSelesai} WITA</p></div>
              <div><p class="info-label">Tipe</p><p class="info-value">${plan.tipeTrip === 'solo' ? 'Solo Trip' : 'Kelompok'}</p></div>
              <div><p class="info-label">Peserta</p><p class="info-value">${plan.jumlahOrang} orang</p></div>
              <div><p class="info-label">Total Waktu</p><p class="info-value">${Math.floor(plan.totalMenit / 60)} jam ${plan.totalMenit % 60} menit</p></div>
              <div><p class="info-label">Jumlah Lokasi</p><p class="info-value">${plan.jadwal.length} tempat</p></div>
            </div>
            ${plan.catatan ? `<hr class="divider" /><p style="font-size:12px; color:#4b5563; font-style:italic;">${plan.catatan}</p>` : ''}
            ${plan.rasio !== 1 ? `<div style="margin-top:12px; background:${plan.cukupWaktu ? '#eff6ff' : '#fef9c3'}; border:1px solid ${plan.cukupWaktu ? '#bfdbfe' : '#fde047'}; border-radius:6px; padding:8px 12px; font-size:11px; color:${plan.cukupWaktu ? '#1e40af' : '#854d0e'}">${plan.cukupWaktu ? 'Waktu tersedia lebih dari ideal. Durasi tiap lokasi diperpanjang agar mengisi penuh waktu kunjungan.' : 'Waktu tersedia lebih singkat dari ideal. Durasi tiap lokasi telah disesuaikan secara proporsional.'}</div>` : ''}
          </div>

          ${petaHTML}

          <div class="section">
            <h2>Jadwal Kunjungan</h2>
            <p style="font-size:11px; color:#9ca3af; margin-bottom:12px;">Urutan dioptimalkan dari Gate 1 ke lokasi terdekat berikutnya</p>
            ${jadwalHTML}
          </div>

          <div class="section card card-amber">
            <h2 style="color:#92400e; margin-bottom:8px;">Tips ${plan.tipeTrip === 'solo' ? 'Solo Trip' : 'Kelompok'}</h2>
            <ul>${tipsHTML}</ul>
          </div>

          <div class="section card card-blue info-list">
            <h2 style="color:#1e40af; margin-bottom:8px;">Informasi Umum Kebun Raya Eka Karya Bali</h2>
            <p>Jam buka: 08.00 &ndash; 16.00 WITA (setiap hari)</p>
            <p>Tiket masuk: Rp 15.000 (dewasa) / Rp 7.500 (anak-anak)</p>
            <p>Parkir tersedia di area Gate 1</p>
            <p>Bawa payung/jas hujan saat musim hujan</p>
            <p>Gunakan alas kaki yang nyaman untuk berjalan</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-green-700 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">
              {step === 1 ? ' Buat Rencana Kunjungan' : ' Rencana Kunjungan Anda'}
            </h2>
            <p className="text-green-200 text-xs mt-0.5">
              {locations.length} lokasi dipilih
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:text-green-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {step === 1 ? (
            <div className="space-y-4">
              {/* Lokasi terpilih — tampilkan urutan yang sudah dioptimalkan */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Urutan kunjungan (dioptimalkan dari Gate 1)</p>
                <p className="text-xs text-gray-400 mb-2">Sistem mengurutkan otomatis dari lokasi terdekat ke terjauh agar perjalanan lebih efisien</p>
                {/* Ringkasan total estimasi durasi */}
                {(() => {
                  const lokasiUrut = urutkanLokasiTerdekat(locations);
                  const totalEstimasi = lokasiUrut.reduce((sum, loc) => sum + (parseInt(loc.estimasi_durasi) || 30), 0);
                  const adaFallback = lokasiUrut.some(loc => !loc.estimasi_durasi);
                  return (
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-2 text-xs ${
                      adaFallback ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                    }`}>
                      <span className={adaFallback ? 'text-yellow-700' : 'text-green-700'}>
                        ⏱ Total estimasi kunjungan: <strong>{totalEstimasi} menit</strong> ({Math.floor(totalEstimasi / 60)} jam {totalEstimasi % 60} mnt)
                      </span>
                      {adaFallback && (
                        <span className="text-yellow-600 font-medium">*estimasi</span>
                      )}
                    </div>
                  );
                })()}
                <div className="flex flex-col gap-1.5">
                  {urutkanLokasiTerdekat(locations).map((loc, i) => {
                    const durasi = parseInt(loc.estimasi_durasi) || 30;
                    const isFallback = !loc.estimasi_durasi;
                    return (
                      <div key={loc.id || i} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                        <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700 font-medium">{loc.name || loc.nama || loc.lokasi_nama}</span>
                          {loc.gate && <span className="text-xs text-gray-400 ml-1.5">({loc.gate})</span>}
                          {loc.keterangan_durasi && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{loc.keterangan_durasi}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isFallback
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            ⏱ {durasi} mnt
                          </span>
                          {isFallback && (
                            <span className="text-yellow-500" title="Estimasi durasi belum diisi, menggunakan nilai default 30 menit">⚠</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {urutkanLokasiTerdekat(locations).some(loc => !loc.estimasi_durasi) && (
                  <p className="text-xs text-yellow-600 mt-1.5">⚠ Beberapa lokasi belum memiliki estimasi durasi, menggunakan nilai default 30 menit.</p>
                )}
              </div>

              <hr />

              {/* Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    value={form.tanggal}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                    onKeyDown={e => e.preventDefault()}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={form.jamMulai}
                    min={JAM_BUKA}
                    max={JAM_TUTUP}
                    onChange={e => handleJamChange('jamMulai', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.jamMulai ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.jamMulai
                    ? <p className="text-xs text-red-500 mt-1">{errors.jamMulai}</p>
                    : <p className="text-xs text-gray-400 mt-1">Paling awal {JAM_BUKA} WITA</p>
                  }
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={form.jamSelesai}
                    min={form.jamMulai}
                    max={JAM_TUTUP}
                    onChange={e => handleJamChange('jamSelesai', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.jamSelesai ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.jamSelesai
                    ? <p className="text-xs text-red-500 mt-1">{errors.jamSelesai}</p>
                    : <p className="text-xs text-gray-400 mt-1">Paling akhir {JAM_TUTUP} WITA</p>
                  }
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kunjungan</label>
                  <select
                    value={form.tipeTrip}
                    onChange={e => setForm(f => ({
                      ...f,
                      tipeTrip: e.target.value,
                      jumlahOrang: e.target.value === 'solo' ? 1 : (f.jumlahOrang < 2 ? 2 : f.jumlahOrang),
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="solo">Solo Trip</option>
                    <option value="kelompok">Kelompok / Rombongan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.tipeTrip === 'solo' ? 'Jumlah Orang' : 'Jumlah Anggota'}
                  </label>
                  {form.tipeTrip === 'solo' ? (
                    <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                      <span>1 orang</span>
                      <span className="text-xs text-gray-400">(solo trip)</span>
                    </div>
                  ) : (
                      <input
                      type="number"
                      min={2}
                      max={100}
                      value={form.jumlahOrang}
                      onChange={e => setForm(f => ({ ...f, jumlahOrang: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (opsional)</label>
                  <textarea
                    value={form.catatan}
                    onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
                    placeholder="Misal: ada anggota lansia, bawa anak kecil, dll."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!form.tanggal}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                Generate Rencana Kunjungan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Konten yang dicetak */}
              <div id="plan-print" className="space-y-5">

                {/* Header hasil */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="font-bold text-green-800 text-base mb-4">Informasi Kunjungan</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Tanggal</span>
                      <span className="font-medium text-gray-800">{formatTanggal(plan.tanggal)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Waktu</span>
                      <span className="font-medium text-gray-800">{plan.jamMulai} – {plan.jamSelesai} WITA</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Tipe</span>
                      <span className="font-medium text-gray-800">{plan.tipeTrip === 'solo' ? 'Solo Trip' : 'Kelompok'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Peserta</span>
                      <span className="font-medium text-gray-800">{plan.jumlahOrang} orang</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Total Waktu</span>
                      <span className="font-medium text-gray-800">{Math.floor(plan.totalMenit / 60)} jam {plan.totalMenit % 60} menit</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Jumlah Lokasi</span>
                      <span className="font-medium text-gray-800">{plan.jadwal.length} tempat</span>
                    </div>
                  </div>
                  {plan.catatan && (
                    <p className="mt-4 text-xs text-gray-600 italic border-t border-green-100 pt-3">{plan.catatan}</p>
                  )}
                  {plan.rasio !== 1 && (
                    <div className={`mt-4 border rounded-lg px-3 py-2 text-xs ${
                      plan.cukupWaktu
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-yellow-100 border-yellow-300 text-yellow-800'
                    }`}>
                      {plan.cukupWaktu
                        ? 'Waktu tersedia lebih dari ideal. Durasi tiap lokasi diperpanjang agar mengisi penuh waktu kunjungan.'
                        : 'Waktu tersedia lebih singkat dari ideal. Durasi tiap lokasi telah disesuaikan secara proporsional.'
                      }
                    </div>
                  )}
                </div>

                {/* Jadwal per lokasi */}
                <div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">Jadwal Kunjungan</h3>
                  <p className="text-xs text-gray-400 mb-3">Urutan dioptimalkan dari Gate 1 (pintu masuk) ke lokasi terdekat berikutnya</p>
                  <div className="space-y-2">
                    {plan.jadwal.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                        {idx < plan.jadwal.length - 1 && (
                            <div className="flex flex-col items-center">
                              <div className="w-0.5 flex-1 bg-green-200 my-1 min-h-[16px]" />
                              {item.jalanKeBerikutnya > 0 && (
                                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 my-1 whitespace-nowrap">
                                  🚶 {item.jalanKeBerikutnya} mnt
                                </span>
                              )}
                              <div className="w-0.5 flex-1 bg-green-200 my-1 min-h-[8px]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 mb-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{item.name || item.nama}</p>
                              {item.gate && <p className="text-xs text-gray-400 mt-0.5">{item.gate}</p>}
                              {item.keterangan_durasi && (
                                <p className="text-xs text-blue-600 mt-1 flex items-start gap-1">
                                  <span className="flex-shrink-0">ℹ</span>
                                  <span>{item.keterangan_durasi}</span>
                                </p>
                              )}
                              {item.deskripsi && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.deskripsi}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-bold text-green-700">{item.mulai} – {item.selesai}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.durasiAktual} menit</p>
                            </div>
                          </div>
                          {(item.virtualTour || item.virtualTourId) && (
                            <a
                              href={`/virtual-tour?tour_id=${item.virtualTour?.id || item.virtualTourId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                            >
                              Virtual Tour &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-bold text-amber-800 text-sm mb-2">Tips {plan.tipeTrip === 'solo' ? 'Solo Trip' : 'Kelompok'}</h3>
                  <ul className="space-y-1.5">
                    {TIPS_TRIP[plan.tipeTrip].map((tip, i) => (
                      <li key={i} className="text-xs text-amber-700 flex gap-2">
                        <span className="flex-shrink-0">•</span><span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Info umum */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1.5">
                  <p className="font-semibold mb-1">Informasi Umum Kebun Raya Eka Karya Bali</p>
                  <p>Jam buka: 08.00 – 16.00 WITA (setiap hari)</p>
                  <p>Tiket masuk: Rp 15.000 (dewasa) / Rp 7.500 (anak-anak)</p>
                  <p>Parkir tersedia di area Gate 1</p>
                  <p>Bawa payung/jas hujan saat musim hujan</p>
                  <p>Gunakan alas kaki yang nyaman untuk berjalan</p>
                </div>

              </div>{/* end #plan-print */}

              {/* Tombol aksi — di luar plan-print agar tidak ikut tercetak */}
              <div className="flex gap-3 pt-1 border-t border-gray-100">
                <button
                  onClick={() => { setStep(1); setSaved(false); }}
                  className="py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                >
                  Ubah
                </button>
                <button
                  onClick={async () => {
                    if (saved || saving) return;
                    setSaving(true);
                    try {
                      await rencanaKunjunganService.simpan({
                        tanggal: plan.tanggal,
                        jam_mulai: plan.jamMulai,
                        jam_selesai: plan.jamSelesai,
                        tipe_trip: plan.tipeTrip,
                        jumlah_orang: plan.jumlahOrang,
                        catatan: plan.catatan,
                        lokasi_list: plan.jadwal.map(item => ({
                          lokasiId: item.lokasiId || item.id,
                          name: item.name || item.nama,
                          gate: item.gate || '',
                          mulai: item.mulai,
                          selesai: item.selesai,
                          durasiAktual: item.durasiAktual,
                          virtualTourId: item.virtualTourId || item.virtualTour?.id || null,
                        })),
                      });
                      setSaved(true);
                    } catch {
                      alert('Gagal menyimpan rencana');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving || saved}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    saved
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white'
                  }`}
                >
                  {saving ? 'Menyimpan...' : saved ? '✓ Tersimpan' : 'Simpan Rencana'}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Cetak PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
