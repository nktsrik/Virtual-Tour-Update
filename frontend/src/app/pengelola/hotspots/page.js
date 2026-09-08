'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState([]);
  const [virtualTours, setVirtualTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load virtual tours for dropdown
      const toursResponse = await fetch('http://localhost:5000/api/virtual-tour');
      const toursResult = await toursResponse.json();
      if (toursResult.success) {
        setVirtualTours(toursResult.data || []);
      }

      // Load hotspots
      const hotspotsResponse = await fetch('http://localhost:5000/api/hotspot');
      const hotspotsResult = await hotspotsResponse.json();
      if (hotspotsResult.success) {
        setHotspots(hotspotsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/pengelola" className="text-green-600 hover:text-green-700 text-sm">
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#16341B] mt-1">Kelola Hotspots</h1>
          <p className="text-gray-600">Tambah navigasi antar virtual tour</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#16341B] text-white px-4 py-2 rounded-lg hover:bg-green-800"
        >
          + Tambah Hotspot
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Memuat data...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotspot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navigasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hotspots.length > 0 ? (
                hotspots.map((hotspot) => (
                  <tr key={hotspot.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{hotspot.title}</div>
                      <div className="text-sm text-gray-500">{hotspot.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Dari: {hotspot.source_tour_title}</div>
                      <div className="text-sm text-gray-500">Ke: {hotspot.target_tour_title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    <div className="mb-4">Belum ada hotspot.</div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Tambah Hotspot Pertama
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}