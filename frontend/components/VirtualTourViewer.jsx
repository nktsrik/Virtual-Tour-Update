'use client';
import { useEffect, useRef, useState } from 'react';

export default function VirtualTourViewer({ imageUrl, hotspots, infoPoints, pitch = 0, yaw = 0, hfov = 100 }) {
  const pannellumInstance = useRef(null);
  const [ready, setReady] = useState(false);
  const containerId = 'pannellum-preview-container';

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (typeof window === 'undefined' || !window.pannellum) return;

    const el = document.getElementById(containerId);
    if (!el || el.offsetWidth === 0 || el.offsetHeight === 0) return;

    if (pannellumInstance.current) {
      pannellumInstance.current.destroy();
      pannellumInstance.current = null;
    }

    pannellumInstance.current = window.pannellum.viewer(containerId, {
      type: 'equirectangular',
      panorama: imageUrl,
      autoLoad: true,
      pitch,
      yaw,
      hfov,
      hotSpots: [
        ...(hotspots || []).map(h => ({ pitch: parseFloat(h.pitch), yaw: parseFloat(h.yaw), type: 'scene', text: h.text, sceneId: h.target_tour_id })),
        ...(infoPoints || []).map(ip => ({ pitch: parseFloat(ip.pitch), yaw: parseFloat(ip.yaw), type: 'info', text: ip.judul, description: ip.deskripsi })),
      ],
      showControls: true,
      mouseZoom: true,
      draggable: true,
      showFullscreenCtrl: false,
      crossOrigin: 'anonymous',
    });

    return () => {
      if (pannellumInstance.current) {
        pannellumInstance.current.destroy();
        pannellumInstance.current = null;
      }
    };
  }, [ready, imageUrl, pitch, yaw, hfov]);

  return (
    <div
      id={containerId}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
