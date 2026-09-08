'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function MapPicker({ value, onChange, existingMarkers = [] }) {
  const [marker, setMarker] = useState(
    value?.x && value?.y ? { x: value.x, y: value.y } : null
  );
  const [isEditing, setIsEditing] = useState(!value?.x || !value?.y);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (value?.x && value?.y) {
      setMarker({ x: value.x, y: value.y });
      setIsEditing(false);
    }
  }, [value?.x, value?.y]);

  const handleClick = (e) => {
    if (!isEditing) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(2));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(2));
    setMarker({ x, y });
    onChange({ x, y });
  };

  const handleReset = () => {
    setMarker(null);
    setIsEditing(true);
    onChange({ x: null, y: null });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        {isEditing
          ? 'Klik pada gambar peta untuk menentukan titik lokasi. Titik abu-abu adalah lokasi yang sudah ada.'
          : 'Titik lokasi sudah ditentukan. Klik "Edit Titik" untuk mengubah posisi.'}
      </p>

      <div
        className={`relative w-full border-2 rounded-lg overflow-hidden transition-colors ${
          isEditing
            ? 'border-green-400 cursor-crosshair hover:border-green-600'
            : 'border-gray-300 cursor-not-allowed'
        }`}
        style={{ aspectRatio: '1757/1375' }}
      >
        <Image
          ref={imgRef}
          src="/peta-kebun-raya-bali.jpg"
          alt="Peta Kebun Raya"
          fill
          className="object-contain pointer-events-none select-none"
          priority
        />

        {/* Overlay clickable */}
        <div className="absolute inset-0" onClick={handleClick} />

        {/* Overlay non-editable */}
        {!isEditing && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <span className="bg-white/90 text-gray-600 text-xs px-3 py-1.5 rounded-full shadow font-medium">
              🔒 Klik &quot;Edit Titik&quot; untuk mengubah posisi
            </span>
          </div>
        )}

        {/* Marker lokasi lain yang sudah ada */}
        {existingMarkers.map((em, i) => (
          <div
            key={i}
            style={{ left: `${em.x}%`, top: `${em.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10"
            onMouseEnter={() => setHoveredMarker(i)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            {/* Tooltip nama lokasi */}
            {hoveredMarker === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                  {em.nama}
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 mx-auto" />
              </div>
            )}
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-500 border-2 border-white shadow-md opacity-80">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </span>
          </div>
        ))}

        {/* Marker lokasi saat ini (merah) */}
        {marker && (
          <div
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          >
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
            <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full" />
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow inline-block" />
          <span>Lokasi ini</span>
        </div>
        {existingMarkers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-500 border border-white shadow inline-block opacity-80" />
            <span>{existingMarkers.length} lokasi sudah ada (hover untuk nama)</span>
          </div>
        )}
      </div>

      {/* Koordinat & Tombol */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1">
          {marker ? (
            <>
              <span className="text-green-600 font-semibold">✓ Titik dipilih:</span>
              <span>X: <b>{marker.x}%</b></span>
              <span>Y: <b>{marker.y}%</b></span>
            </>
          ) : (
            <span className="text-gray-400">Belum ada titik — klik peta di atas</span>
          )}
        </div>
        {marker && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-2 rounded-lg transition-colors"
          >
            Edit Titik
          </button>
        )}
        {marker && isEditing && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-2 rounded-lg transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
