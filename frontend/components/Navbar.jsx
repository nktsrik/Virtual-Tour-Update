'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const NAV_LINK = 'px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all';
const NAV_LINK_ACTIVE = 'px-2.5 py-1 rounded-lg text-xs font-medium text-green-700 bg-green-50';
const DROPDOWN_ITEM = 'flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors text-left';
const DROPDOWN_ITEM_DANGER = 'flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left';

const navLinks = [
  { href: '/', label: 'Beranda', exact: true },
  { href: '/#lokasi', label: 'Lokasi', exact: false },
  { href: '/#galeri', label: 'Galeri', exact: false },
  { href: '/#tentang', label: 'Tentang', exact: false },
];

function UserDropdown({ userName, color = 'bg-green-600', children, isOpen, onToggle, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={onToggle} className="flex items-center gap-2.0 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
        <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-white text-xs font-medium`}>{userName.charAt(0).toUpperCase()}</div>
        <span className="max-w-[100px] truncate">{userName}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">{children}</div>}
    </div>
  );
}

export default function Navbar() {
  const [isLogin, setIsLogin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = Cookies.get('token');
    const userDataStr = Cookies.get('user');
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const timer = setTimeout(() => {
          setIsLogin(true);
          setUserRole(userData.role_name || userData.role || 'visitor');
          setUserName(userData.nama || userData.name || userData.email || 'User');
        }, 0);
        return () => clearTimeout(timer);
      } catch {
        const timer = setTimeout(() => setIsLogin(false), 0);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => setIsLogin(false), 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setIsLogin(false);
    setUserRole(null);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    window.location.href = '/';
  };

  const isActive = (href, exact) => (exact ? pathname === href : false);

  return (
    <nav className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="w-[90%] max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-1">
          {/* MOBILE TOGGLE */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          {/* DESKTOP MENU — rata kanan */}
          <div className="hidden md:flex items-center justify-end w-full gap-1 py-0.5">
            {/* Nav links */}
            {navLinks.map(({ href, label, exact }) => (
              <Link key={href} href={href} className={isActive(href, exact) ? NAV_LINK_ACTIVE : NAV_LINK}>
                {label}
              </Link>
            ))}

            <div className="w-px h-5 bg-gray-200 mx-2" />

            {/* Pesan Tiket */}
            <a href="https://tiketkebunraya.id/" target="_blank" rel="noopener noreferrer" className={NAV_LINK + ' flex items-center gap-1'}>
              Pesan Tiket
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>

            <div className="w-px h-5 bg-gray-200 mx-2" />

            {/* Belum login */}
            {!isLogin && (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-all">
                  Masuk / Daftar
                  <svg className={`w-3.5 h-3.5 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
                    <Link href="/login" onClick={() => setIsUserDropdownOpen(false)} className={DROPDOWN_ITEM}>
                      Masuk
                    </Link>
                    <div className="h-px bg-gray-100 mx-3" />
                    <Link href="/register" onClick={() => setIsUserDropdownOpen(false)} className={DROPDOWN_ITEM}>
                      Daftar
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Visitor */}
            {isLogin && userRole === 'visitor' && (
              <>
                <Link href="/favorit" className={pathname === '/favorit' ? NAV_LINK_ACTIVE : NAV_LINK}>
                  Rencana Kunjungan
                </Link>
                <UserDropdown userName={userName} isOpen={isUserDropdownOpen} onToggle={() => setIsUserDropdownOpen(!isUserDropdownOpen)} dropdownRef={dropdownRef}>
                  <Link href="/profil" onClick={() => setIsUserDropdownOpen(false)} className={DROPDOWN_ITEM}>
                    Profil Saya
                  </Link>
                  <div className="h-px bg-gray-100 mx-3" />
                  <button onClick={handleLogout} className={DROPDOWN_ITEM_DANGER}>
                    Keluar
                  </button>
                </UserDropdown>
              </>
            )}

            {/* Admin */}
            {isLogin && userRole === 'admin' && (
              <>
                <Link href="/admin" className={pathname?.startsWith('/admin') ? NAV_LINK_ACTIVE : NAV_LINK}>
                  Dashboard Admin
                </Link>
                <UserDropdown userName={userName} isOpen={isUserDropdownOpen} onToggle={() => setIsUserDropdownOpen(!isUserDropdownOpen)} dropdownRef={dropdownRef}>
                  <button onClick={handleLogout} className={DROPDOWN_ITEM_DANGER}>
                    Keluar
                  </button>
                </UserDropdown>
              </>
            )}

            {/* Pengelola */}
            {isLogin && userRole === 'pengelola' && (
              <>
                <Link href="/pengelola" className={pathname?.startsWith('/pengelola') ? NAV_LINK_ACTIVE : NAV_LINK}>
                  Dashboard Pengelola
                </Link>
                <UserDropdown userName={userName} isOpen={isUserDropdownOpen} onToggle={() => setIsUserDropdownOpen(!isUserDropdownOpen)} dropdownRef={dropdownRef}>
                  <button onClick={handleLogout} className={DROPDOWN_ITEM_DANGER}>
                    Keluar
                  </button>
                </UserDropdown>
              </>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all ${isActive(href, exact) ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}
              >
                {label}
              </Link>
            ))}

            <div className="h-px bg-gray-100 my-1" />

            <a
              href="https://tiketkebunraya.id/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all"
            >
              Pesan Tiket ↗
            </a>

            <div className="h-px bg-gray-100 my-1" />

            {!isLogin && (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all">
                  Masuk
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all">
                  Daftar
                </Link>
              </>
            )}

            {isLogin && (
              <>
                <div className="px-4 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium">{userName.charAt(0).toUpperCase()}</div>
                  <span className="text-base font-medium text-gray-700 truncate">{userName}</span>
                </div>

                {userRole === 'visitor' && (
                  <>
                    <Link
                      href="/favorit"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all ${pathname === '/favorit' ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}
                    >
                      Rencana Kunjungan
                    </Link>
                    <Link
                      href="/profil"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all ${pathname === '/profil' ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}
                    >
                      Profil Saya
                    </Link>
                  </>
                )}

                {userRole === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all ${pathname?.startsWith('/admin') ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    Dashboard Admin
                  </Link>
                )}

                {userRole === 'pengelola' && (
                  <Link
                    href="/pengelola"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all ${pathname?.startsWith('/pengelola') ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    Dashboard Pengelola
                  </Link>
                )}

                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all">
                  Keluar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
