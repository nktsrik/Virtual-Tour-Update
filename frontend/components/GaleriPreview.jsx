'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { galeriService } from '../lib/services/galeri';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const INITIAL_COUNT = 3;

export default function GaleriPreview() {
  const [galeriItems, setGaleriItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { loadGaleri(); }, []);

  const loadGaleri = async () => {
    try {
      const response = await galeriService.getPublishedGaleri();
      const data = Array.isArray(response) ? response : (response.data || []);
      setGaleriItems(data);
    } catch (error) {
      console.error('Error loading galeri:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#F2E4DB] py-8">
        <div className="max-w-6xl mx-auto px-4 flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Memuat galeri...</div>
        </div>
      </div>
    );
  }

  if (galeriItems.length === 0) return null;

  const displayed = showAll ? galeriItems : galeriItems.slice(0, INITIAL_COUNT);
  const hasMore = galeriItems.length > INITIAL_COUNT;

  return (
    <div id="galeri" className="w-full bg-[#F2E4DB]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <h2 className="text-2xl font-bold text-[#6C584C] mb-2">Galeri & Artikel</h2>
        <div className="h-[5px] w-[250px] rounded-full mb-7"
          style={{ background: "linear-gradient(to right, #6C584C 0 80px, #6C584C66 80px 300px)" }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayed.map((item) => (
            <Link key={item.id} href={`/galeri/${item.id}`}>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                <img
                  src={`${API_URL}${item.file_path}`}
                  alt={item.judul}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = '/CandiKR.jpg'; }}
                />
                <div className="p-4">
                  <h3 className="font-bold text-xl text-[#6C584C] line-clamp-1">{item.judul}</h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{stripHtml(item.deskripsi) || 'Klik untuk melihat selengkapnya'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-6 py-3 bg-[#6C584C] hover:bg-[#5a4a3e] text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg"
            >
              {showAll ? (
                <>
                  <span>Tampilkan Lebih Sedikit</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Lihat Semua Galeri ({galeriItems.length})</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
