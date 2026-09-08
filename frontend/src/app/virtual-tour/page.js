'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { virtualTourService } from '../../../lib/services/virtualTour';
import { getUserFromCookies } from '../../../lib/utils/auth';
import { rencanaKunjunganService } from '../../../lib/services/rencanaKunjungan';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function VirtualTourPage() {
  const [locationGroups, setLocationGroups] = useState([]); // Tours grouped by location
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0); // Current location
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // Current photo in location
  const [loading, setLoading] = useState(true);
  const [pannellumLoaded, setPannellumLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar state
  const [user, setUser] = useState(null); // Current user
  const [rencanaMap, setRencanaMap] = useState({}); // Map of lokasi_id -> lokasi data
  const [rencanaIdMap, setRencanaIdMap] = useState({}); // Map of lokasi_id -> rencana id
  const [isPlayingAudio, setIsPlayingAudio] = useState(false); // Audio playing state
  const [isSpeaking, setIsSpeaking] = useState(false); // Text-to-Speech state
  const viewerRef = useRef(null); // Use ref instead of state for viewer instance
  const audioRef = useRef(null); // Audio player reference
  const speechRef = useRef(null); // Speech synthesis reference

  // Get current location photos with safe access
  const currentLocationPhotos = locationGroups[currentLocationIndex] || [];
  const currentTour = currentLocationPhotos[currentPhotoIndex] || null;
  
  // Navigation state for photos in current location
  const hasNextPhoto = currentPhotoIndex < currentLocationPhotos.length - 1;
  const hasPreviousPhoto = currentPhotoIndex > 0;

  const loadTours = async () => {
    try {
      console.log('🔄 Starting to load tours...');
      setLoading(true);
      
      // Load only PUBLISHED tours for visitors
      const data = await virtualTourService.getPublishedTours();
      const tours = Array.isArray(data) ? data : (data.data || []);
      
      console.log('📦 Loaded PUBLISHED tours:', tours.length, 'tours');
      
      if (tours.length === 0) {
        console.warn('⚠️ No published tours available');
        setLoading(false);
        return;
      }
      
      // Group tours by location
      const grouped = {};
      tours.forEach(tour => {
        const locationKey = tour.lokasi_id || 'no-location';
        if (!grouped[locationKey]) {
          grouped[locationKey] = [];
        }
        grouped[locationKey].push(tour);
      });
      
      // Sort photos within each location by urutan (order)
      const groupedArray = Object.values(grouped).map(locationPhotos => {
        return locationPhotos.sort((a, b) => {
          const orderA = a.urutan || 0;
          const orderB = b.urutan || 0;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return new Date(a.created_at) - new Date(b.created_at);
        });
      });
      
      console.log('📍 Grouped into', groupedArray.length, 'locations');
      
      // Check if there's a tour_id parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const tourId = urlParams.get('tour_id');
      
      let targetLocationIndex = 0;
      let targetPhotoIndex = 0;
      
      if (tourId) {
        console.log('🔍 Looking for tour ID:', tourId);
        // Find the tour with this ID
        let found = false;
        groupedArray.forEach((locationPhotos, locIndex) => {
          const photoIndex = locationPhotos.findIndex(tour => tour.id === parseInt(tourId));
          if (photoIndex !== -1 && !found) {
            targetLocationIndex = locIndex;
            targetPhotoIndex = photoIndex;
            found = true;
            console.log('✅ Found specific tour at location', locIndex, 'photo', photoIndex, 'tour:', locationPhotos[photoIndex].nama);
          }
        });
        
        if (!found) {
          console.warn('⚠️ Tour ID not found:', tourId, 'falling back to first tour');
        }
      }
      
      const firstTour = groupedArray[targetLocationIndex]?.[targetPhotoIndex];
      console.log('🎯 First tour to display:', {
        id: firstTour?.id,
        nama: firstTour?.nama,
        locationIndex: targetLocationIndex,
        photoIndex: targetPhotoIndex
      });
      
      // Set all state in one go
      console.log('📌 Setting location groups and indices...');
      setLocationGroups(groupedArray);
      setCurrentLocationIndex(targetLocationIndex);
      setCurrentPhotoIndex(targetPhotoIndex);
      
      // IMPORTANT: Set loading false IMMEDIATELY after setting state
      // This ensures VR displays right away, favorites load in background
      console.log('✅ State set, removing loading screen...');
      setLoading(false);
      
      // Load user and favorites in background (don't block VR display)
      const currentUser = getUserFromCookies();
      console.log('👤 Current user:', currentUser ? currentUser.email : 'Not logged in');
      setUser(currentUser);
      
          if (currentUser) {
        try {
          const res = await rencanaKunjunganService.getDraft();
          const draft = res.data;
          const map = {};
          if (draft) {
            const list = typeof draft.lokasi_list === 'string' ? JSON.parse(draft.lokasi_list) : (draft.lokasi_list || []);
            list.forEach(loc => { map[loc.lokasiId] = true; });
          }
          setRencanaMap(map);
        } catch { /* ignore */ }
      }
      
    } catch (error) {
      console.error('❌ Error loading tours:', error);
      setLoading(false);
    }
  };

  const handleToggleRencana = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menambahkan ke rencana kunjungan');
      return;
    }
    if (!currentTour) return;

    const lokasiId = currentTour.lokasi_id;
    const sudahAda = rencanaMap[lokasiId];

    if (sudahAda) {
      try {
        await rencanaKunjunganService.removeLokasi(lokasiId);
        setRencanaMap(prev => ({ ...prev, [lokasiId]: false }));
      } catch {
        alert('Gagal menghapus dari rencana kunjungan');
      }
    } else {
      try {
        await rencanaKunjunganService.addLokasi({
          lokasiId,
          name: currentTour.lokasi_nama,
          deskripsi: currentTour.deskripsi || '',
          thumbnail: currentTour.image_path || null,
          virtualTourId: currentTour.id,
        });
        setRencanaMap(prev => ({ ...prev, [lokasiId]: true }));
      } catch {
        alert('Gagal menambahkan ke rencana kunjungan');
      }
    }
  };

  const handlePlayAudio = () => {
    if (!currentTour?.audio_path) {
      alert('Audio tidak tersedia untuk virtual tour ini');
      return;
    }

    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        const audioUrl = currentTour.audio_path.startsWith('/') 
          ? `${API_URL}${currentTour.audio_path}` 
          : currentTour.audio_path;
        
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const handleTextToSpeech = () => {
    // Stop audio file if playing
    if (audioRef.current && isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      alert('Browser Anda tidak mendukung fitur Text-to-Speech');
      return;
    }

    // If already speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Get description text
    let textToSpeak = currentTour?.deskripsi || currentTour?.description;
    
    if (!textToSpeak) {
      alert('Tidak ada deskripsi untuk dibacakan');
      return;
    }

    try {
      const speakText = () => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        
        // Find Indonesian voice or use default
        const indonesianVoice = voices.find(voice => 
          voice.lang === 'id-ID' || voice.lang === 'id'
        );
        
        if (indonesianVoice) {
          utterance.voice = indonesianVoice;
          utterance.lang = indonesianVoice.lang;
        } else {
          utterance.lang = 'id-ID';
        }
        
        // Safe speech settings
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Event handlers
        utterance.onstart = () => {
          console.log('🔊 Speech started');
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log('🔇 Speech ended');
          setIsSpeaking(false);
        };

        utterance.onerror = (error) => {
          setIsSpeaking(false);
          if (error.error !== 'interrupted' && error.error !== 'canceled') {
            console.warn('TTS Error:', error.error);
          }
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };
      
      // Wait for voices to load
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        speakText();
      } else {
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          speakText();
          window.speechSynthesis.onvoiceschanged = null;
        };
        
        // Fallback timeout
        setTimeout(() => {
          if (!isSpeaking) {
            speakText();
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  const navigateToNextPhoto = useCallback(() => {
    if (hasNextPhoto) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  }, [hasNextPhoto]);

  const navigateToPreviousPhoto = useCallback(() => {
    if (hasPreviousPhoto) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  }, [hasPreviousPhoto]);

  const initializePanorama = useCallback((tour) => {
    if (typeof window === 'undefined' || !window.pannellum || !tour) {
      return;
    }

    try {
      // Add transitioning class for smooth fade
      const panoramaEl = document.getElementById('panorama');
      if (panoramaEl) {
        panoramaEl.classList.add('transitioning');
      }

      // Destroy existing viewer to prevent memory leak
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
        } catch (e) {
          console.log('Error destroying viewer:', e);
        }
      }

      // Construct image URL with error handling
      let imageUrl = tour.image_path?.startsWith('/') 
        ? `${API_URL}${tour.image_path}` 
        : tour.image_path;
      
      // Ensure image URL is valid
      if (!imageUrl) {
        console.error('Invalid image path for tour:', tour);
        return;
      }
      
      console.log('Loading panorama:', imageUrl);
      console.log('Navigation state - hasPreviousPhoto:', hasPreviousPhoto, 'hasNextPhoto:', hasNextPhoto);

      // Prepare hotspots for navigation between photos in same location
      const hotSpots = [];
      
      // Add previous photo hotspot (panah mundur - seperti Google Street View)
      if (hasPreviousPhoto) {
        console.log('Adding PREVIOUS photo hotspot (Google Street View style)');
        hotSpots.push({
          pitch: -30, // Ke bawah seperti di jalan/ground (seperti Google Maps)
          yaw: 180,   // Di belakang
          type: 'custom',
          cssClass: 'navigation-hotspot navigation-prev-photo',
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.innerHTML = `
              <div class="nav-tooltip">
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
                </svg>
              </div>
            `;
          },
          clickHandlerFunc: () => {
            console.log('Previous photo hotspot clicked!');
            navigateToPreviousPhoto();
          },
        });
      }

      // Add next photo hotspot (panah maju - seperti Google Street View)
      if (hasNextPhoto) {
        console.log('Adding NEXT photo hotspot (Google Street View style)');
        hotSpots.push({
          pitch: -30, // Ke bawah seperti di jalan/ground (seperti Google Maps)
          yaw: 0,     // Di depan
          type: 'custom',
          cssClass: 'navigation-hotspot navigation-next-photo',
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.innerHTML = `
              <div class="nav-tooltip">
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            `;
          },
          clickHandlerFunc: () => {
            console.log('Next photo hotspot clicked!');
            navigateToNextPhoto();
          },
        });
      }
      
      console.log('Total hotspots created:', hotSpots.length, hotSpots);

      // Initialize viewer with hotspots
      const viewer = window.pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: imageUrl,
        autoLoad: true,
        pitch: parseFloat(tour.pitch) || 0,
        yaw: parseFloat(tour.yaw) || 0,
        hfov: parseFloat(tour.hfov) || 100,
        showControls: true,
        mouseZoom: true,
        compass: true,
        showFullscreenCtrl: true,
        autoRotate: -2,
        autoRotateInactivityDelay: 5000,
        hotSpots: hotSpots,
        // Error handling
        onError: (err) => {
          console.error('Pannellum error:', err);
          if (panoramaEl) {
            panoramaEl.classList.remove('transitioning');
          }
        }
      });

      viewerRef.current = viewer;

      // Remove transitioning class after a short delay
      setTimeout(() => {
        if (panoramaEl) {
          panoramaEl.classList.remove('transitioning');
        }
      }, 500);
    } catch (error) {
      console.error('Error initializing panorama:', error);
      const panoramaEl = document.getElementById('panorama');
      if (panoramaEl) {
        panoramaEl.classList.remove('transitioning');
      }
    }
  }, [hasPreviousPhoto, hasNextPhoto, navigateToNextPhoto, navigateToPreviousPhoto]);

  useEffect(() => {
    loadTours();
    
    // Setup audio element
    const audio = new Audio();
    audio.addEventListener('ended', () => setIsPlayingAudio(false));
    audio.addEventListener('pause', () => setIsPlayingAudio(false));
    audio.addEventListener('play', () => setIsPlayingAudio(true));
    audioRef.current = audio;
    
    return () => {
      // Cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Cleanup speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Reset speech state
      setIsSpeaking(false);
    };
  }, []);

  // Initialize panorama when conditions are met
  useEffect(() => {
    if (!pannellumLoaded) {
      console.log('⏳ Waiting for Pannellum to load...');
      return;
    }
    
    if (locationGroups.length === 0) {
      console.log('⏳ Waiting for location groups...');
      return;
    }
    
    if (!currentTour) {
      console.log('⏳ Waiting for current tour...');
      return;
    }
    
    console.log('🎬 Initializing panorama for tour:', {
      id: currentTour.id,
      nama: currentTour.nama,
      locationIndex: currentLocationIndex,
      photoIndex: currentPhotoIndex
    });
    
    // Stop audio and speech when changing photos
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    initializePanorama(currentTour);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pannellumLoaded, currentTour, currentLocationIndex, currentPhotoIndex]);

  // Set & cleanup body styles untuk fullscreen virtual tour
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    return () => {
      document.body.style.overflow = '';
      document.body.style.margin = '';
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        navigateToPreviousPhoto();
      } else if (e.key === 'ArrowRight') {
        navigateToNextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigateToNextPhoto, navigateToPreviousPhoto]);

  const handleLocationChange = (locationIndex) => {
    const index = parseInt(locationIndex);
    if (index >= 0 && index < locationGroups.length) {
      
      // Stop speech if speaking
      if (window.speechSynthesis && isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      // Stop audio if playing
      if (audioRef.current && isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
      
      setCurrentLocationIndex(index);
      setCurrentPhotoIndex(0); // Reset to first photo
      // Auto-play will be handled by useEffect when currentTour changes
    }
  };

  return (
    <>
      {/* Load Pannellum CSS */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css" 
      />
      
      {/* Custom Navigation Styles */}
      <style jsx global>{`
        .navigation-hotspot {
          width: 60px;
          height: 60px;
          background: rgba(50, 50, 50, 0.7);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          transition: all 0.2s ease;
          border: 3px solid rgba(255, 255, 255, 0.9);
        }

        .navigation-hotspot:hover {
          transform: scale(1.15);
          background: rgba(70, 70, 70, 0.9);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
        }

        .navigation-hotspot .nav-tooltip {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .navigation-hotspot .nav-arrow {
          width: 32px;
          height: 32px;
          stroke: white;
          stroke-width: 3;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        }

        #panorama {
          transition: opacity 0.5s ease-in-out;
        }

        #panorama.transitioning {
          opacity: 0.7;
        }

        /* Sidebar Animations */
        .sidebar-enter {
          transform: translateX(-100%);
        }
        
        .sidebar-enter-active {
          transform: translateX(0);
          transition: transform 0.3s ease-out;
        }
        
        .sidebar-exit {
          transform: translateX(0);
        }
        
        .sidebar-exit-active {
          transform: translateX(-100%);
          transition: transform 0.3s ease-in;
        }

        /* Glass morphism effect */
        .glass-bg {
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-bg-dark {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      
      {/* Load Pannellum JS */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Pannellum loaded');
          setPannellumLoaded(true);
        }}
      />

      {/* Fullscreen Layout */}
      <div className="relative w-screen h-screen overflow-hidden bg-black">
        
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-black z-50">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-green-500 mb-6"></div>
            <div className="text-xl text-white font-medium">Memuat Virtual Tour...</div>
            <div className="text-sm text-gray-400 mt-2">Mohon tunggu sebentar</div>
          </div>
        )}

        {/* No Tours State */}
        {!loading && locationGroups.length === 0 && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-black">
            <svg className="w-32 h-32 text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-2xl text-white font-medium mb-2">Belum Ada Virtual Tour</p>
            <p className="text-gray-400 mb-8">Tidak ada virtual tour yang tersedia saat ini</p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {/* Main Panorama Viewer - Fullscreen */}
        {!loading && locationGroups.length > 0 && (
          <>
            <div
              id="panorama"
              className="w-full h-full"
              style={{
                background: 'linear-gradient(to bottom, #1a1a1a, #000)',
              }}
            />
            
            {/* Pannellum Loading Indicator */}
            {!pannellumLoaded && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-gray-900/95 to-black/95 z-30">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4"></div>
                <div className="text-lg text-white font-medium">Memuat Viewer 360°...</div>
                <div className="text-sm text-gray-400 mt-2">Mohon tunggu sebentar</div>
              </div>
            )}

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/50 to-transparent px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Logo & Back Button */}
                <div className="flex items-center gap-4">
                  <Link 
                    href="/" 
                    className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl transition-all border border-white/20 group"
                  >
                    <svg className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      <span className="text-white font-semibold hidden sm:inline">Kebun Raya Bali</span>
                    </div>
                  </Link>
                  
                  {/* Current Location Title */}
                  {currentTour && (
                    <div className="hidden md:block px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white text-sm font-medium">{currentTour.lokasi_nama || 'Virtual Tour'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                  {/* Photo Counter */}
                  {currentLocationPhotos.length > 1 && (
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <span className="text-white text-sm font-medium">
                        {currentPhotoIndex + 1} / {currentLocationPhotos.length}
                      </span>
                    </div>
                  )}
                  
                  {/* Sidebar Toggle Button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl transition-all flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="text-white font-medium hidden sm:inline">Menu</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Controls - Photo Navigation */}
            {currentLocationPhotos.length > 1 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                <div className="flex items-center gap-4 px-6 py-4 bg-black/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
                  {/* Previous Photo Button */}
                  <button
                    onClick={navigateToPreviousPhoto}
                    disabled={!hasPreviousPhoto}
                    className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all group"
                    title="Foto Sebelumnya (←)"
                  >
                    <svg className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Photo Thumbnails */}
                  <div className="flex items-center gap-2 max-w-md overflow-x-auto px-2">
                    {currentLocationPhotos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`relative flex-shrink-0 w-3 h-3 rounded-full transition-all ${
                          index === currentPhotoIndex 
                            ? 'bg-green-500 w-8' 
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                        title={`Foto ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Next Photo Button */}
                  <button
                    onClick={navigateToNextPhoto}
                    disabled={!hasNextPhoto}
                    className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all group"
                    title="Foto Berikutnya (→)"
                  >
                    <svg className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Left Sidebar - Sliding Panel with Glass Effect */}
            <div className={`absolute top-0 left-0 h-full w-full sm:w-96 glass-bg-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="h-full flex flex-col">
                {/* Sidebar Header */}
                <div className="glass-bg px-6 py-4 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg backdrop-blur-sm">
                      <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-gray-800 font-bold text-lg">Informasi</h2>
                      <p className="text-gray-600 text-xs">Detail Virtual Tour</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Sidebar Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {/* Current Tour Info */}
                  {currentTour && (
                    <div className="p-6 border-b border-white/10">
                      <div className="mb-4">
                        <div className="inline-flex items-center px-3 py-1 bg-green-500/30 text-white rounded-full text-sm font-medium mb-3 backdrop-blur-sm border border-green-400/30">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Panorama 360°
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {currentTour.nama || currentTour.title}
                        </h3>
                        <p className="text-white/90 leading-relaxed mb-4">
                          {currentTour.deskripsi || currentTour.description || 'Jelajahi lokasi ini dalam pengalaman 360 derajat'}
                        </p>

                        {/* Action Buttons - Minimalist Design */}
                        <div className="flex items-center gap-2">
                          {/* Text-to-Speech Button */}
                          <button
                            onClick={handleTextToSpeech}
                            className={`p-3 rounded-lg transition-all ${
                              isSpeaking 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                            title={isSpeaking ? 'Stop Pembacaan' : 'Bacakan Deskripsi'}
                          >
                            {isSpeaking ? (
                              <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-7-8l-5 5H3v4h4l5 5V4z"/>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                              </svg>
                            )}
                          </button>

                          {/* Audio File Button (if available) */}
                          {currentTour.audio_path && (
                            <button
                              onClick={handlePlayAudio}
                              className={`p-3 rounded-lg transition-all ${
                                isPlayingAudio 
                                  ? 'bg-blue-600 hover:bg-blue-700' 
                                  : 'bg-white/10 hover:bg-white/20'
                              }`}
                              title={isPlayingAudio ? 'Pause Audio' : 'Putar Audio'}
                            >
                              {isPlayingAudio ? (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              )}
                            </button>
                          )}

                          {/* Rencana Kunjungan Button - hanya di foto pertama */}
                          {user && currentPhotoIndex === 0 && (
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={handleToggleRencana}
                                className={`p-3 rounded-lg transition-all ${
                                  rencanaMap[currentTour?.lokasi_id]
                                    ? 'bg-green-600 hover:bg-red-600'
                                    : 'bg-white/10 hover:bg-white/20'
                                }`}
                                title={rencanaMap[currentTour?.lokasi_id] ? 'Klik untuk hapus dari Rencana Kunjungan' : 'Tambah ke Rencana Kunjungan'}
                              >
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill={rencanaMap[currentTour?.lokasi_id] ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                              </button>
                              {rencanaMap[currentTour?.lokasi_id] && (
                                <span className="text-xs text-green-300 whitespace-nowrap">Di rencana</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {currentTour.lokasi_nama && (
                        <div className="flex items-center gap-2 text-white/90 mt-4">
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{currentTour.lokasi_nama}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location Selector */}
                  {locationGroups.length > 1 && (
                    <div className="p-6 border-b border-white/10">
                      <label className="block text-sm font-bold text-white mb-3">
                        Pilih Lokasi Lain
                      </label>
                      <select 
                        value={currentLocationIndex} 
                        onChange={(e) => handleLocationChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white font-medium backdrop-blur-sm"
                      >
                        {locationGroups.map((group, index) => (
                          <option key={index} value={index} className="bg-gray-800">
                            {group[0]?.lokasi_nama || group[0]?.nama || `Lokasi ${index + 1}`} ({group.length} foto)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="p-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        <div>
                          <h5 className="font-bold text-white mb-1">Kebun Raya Eka Karya Bali</h5>
                          <p className="text-sm text-white/80">
                            Nikmati pengalaman virtual tour 360° dan jelajahi keindahan koleksi tanaman tropis di Kebun Raya Bali.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay when sidebar is open (for mobile) */}
            {sidebarOpen && (
              <div 
                className="absolute inset-0 bg-black/50 z-40 sm:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
