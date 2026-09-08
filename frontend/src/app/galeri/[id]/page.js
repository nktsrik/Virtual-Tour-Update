'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { galeriService } from '../../../../lib/services/galeri';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function GaleriDetailPage() {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [artikelLain, setArtikelLain] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadArtikel();
      loadArtikelLain();
    }
  }, [id]);

  const loadArtikel = async () => {
    try {
      const response = await galeriService.getGaleriById(id);
      const data = response.data || response;
      setArtikel(data);
    } catch (error) {
      console.error('Error loading artikel:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtikelLain = async () => {
    try {
      const response = await galeriService.getPublishedGaleri();
      const data = Array.isArray(response) ? response : (response.data || []);
      // Filter artikel lain (bukan yang sedang dibuka), ambil 3
      setArtikelLain(data.filter(item => item.id !== parseInt(id)).slice(0, 3));
    } catch (error) {
      console.error('Error loading artikel lain:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!artikel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <p className="text-xl font-medium mb-4">Artikel tidak ditemukan</p>
        <Link href="/galeri" className="text-green-600 hover:underline">
          ← Kembali ke Galeri
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Image */}
      <div className="relative w-full h-72 md:h-96 overflow-hidden">
        <img
          src={`${API_URL}${artikel.file_path}`}
          alt={artikel.judul}
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/galeri"
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl hover:bg-white/30 transition border border-white/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            {artikel.is_featured && (
              <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
                ⭐ Artikel Unggulan
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              {artikel.judul}
            </h1>
          </div>
        </div>
      </div>

      {/* Konten Artikel */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200">
          {artikel.lokasi_nama && (
            <span className="flex items-center gap-1 text-green-700 font-medium text-sm bg-green-50 px-3 py-1.5 rounded-full">
              📍 {artikel.lokasi_nama}
            </span>
          )}
          <span className="text-gray-400 text-sm">
            🗓️ {formatDate(artikel.created_at)}
          </span>
          {artikel.created_by_nama && (
            <span className="text-gray-400 text-sm">
              ✍️ {artikel.created_by_nama}
            </span>
          )}
        </div>

        {/* Tags */}
        {artikel.tags && (
          <div className="flex flex-wrap gap-2 mb-8">
            {artikel.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="inline-block bg-green-50 text-green-700 border border-green-200 text-xs font-medium px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Isi Artikel */}
        {artikel.deskripsi ? (
          <div
            className="article-content prose max-w-none"
            dangerouslySetInnerHTML={{ __html: artikel.deskripsi }}
          />
        ) : (
          <p className="text-gray-400 italic text-center py-10">
            Tidak ada deskripsi untuk artikel ini.
          </p>
        )}

        <style>{`
          .article-content { color: #374151; font-size: 1rem; line-height: 1.8; }
          .article-content p { margin-bottom: 1rem; color: #374151; }
          .article-content h1 { font-size: 1.875rem; font-weight: 700; color: #166534; margin: 2rem 0 1rem; }
          .article-content h2 { font-size: 1.5rem; font-weight: 700; color: #166534; margin: 1.75rem 0 0.75rem; }
          .article-content h3 { font-size: 1.25rem; font-weight: 600; color: #166534; margin: 1.5rem 0 0.5rem; }
          .article-content strong { font-weight: 700; color: #111827; }
          .article-content em { font-style: italic; color: #4b5563; }
          .article-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
          .article-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
          .article-content li { color: #374151; margin-bottom: 0.25rem; }
          .article-content blockquote { border-left: 4px solid #16a34a; padding-left: 1rem; font-style: italic; color: #4b5563; margin: 1rem 0; }
          .article-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
          .article-content a { color: #16a34a; text-decoration: underline; }
          .article-content img { max-width: 100%; border-radius: 0.5rem; margin: 1rem 0; }
        `}</style>

        {/* Tombol Kembali */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Galeri
          </Link>
        </div>
      </div>

      {/* Artikel Lainnya */}
      {artikelLain.length > 0 && (
        <div className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-1 bg-green-600 rounded"></span>
              <h2 className="text-xl font-bold text-gray-800">Artikel Lainnya</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {artikelLain.map((item) => (
                <Link key={item.id} href={`/galeri/${item.id}`}>
                  <div className="group cursor-pointer">
                    <div className="overflow-hidden rounded-xl mb-3">
                      <img
                        src={`${API_URL}${item.file_path}`}
                        alt={item.judul}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors line-clamp-2 text-sm">
                      {item.judul}
                    </h3>
                    {item.lokasi_nama && (
                      <p className="text-xs text-gray-400 mt-1">📍 {item.lokasi_nama}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
