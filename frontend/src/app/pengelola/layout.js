'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { MdMap, MdImage, MdAdminPanelSettings } from 'react-icons/md';
import Cookies from 'js-cookie';
import { authService } from '../../../lib/services/auth';

export default function PengelolaLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        await authService.getProfile();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        Cookies.remove('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const menuGroups = [
    {
      label: 'Menu',
      items: [
        { name: 'Dashboard', path: '/pengelola', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { name: 'Profil', path: '/pengelola/profil', icon: <FaUserCircle size={20} /> },
      ]
    },
    {
      label: 'Manajemen Konten',
      items: [
        { name: 'Lokasi', path: '/pengelola/lokasi', icon: <MdMap size={20} /> },
        { name: 'Virtual Tour', path: '/pengelola/virtual', icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v6h-2z"/></svg> },
        { name: 'Galeri Media', path: '/pengelola/galeri', icon: <MdImage size={20} /> },
      ]
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#f7f7f7] flex flex-col">
        <div className="h-16 bg-[#13511E] flex items-center px-4">
          <Image src="/logo.jpeg" alt="Kebun Raya Logo" width={150} height={150} className="mr-2" />
        </div>

        {/* Menu Groups */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.label}</p>
              <ul className="px-3 space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link href={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition cursor-pointer
                          ${active ? 'bg-[#16341B] text-white font-semibold' : 'text-[#16341B] hover:bg-gray-200'}`}>
                        <span className={active ? 'text-white' : 'text-[#16341B]'}>{item.icon}</span>
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <main className="flex-1 p-6 overflow-auto bg-white text-[#16341B]">{children}</main>
    </div>
  );
}
