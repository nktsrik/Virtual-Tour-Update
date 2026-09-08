'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function LocationSidebar({ kategori, selectedLokasi, onLokasiClick }) {
  const [expandedKategori, setExpandedKategori] = useState(null);
  const [lokasiByKategori, setLokasiByKategori] = useState({});

  const toggleKategori = async (kategoriId) => {
    if (expandedKategori === kategoriId) {
      setExpandedKategori(null);
    } else {
      setExpandedKategori(kategoriId);
      
      // Fetch lokasi by kategori if not loaded yet
      if (!lokasiByKategori[kategoriId]) {
        try {
          const response = await api.get(`/lokasi?kategori_id=${kategoriId}`);
          setLokasiByKategori(prev => ({
            ...prev,
            [kategoriId]: response.data.data
          }));
        } catch (error) {
          console.error('Error fetching lokasi:', error);
        }
      }
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg h-[calc(100vh-80px)] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#13511E] mb-6">Kategori Lokasi</h2>
        
        <div className="space-y-4">
          {kategori.map((kat) => (
            <div key={kat.id}>
              <button
                onClick={() => toggleKategori(kat.id)}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition flex justify-between items-center"
              >
                <span className="font-semibold text-[#13511E]">{kat.nama}</span>
                <span className="text-2xl">
                  {expandedKategori === kat.id ? '▼' : '▶'}
                </span>
              </button>

              {expandedKategori === kat.id && lokasiByKategori[kat.id] && (
                <div className="ml-4 mt-2 space-y-2">
                  {lokasiByKategori[kat.id].map((lokasi) => (
                    <button
                      key={lokasi.id}
                      onClick={() => onLokasiClick(lokasi.id)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedLokasi === lokasi.id
                          ? 'bg-[#13511E] text-white'
                          : 'bg-white hover:bg-green-50 border border-gray-200'
                      }`}
                    >
                      {lokasi.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}