"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const galleryImages = [
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop",
];

export default function VisualGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
        setFade(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-96 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-800 shadow-2xl shadow-black/40">
      {galleryImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-300 ${
            index === currentIndex && fade ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={`Joyería ARNOLUX ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>
      ))}

      {/* Indicadores de puntos */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {galleryImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setFade(false);
              setTimeout(() => {
                setCurrentIndex(index);
                setFade(true);
              }, 300);
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-6 bg-amber-300"
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Overlay de texto */}
      <div className="absolute inset-0 flex items-end justify-start p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-200">
            Colección ARNOLUX
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            El brillo de un legado
          </p>
        </div>
      </div>
    </div>
  );
}
