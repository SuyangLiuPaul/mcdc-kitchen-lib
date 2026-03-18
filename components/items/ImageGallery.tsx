"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {/* Main image */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={images[activeIndex]}
          alt={title}
          fill
          className="object-cover transition-opacity duration-200"
          priority
        />
      </div>

      {/* Clickable thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                i === activeIndex
                  ? "border-indigo-500 shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              <Image src={url} alt={`${title} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
