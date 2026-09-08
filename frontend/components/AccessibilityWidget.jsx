'use client';

import { useState } from 'react';
import { useAccessibility } from '../lib/context/AccessibilityContext';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { fontSize, setFontSize, highContrast, setHighContrast, keyboardNav, setKeyboardNav, audioGuide, setAudioGuide, speak, stopAudio } = useAccessibility();

  const fontSizeOptions = [
    { value: 'normal', label: 'Normal', size: 'A', textSize: 'text-sm' },
    { value: 'large', label: 'Besar', size: 'A', textSize: 'text-base' },
    { value: 'xlarge', label: 'Sangat Besar', size: 'A', textSize: 'text-lg' },
  ];

  const resetAll = () => {
    setFontSize('normal');
    setHighContrast(false);
    setKeyboardNav(false);
    setAudioGuide(false);
    stopAudio();
  };

  const toggleOptions = [
    {
      key: 'highContrast',
      label: 'Kontras Tinggi',
      description: 'Tampilan hitam putih kontras',
      value: highContrast,
      onChange: () => setHighContrast(!highContrast),
      icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/>
    },
    {
      key: 'keyboardNav',
      label: 'Navigasi Keyboard',
      description: 'Highlight fokus elemen aktif',
      value: keyboardNav,
      onChange: () => setKeyboardNav(!keyboardNav),
      icon: <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 5H5v-2h2v2zm0-3H5v-2h2v2zm0-3H5V8h2v2zm9 6h-8v-2h8v2zm0-3h-2v-2h2v2zm0-3h-2V8h2v2zm3 6h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
    },
    {
      key: 'audioGuide',
      label: 'Panduan Audio',
      description: 'Bacakan info halaman otomatis',
      value: audioGuide,
      onChange: () => setAudioGuide(!audioGuide),
      icon: <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Panel Settings */}
      {isOpen && (
        <div className="mb-3 bg-white rounded-2xl shadow-2xl border border-gray-200 w-64 overflow-hidden">
          {/* Header Panel */}
          <div className="bg-green-700 px-4 py-3">
            <h3 className="text-white font-bold text-sm">Pengaturan Aksesibilitas</h3>
            <p className="text-green-200 text-xs mt-0.5">Sesuaikan tampilan untuk kenyamanan Anda</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Font Size Section */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Ukuran Teks
              </p>
              <div className="flex gap-2">
                {fontSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFontSize(option.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 transition-all ${
                      fontSize === option.value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    title={option.label}
                  >
                    <span className={`font-bold text-gray-700 ${option.textSize}`}>
                      {option.size}
                    </span>
                    <span className="text-xs text-gray-500">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Toggle Options (High Contrast & Keyboard Nav) */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Tampilan & Navigasi
              </p>
              <div className="space-y-2">
                {toggleOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={option.onChange}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                      option.value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        option.value ? 'bg-green-600' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-5 h-5 ${option.value ? 'text-white' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
                          {option.icon}
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700">{option.label}</p>
                        <p className="text-xs text-gray-400">{option.value ? 'Aktif' : 'Nonaktif'}</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <div className={`w-10 h-6 rounded-full transition-all relative ${
                      option.value ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        option.value ? 'left-5' : 'left-1'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts Info */}
            {keyboardNav && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-700 mb-2">Shortcut Keyboard:</p>
                <div className="space-y-1">
                  {[
                    { key: 'Tab', desc: 'Pindah ke elemen berikutnya' },
                    { key: 'Shift+Tab', desc: 'Pindah ke elemen sebelumnya' },
                    { key: 'Enter/Space', desc: 'Klik elemen aktif' },
                    { key: 'Esc', desc: 'Tutup panel/modal' },
                  ].map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono text-blue-700">
                        {shortcut.key}
                      </kbd>
                      <span className="text-xs text-blue-600">{shortcut.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Guide Info */}
            {audioGuide && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-700 mb-2">🔊 Panduan Audio Aktif</p>
                <p className="text-xs text-green-600 mb-2">Audio akan otomatis berbunyi saat berpindah halaman.</p>
                <button
                  onClick={() => speak('Panduan audio sedang aktif. Audio akan membacakan informasi setiap halaman yang Anda kunjungi.')}
                  className="w-full py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                >
                  🔊 Coba Sekarang
                </button>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={resetAll}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
            >
              Reset Semua ke Default
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="Pengaturan Aksesibilitas"
        aria-label="Buka pengaturan aksesibilitas"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6c1.1 0 2 .9 2 2v5h-1v5h-2v-5H9v-5c0-1.1.9-2 2-2h1z"/>
        </svg>
      </button>
    </div>
  );
}
