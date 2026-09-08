'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InfoPointsPage() {
  const [infoPoints, setInfoPoints] = useState([]);
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

      // Load info points
      const infoResponse = await fetch('http://localhost:5000/api/info-point');
      const infoResult = await infoResponse.json();
      if (infoResult.success) {
        setInfoPoints(infoResult.data || []);
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
          <h1 className="text-3xl font-bold text-[#16341B] mt-1">Kelola Info Points</h1>
          <p className="text-gray-600">Tambah informasi detail pada virtual tour</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#16341B] text-white px-4 py-2 rounded-lg hover:bg-green-800"
        >
          + Tambah Info Point
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info Point</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Virtual Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {infoPoints.length > 0 ? (
                infoPoints.map((point) => (
                  <tr key={point.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{point.title}</div>
                      <div className="text-sm text-gray-500">{point.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{point.virtual_tour_title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        point.type === 'text' ? 'bg-blue-100 text-blue-800' :
                        point.type === 'image' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {point.type}
                      </span>
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
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="mb-4">Belum ada info point.</div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Tambah Info Point Pertama
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