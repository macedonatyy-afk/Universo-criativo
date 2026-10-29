'use client';

import { useEffect, useState } from 'react';

export default function HalloweenCurtains() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false);
      return;
    }
    try {
      if (sessionStorage.getItem('halloween-abertura')) {
        setVisible(false);
        return;
      }
      sessionStorage.setItem('halloween-abertura', 'vista');
    } catch {
      // The animation still finishes if browser storage is unavailable.
    }
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className="cortinas-abertura" aria-hidden="true">
      <div className="cortina cortina-esquerda" />
      <div className="cortina cortina-direita" />
    </div>
  );
}
