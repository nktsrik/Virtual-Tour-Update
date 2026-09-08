'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const AccessibilityContext = createContext();

// Deskripsi setiap halaman
const PAGE_DESCRIPTIONS = {
  '/': 'Anda berada di halaman utama Kebun Raya Eka Karya Bali. Halaman ini menampilkan informasi umum, lokasi wisata, dan galeri.',
  '/virtual-tour': 'Anda berada di halaman Virtual Tour 360 derajat. Gunakan mouse atau keyboard untuk menjelajahi lokasi.',
  '/galeri': 'Anda berada di halaman Galeri. Halaman ini menampilkan koleksi foto dan media dari Kebun Raya Bali.',
  '/koleksi': 'Anda berada di halaman Koleksi Tanaman. Halaman ini menampilkan koleksi tanaman yang ada di Kebun Raya Bali.',
  '/favorit': 'Anda berada di halaman Favorit. Halaman ini menampilkan virtual tour yang telah Anda simpan.',
  '/login': 'Anda berada di halaman Login. Silakan masukkan email dan password untuk masuk.',
  '/register': 'Anda berada di halaman Registrasi. Silakan isi form untuk membuat akun baru.',
  '/profil': 'Anda berada di halaman Profil. Halaman ini menampilkan informasi akun Anda.',
  '/pengelola': 'Anda berada di dashboard Pengelola Kebun. Halaman ini untuk mengelola konten virtual tour.',
  '/admin': 'Anda berada di dashboard Admin. Halaman ini untuk mengelola seluruh sistem.',
};

export function AccessibilityProvider({ children }) {
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [audioGuide, setAudioGuide] = useState(false);
  const pathname = usePathname();
  const speechRef = useRef(null);
  const isFirstLoad = useRef(true);

  // Load dari localStorage saat pertama kali
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility_fontSize');
    const savedHighContrast = localStorage.getItem('accessibility_highContrast');
    const savedKeyboardNav = localStorage.getItem('accessibility_keyboardNav');
    const savedAudioGuide = localStorage.getItem('accessibility_audioGuide');
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedKeyboardNav) setKeyboardNav(savedKeyboardNav === 'true');
    if (savedAudioGuide) setAudioGuide(savedAudioGuide === 'true');
  }, []);

  // Apply font size ke html element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('font-normal', 'font-large', 'font-xlarge');
    html.classList.add(`font-${fontSize}`);
    localStorage.setItem('accessibility_fontSize', fontSize);
  }, [fontSize]);

  // Apply high contrast ke html element
  useEffect(() => {
    const html = document.documentElement;
    if (highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility_highContrast', highContrast);
  }, [highContrast]);

  // Apply keyboard navigation ke html element
  useEffect(() => {
    const html = document.documentElement;
    if (keyboardNav) {
      html.classList.add('keyboard-nav');
    } else {
      html.classList.remove('keyboard-nav');
    }
    localStorage.setItem('accessibility_keyboardNav', keyboardNav);
  }, [keyboardNav]);

  // Fungsi untuk membacakan teks
  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(v => v.lang === 'id-ID' || v.lang === 'id');
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
      utterance.lang = indonesianVoice.lang;
    } else {
      utterance.lang = 'id-ID';
    }
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop audio
  const stopAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Auto-play audio guide saat pindah halaman
  useEffect(() => {
    localStorage.setItem('accessibility_audioGuide', audioGuide);

    if (!audioGuide) {
      stopAudio();
      return;
    }

    // Skip first load agar tidak langsung berbunyi saat toggle aktif
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const description = PAGE_DESCRIPTIONS[pathname] || `Anda berada di halaman ${pathname.replace('/', '').replace('-', ' ')}.`;

    // Delay sedikit agar halaman sempat render
    const timer = setTimeout(() => {
      speak(description);
    }, 500);

    return () => clearTimeout(timer);
  }, [audioGuide, pathname, speak, stopAudio]);

  return (
    <AccessibilityContext.Provider value={{
      fontSize, setFontSize,
      highContrast, setHighContrast,
      keyboardNav, setKeyboardNav,
      audioGuide, setAudioGuide,
      speak, stopAudio
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
